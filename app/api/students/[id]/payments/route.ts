import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/students/[id]/payments - Record a payment for student
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { amount, paymentMethod, description, proofOfPayment, reference, bankReference, mobileMoneyRef, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Get student with account
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: { account: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!student.account) {
      return NextResponse.json(
        { error: 'Student account not found' },
        { status: 404 }
      );
    }

    // Check school access
    if (session.user.role !== 'SUPER_ADMIN' && student.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const balanceBefore = Number(student.account.balance || 0);
    const balanceAfter = balanceBefore - parseFloat(amount);

    // Generate receipt number
    const year = new Date().getFullYear();
    const lastPayment = await prisma.payment.findFirst({
      where: {
        receiptNumber: { startsWith: `RCP${year}` },
      },
      orderBy: { receiptNumber: 'desc' },
    });

    let sequence = 1;
    if (lastPayment) {
      const lastSeq = parseInt(lastPayment.receiptNumber.slice(-5));
      sequence = lastSeq + 1;
    }
    const receiptNumber = `RCP${year}${sequence.toString().padStart(5, '0')}`;

    // Create transaction and payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update student account balance
      const updatedAccount = await tx.studentAccount.update({
        where: { id: student.account!.id },
        data: {
          balance: balanceAfter,
          lastPaymentDate: new Date(),
          lastPaymentAmount: parseFloat(amount),
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          studentAccountId: student.account!.id,
          type: 'PAYMENT',
          amount: parseFloat(amount),
          balanceBefore,
          balanceAfter,
          description: description || `Payment received - ${paymentMethod}`,
          reference: reference || receiptNumber,
          paymentMethod,
          proofOfPayment: proofOfPayment || null,
          bankReference: bankReference || null,
          mobileMoneyRef: mobileMoneyRef || null,
          processedBy: session.user.id,
          notes: notes || null,
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          transactionId: transaction.id,
          receiptNumber,
          amount: parseFloat(amount),
          paymentMethod,
          notes: notes || null,
        },
      });

      return { transaction, payment, account: updatedAccount };
    });

    return NextResponse.json({
      message: 'Payment recorded successfully',
      receiptNumber: result.payment.receiptNumber,
      newBalance: result.account.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}

// GET /api/students/[id]/payments - Get payment history for student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        account: {
          include: {
            transactions: {
              orderBy: { processedAt: 'desc' },
              include: {
                payment: true,
              },
            },
            invoices: {
              orderBy: { issueDate: 'desc' },
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check access
    if (session.user.role !== 'SUPER_ADMIN' && student.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate fee summary
    const totalCharges = student.account?.transactions
      .filter(t => t.type === 'CHARGE')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0) || 0;

    const totalPayments = student.account?.transactions
      .filter(t => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0) || 0;

    return NextResponse.json({
      account: student.account,
      summary: {
        totalCharges,
        totalPayments,
        currentBalance: Number(student.account?.balance || 0),
        percentagePaid: totalCharges > 0 ? Math.round((totalPayments / totalCharges) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
