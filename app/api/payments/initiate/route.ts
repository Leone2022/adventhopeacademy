import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentGatewayFactory } from '@/lib/payment-gateway';
import { PaymentGateway, PaymentMethod, TransactionType } from '@prisma/client';
import { hasPermission, UserRole } from '@/lib/roles';

/**
 * POST /api/payments/initiate
 * Initiate an online payment through a payment gateway
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, amount, gateway, currency = 'USD' } = body;

    // Validate required fields
    if (!studentId || !amount || !gateway) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, amount, gateway' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if gateway is supported
    if (!PaymentGatewayFactory.isGatewaySupported(gateway)) {
      return NextResponse.json(
        { error: `Payment gateway ${gateway} is not supported` },
        { status: 400 }
      );
    }

    // Get student and account
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        account: true,
        school: true,
        user: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const userRole = session.user.role as UserRole;
    const isParent = userRole === 'PARENT';
    const isStudent = userRole === 'STUDENT';

    if (isParent) {
      // Verify parent relationship
      const parentProfile = await prisma.parent.findUnique({
        where: { userId: session.user.id },
        include: {
          students: {
            where: { studentId },
          },
        },
      });

      if (!parentProfile || parentProfile.students.length === 0) {
        return NextResponse.json(
          { error: 'You do not have access to this student' },
          { status: 403 }
        );
      }
    } else if (isStudent) {
      // Students can only pay for themselves
      if (student.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only make payments for yourself' },
          { status: 403 }
        );
      }
    } else {
      // Staff must have appropriate permissions
      if (!hasPermission(userRole, 'finances.manage')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Ensure student has an account
    let studentAccount = student.account;
    if (!studentAccount) {
      studentAccount = await prisma.studentAccount.create({
        data: {
          studentId,
          balance: 0,
        },
      });
    }

    // Generate receipt number
    const receiptCount = await prisma.payment.count();
    const receiptNumber = `RCP${new Date().getFullYear()}${String(
      receiptCount + 1
    ).padStart(5, '0')}`;

    // Determine payment method based on gateway
    let paymentMethod: PaymentMethod;
    switch (gateway) {
      case PaymentGateway.STRIPE:
        paymentMethod = PaymentMethod.CARD;
        break;
      case PaymentGateway.PAYPAL:
        paymentMethod = PaymentMethod.OTHER;
        break;
      case PaymentGateway.PAYNOW:
        paymentMethod = PaymentMethod.PAYNOW;
        break;
      default:
        paymentMethod = PaymentMethod.OTHER;
    }

    // Get parent ID if applicable
    let parentId: string | undefined;
    if (isParent) {
      const parentProfile = await prisma.parent.findUnique({
        where: { userId: session.user.id },
      });
      parentId = parentProfile?.id;
    }

    // Create pending transaction and payment records
    const currentBalance = Number(studentAccount.balance || 0);
    const newBalance = currentBalance - amount; // Payment reduces balance

    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          studentAccountId: studentAccount!.id,
          type: TransactionType.PAYMENT,
          amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: 'Online payment via payment gateway',
          paymentMethod,
          processedBy: session.user.id,
          processedAt: new Date(),
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          transactionId: transaction.id,
          parentId,
          receiptNumber,
          amount,
          paymentMethod,
          status: 'Pending',
        },
      });

      return { transaction, payment };
    });

    // Build callback and return URLs
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/parent/payments/status?paymentId=${result.payment.id}`;
    const callbackUrl = `${baseUrl}/api/payments/callback/${gateway.toLowerCase()}`;

    // Initiate payment with gateway
    const provider = PaymentGatewayFactory.getProvider(gateway);
    const gatewayResponse = await provider.initiatePayment({
      studentId,
      amount,
      currency,
      gateway,
      returnUrl,
      callbackUrl,
      metadata: {
        paymentId: result.payment.id,
        transactionId: result.transaction.id,
        studentId,
        receiptNumber,
        schoolId: student.schoolId,
      },
    });

    // Create gateway transaction record
    await prisma.paymentGatewayTransaction.create({
      data: {
        paymentId: result.payment.id,
        gateway,
        gatewayRef: gatewayResponse.gatewayTransactionId,
        amount,
        currency,
        status: gatewayResponse.status,
        callbackUrl,
        returnUrl,
        metadata: {
          studentId,
          schoolId: student.schoolId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: result.payment.id,
      paymentUrl: gatewayResponse.paymentUrl,
      receiptNumber,
      expiresAt: gatewayResponse.expiresAt,
      message: 'Payment initiated successfully. Redirecting to payment gateway...',
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate payment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/initiate
 * Get available payment gateways
 */
export async function GET() {
  try {
    const gateways = PaymentGatewayFactory.getSupportedGateways();
    
    // Check which gateways are actually configured
    const configured = gateways.filter((gateway) => {
      switch (gateway) {
        case PaymentGateway.STRIPE:
          return !!process.env.STRIPE_SECRET_KEY;
        case PaymentGateway.PAYPAL:
          return !!process.env.PAYPAL_CLIENT_ID;
        case PaymentGateway.PAYNOW:
          return !!process.env.PAYNOW_INTEGRATION_ID;
        default:
          return false;
      }
    });

    return NextResponse.json({
      available: gateways,
      configured,
    });
  } catch (error: any) {
    console.error('Error fetching payment gateways:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment gateways' },
      { status: 500 }
    );
  }
}
