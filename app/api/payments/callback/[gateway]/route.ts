import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentGatewayFactory } from '@/lib/payment-gateway';
import { PaymentGateway, PaymentGatewayStatus } from '@prisma/client';

interface RouteParams {
  params: {
    gateway: string;
  };
}

/**
 * POST /api/payments/callback/[gateway]
 * Handle payment gateway callbacks/webhooks
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const gatewayName = params.gateway.toUpperCase() as PaymentGateway;

    // Validate gateway
    if (!PaymentGatewayFactory.isGatewaySupported(gatewayName)) {
      return NextResponse.json(
        { error: `Gateway ${gatewayName} is not supported` },
        { status: 400 }
      );
    }

    // Get the gateway provider
    const provider = PaymentGatewayFactory.getProvider(gatewayName);

    // Get signature header (for verification)
    const signature = req.headers.get('stripe-signature') || 
                     req.headers.get('x-paypal-transmission-sig') ||
                     '';

    // Parse webhook data
    const rawBody = await req.text();
    const webhookData = {
      body: rawBody,
      headers: Object.fromEntries(req.headers.entries()),
    };

    // Verify and parse callback
    const callbackData = await provider.verifyCallback(webhookData, signature);

    // Find the gateway transaction
    const gatewayTransaction = await prisma.paymentGatewayTransaction.findFirst({
      where: {
        gatewayRef: callbackData.gatewayRef || callbackData.gatewayTransactionId,
      },
      include: {
        payment: {
          include: {
            transaction: {
              include: {
                studentAccount: {
                  include: {
                    student: {
                      include: {
                        user: true,
                        school: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!gatewayTransaction) {
      console.error('Gateway transaction not found:', callbackData.gatewayTransactionId);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update gateway transaction status
    await prisma.paymentGatewayTransaction.update({
      where: { id: gatewayTransaction.id },
      data: {
        status: callbackData.status,
        gatewayRef: callbackData.gatewayRef,
        completedAt: callbackData.status === PaymentGatewayStatus.COMPLETED 
          ? new Date() 
          : undefined,
        failedAt: callbackData.status === PaymentGatewayStatus.FAILED 
          ? new Date() 
          : undefined,
        errorMessage: callbackData.errorMessage,
        metadata: callbackData.metadata as any,
      },
    });

    // If payment completed, update student account
    if (callbackData.status === PaymentGatewayStatus.COMPLETED) {
      const payment = gatewayTransaction.payment;
      const transaction = payment.transaction;
      const studentAccount = transaction.studentAccount;

      await prisma.$transaction(async (tx) => {
        // Update student account balance
        await tx.studentAccount.update({
          where: { id: studentAccount.id },
          data: {
            balance: transaction.balanceAfter,
            lastPaymentDate: new Date(),
            lastPaymentAmount: payment.amount,
          },
        });

        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'Verified',
            verifiedAt: new Date(),
            verifiedBy: 'SYSTEM',
            bankReference: callbackData.gatewayRef,
          },
        });
      });

      // Send receipt email (optional - implement email service)
      try {
        const { sendReceiptEmail } = await import('@/lib/email');
        await sendReceiptEmail({
          to: studentAccount.student.user?.email || '',
          studentName: `${studentAccount.student.firstName} ${studentAccount.student.lastName}`,
          amount: payment.amount.toNumber(),
          receiptNumber: payment.receiptNumber,
          paymentMethod: payment.paymentMethod,
          date: new Date(),
        });
      } catch (emailError) {
        console.error('Failed to send receipt email:', emailError);
        // Don't fail the webhook if email fails
      }
    }

    // If payment failed, update status
    if (callbackData.status === PaymentGatewayStatus.FAILED) {
      await prisma.payment.update({
        where: { id: gatewayTransaction.payment.id },
        data: {
          status: 'Rejected',
          rejectionReason: callbackData.errorMessage || 'Payment failed at gateway',
        },
      });
    }

    return NextResponse.json({
      success: true,
      received: true,
      status: callbackData.status,
    });
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      {
        error: 'Callback processing failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/callback/[gateway]
 * Handle redirect-based payment confirmations (not webhooks)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(req.url);
    const gatewayName = params.gateway.toUpperCase() as PaymentGateway;

    // Get gateway-specific parameters
    const sessionId = searchParams.get('session_id') || 
                     searchParams.get('paymentId') ||
                     searchParams.get('transaction_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing payment session ID' },
        { status: 400 }
      );
    }

    // Query gateway for payment status
    if (!PaymentGatewayFactory.isGatewaySupported(gatewayName)) {
      return NextResponse.json(
        { error: `Gateway ${gatewayName} is not supported` },
        { status: 400 }
      );
    }

    const provider = PaymentGatewayFactory.getProvider(gatewayName);
    const status = await provider.queryPaymentStatus(sessionId);

    // Find and update transaction
    const gatewayTransaction = await prisma.paymentGatewayTransaction.findFirst({
      where: {
        gateway: gatewayName,
        gatewayRef: sessionId,
      },
    });

    if (gatewayTransaction) {
      await prisma.paymentGatewayTransaction.update({
        where: { id: gatewayTransaction.id },
        data: {
          status,
          completedAt: status === PaymentGatewayStatus.COMPLETED 
            ? new Date() 
            : undefined,
        },
      });

      // Redirect to status page
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${baseUrl}/parent/payments/status?paymentId=${gatewayTransaction.paymentId}&status=${status}`
      );
    }

    return NextResponse.json({
      success: true,
      status,
      sessionId,
    });
  } catch (error: any) {
    console.error('Payment callback GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback' },
      { status: 500 }
    );
  }
}
