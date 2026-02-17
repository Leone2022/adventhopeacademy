import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/finances/accounts - Search and list student financial accounts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const balanceFilter = searchParams.get('balance') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build student filter
    const studentWhere: any = {};

    if (search) {
      studentWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      studentWhere.status = status;
    }

    // If balance filter is set, we need to query accounts only
    if (balanceFilter) {
      const accountWhere: any = {
        student: studentWhere,
      };

      if (balanceFilter === 'owing') {
        accountWhere.balance = { gt: 0 };
      } else if (balanceFilter === 'paid') {
        accountWhere.balance = { lte: 0 };
      }

      const [accounts, total] = await Promise.all([
        prisma.studentAccount.findMany({
          where: accountWhere,
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentNumber: true,
                curriculum: true,
                status: true,
                currentClass: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { balance: 'desc' },
          skip,
          take: limit,
        }),
        prisma.studentAccount.count({ where: accountWhere }),
      ]);

      const formattedAccounts = accounts.map((acc: any) => ({
        id: acc.id,
        studentId: acc.student.id,
        studentNumber: acc.student.studentNumber,
        firstName: acc.student.firstName,
        lastName: acc.student.lastName,
        className: acc.student.currentClass?.name || 'Unassigned',
        curriculum: acc.student.curriculum,
        studentStatus: acc.student.status,
        balance: Number(acc.balance),
        lastPaymentDate: acc.lastPaymentDate,
        lastPaymentAmount: acc.lastPaymentAmount ? Number(acc.lastPaymentAmount) : null,
      }));

      return NextResponse.json({
        accounts: formattedAccounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Default: Show ALL students (with or without accounts)
    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        account: true,
        currentClass: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { firstName: 'asc' },
      ],
      skip,
      take: limit,
    });

    const total = await prisma.student.count({ where: studentWhere });

    const formattedAccounts = students.map((student: any) => ({
      id: student.account?.id || `temp-${student.id}`,
      studentId: student.id,
      studentNumber: student.studentNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      className: student.currentClass?.name || 'Unassigned',
      curriculum: student.curriculum,
      studentStatus: student.status,
      balance: Number(student.account?.balance || 0),
      lastPaymentDate: student.account?.lastPaymentDate || null,
      lastPaymentAmount: student.account?.lastPaymentAmount ? Number(student.account.lastPaymentAmount) : null,
    }));

    return NextResponse.json({
      accounts: formattedAccounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching student accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student accounts' },
      { status: 500 }
    );
  }
}
