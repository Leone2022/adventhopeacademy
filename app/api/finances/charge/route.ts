import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/finances/charge - Add a charge/fee to a student account
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
    const { studentId, amount, description, notes } = body;

    if (!studentId || !amount || amount <= 0 || !description) {
      return NextResponse.json(
        { error: 'Student ID, amount (>0), and description are required' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { account: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Create account if doesn't exist
    let studentAccount = student.account;
    if (!studentAccount) {
      studentAccount = await prisma.studentAccount.create({
        data: {
          studentId: student.id,
          balance: 0,
        },
      });
    }

    const balanceBefore = Number(studentAccount.balance || 0);
    const balanceAfter = balanceBefore + parseFloat(amount);

    const result = await prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.studentAccount.update({
        where: { id: studentAccount!.id },
        data: { balance: balanceAfter },
      });

      const transaction = await tx.transaction.create({
        data: {
          studentAccountId: studentAccount!.id,
          type: 'CHARGE',
          amount: parseFloat(amount),
          balanceBefore,
          balanceAfter,
          description,
          processedBy: session.user.id,
          notes: notes || null,
        },
      });

      return { transaction, account: updatedAccount };
    });

    return NextResponse.json({
      message: 'Charge recorded successfully',
      newBalance: Number((result.account as any).balance),
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Error recording charge:', error);
    return NextResponse.json(
      { error: 'Failed to record charge' },
      { status: 500 }
    );
  }
}
