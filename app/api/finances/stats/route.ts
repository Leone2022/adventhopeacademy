import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all';

    // Calculate date range
    let startDate: Date | undefined;
    const now = new Date();
    
    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const whereClause = startDate ? {
      processedAt: { gte: startDate }
    } : {};

    // Get all transactions for the range
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        studentAccount: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                studentNumber: true,
              }
            }
          }
        }
      },
      orderBy: { processedAt: 'desc' },
      take: 100,
    }) as any[];

    // Calculate totals
    const totalCollected = transactions
      .filter((t: any) => t.type === 'PAYMENT')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    // Get total outstanding fees (all student balances)
    const studentAccounts = await prisma.studentAccount.findMany({
      select: { balance: true },
    }) as any[];
    const outstandingFees = studentAccounts.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0);

    // This month's collection
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCollection = transactions
      .filter((t: any) => 
        t.type === 'PAYMENT' && 
        new Date(t.processedAt) >= thisMonthStart
      )
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    // Count students with outstanding balance
    const studentsWithBalance = studentAccounts.filter((acc: any) => Number(acc.balance) > 0).length;

    // Payment methods breakdown
    const paymentMethodsMap = new Map();
    transactions
      .filter((t: any) => t.type === 'PAYMENT' && t.paymentMethod)
      .forEach((t: any) => {
        const method = t.paymentMethod!;
        const current = paymentMethodsMap.get(method) || { amount: 0, count: 0 };
        paymentMethodsMap.set(method, {
          amount: current.amount + Number(t.amount),
          count: current.count + 1,
        });
      });

    const paymentMethods = Array.from(paymentMethodsMap.entries())
      .map(([method, data]) => ({
        method,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Recent transactions with student info
    const recentTransactions = transactions.slice(0, 10).map((t: any) => ({
      id: t.id,
      studentName: `${t.studentAccount.student.firstName} ${t.studentAccount.student.lastName}`,
      studentNumber: t.studentAccount.student.studentNumber,
      type: t.type,
      amount: Number(t.amount),
      date: t.processedAt.toISOString(),
      paymentMethod: t.paymentMethod || undefined,
    }));

    return NextResponse.json({
      totalCollected,
      outstandingFees,
      thisMonthCollection,
      studentsWithBalance,
      paymentMethods,
      recentTransactions,
    });

  } catch (error) {
    console.error('Error fetching financial stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial statistics' },
      { status: 500 }
    );
  }
}
