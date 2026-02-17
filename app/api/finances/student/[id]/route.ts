import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/finances/student/[id] - Get student financial details
export async function GET(
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

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentNumber: true,
        curriculum: true,
        status: true,
        currentClass: {
          select: { name: true },
        },
        account: {
          include: {
            transactions: {
              orderBy: { processedAt: 'desc' },
              include: {
                payment: {
                  select: { receiptNumber: true },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const transactions = (student.account?.transactions || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      balanceBefore: Number(t.balanceBefore),
      balanceAfter: Number(t.balanceAfter),
      description: t.description,
      reference: t.reference,
      paymentMethod: t.paymentMethod,
      processedAt: t.processedAt.toISOString(),
      notes: t.notes,
      receiptNumber: t.payment?.receiptNumber || null,
    }));

    const totalCharges = transactions
      .filter((t: any) => t.type === 'CHARGE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalPayments = transactions
      .filter((t: any) => t.type === 'PAYMENT')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const currentBalance = student.account ? Number(student.account.balance) : 0;

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        curriculum: student.curriculum,
        status: student.status,
        className: student.currentClass?.name || 'Unassigned',
      },
      account: student.account
        ? {
            id: student.account.id,
            balance: currentBalance,
          }
        : null,
      summary: {
        totalCharges,
        totalPayments,
        currentBalance,
        percentagePaid: totalCharges > 0 ? Math.round((totalPayments / totalCharges) * 100) : 0,
      },
      transactions,
    });
  } catch (error: any) {
    console.error('Error fetching student finances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student financial data' },
      { status: 500 }
    );
  }
}
