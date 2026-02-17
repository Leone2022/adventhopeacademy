import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/finances/initialize-accounts
 * Create financial accounts for all students who don't have one
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all students without accounts
    const studentsWithoutAccounts = await prisma.student.findMany({
      where: {
        account: null,
      },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    if (studentsWithoutAccounts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All students already have financial accounts',
        created: 0,
        students: [],
      });
    }

    // Create accounts in batch
    const accountsToCreate = studentsWithoutAccounts.map(student => ({
      studentId: student.id,
      balance: 0,
    }));

    const result = await prisma.studentAccount.createMany({
      data: accountsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully created ${result.count} financial accounts`,
      created: result.count,
      students: studentsWithoutAccounts.map(s => ({
        id: s.id,
        studentNumber: s.studentNumber,
        name: `${s.firstName} ${s.lastName}`,
      })),
    });
  } catch (error: any) {
    console.error('Error initializing accounts:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize accounts',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
