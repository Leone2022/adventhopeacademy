import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/parent/children/[id]/finances - Get child's financial data (parent access only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify parent profile exists
    const parentProfile = await prisma.parent.findUnique({
      where: { userId: session.user.id },
    });

    if (!parentProfile) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
    }

    // Verify parent has access to this student
    const link = await prisma.parentStudent.findFirst({
      where: {
        parentId: parentProfile.id,
        studentId: params.id,
      },
    });

    if (!link) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get student with full financial data
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
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

    if (!student.account) {
      return NextResponse.json({
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentNumber: student.studentNumber,
        },
        account: null,
        summary: {
          totalCharges: 0,
          totalPayments: 0,
          currentBalance: 0,
          percentagePaid: 0,
        },
        transactions: [],
      });
    }

    const transactions = student.account.transactions.map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      balanceBefore: Number(t.balanceBefore),
      balanceAfter: Number(t.balanceAfter),
      description: t.description,
      reference: t.reference,
      paymentMethod: t.paymentMethod,
      processedAt: t.processedAt.toISOString(),
      receiptNumber: t.payment?.receiptNumber || null,
    }));

    const totalCharges = transactions
      .filter((t: any) => t.type === 'CHARGE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalPayments = transactions
      .filter((t: any) => t.type === 'PAYMENT')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const currentBalance = Number(student.account.balance);

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
      },
      account: {
        balance: currentBalance,
        lastPaymentDate: student.account.lastPaymentDate?.toISOString() || null,
        lastPaymentAmount: student.account.lastPaymentAmount
          ? Number(student.account.lastPaymentAmount)
          : null,
      },
      summary: {
        totalCharges,
        totalPayments,
        currentBalance,
        percentagePaid: totalCharges > 0 ? Math.round((totalPayments / totalCharges) * 100) : 0,
      },
      transactions,
    });
  } catch (error) {
    console.error('Error fetching child finances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}
