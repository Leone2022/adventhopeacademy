import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/finances/reverse
 * Reverse a transaction (charge or payment) - creates a counter-transaction
 */
export async function POST(request: NextRequest) {
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
    const { transactionId, reason } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Get the original transaction
    const originalTxn = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        studentAccount: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                studentNumber: true,
              },
            },
          },
        },
      },
    });

    if (!originalTxn) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if already reversed (look for a reversal reference)
    const existingReversal = await prisma.transaction.findFirst({
      where: {
        reference: `REV-${transactionId}`,
      },
    });

    if (existingReversal) {
      return NextResponse.json(
        { error: 'This transaction has already been reversed' },
        { status: 400 }
      );
    }

    const originalAmount = Number(originalTxn.amount);
    const currentBalance = Number(originalTxn.studentAccount.balance);

    // Determine reversal type and new balance
    let newBalance: number;
    let reversalType: string;
    let reversalDesc: string;

    if (originalTxn.type === 'CHARGE') {
      // Reversing a charge = subtract from balance
      newBalance = currentBalance - originalAmount;
      reversalType = 'ADJUSTMENT';
      reversalDesc = `Reversal of charge: ${originalTxn.description}`;
    } else if (originalTxn.type === 'PAYMENT') {
      // Reversing a payment = add back to balance
      newBalance = currentBalance + originalAmount;
      reversalType = 'ADJUSTMENT';
      reversalDesc = `Reversal of payment: ${originalTxn.description}`;
    } else {
      // For other types (ADJUSTMENT, REFUND, etc.)
      newBalance = currentBalance - originalAmount;
      reversalType = 'ADJUSTMENT';
      reversalDesc = `Reversal: ${originalTxn.description}`;
    }

    // Create reversal transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.studentAccount.update({
        where: { id: originalTxn.studentAccountId },
        data: { balance: newBalance },
      });

      const reversal = await tx.transaction.create({
        data: {
          studentAccountId: originalTxn.studentAccountId,
          type: reversalType as any,
          amount: originalAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: reversalDesc,
          reference: `REV-${transactionId}`,
          processedBy: session.user.id,
          notes: reason || `Reversed by ${session.user.name || session.user.email}`,
        },
      });

      return { reversal, account: updatedAccount };
    });

    return NextResponse.json({
      message: 'Transaction reversed successfully',
      newBalance: Number((result.account as any).balance),
      reversalTransaction: result.reversal,
      student: {
        name: `${originalTxn.studentAccount.student.firstName} ${originalTxn.studentAccount.student.lastName}`,
        studentNumber: originalTxn.studentAccount.student.studentNumber,
      },
    });
  } catch (error: any) {
    console.error('Error reversing transaction:', error);
    return NextResponse.json(
      { error: 'Failed to reverse transaction', details: error.message },
      { status: 500 }
    );
  }
}
