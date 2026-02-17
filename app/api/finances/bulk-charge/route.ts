import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/finances/bulk-charge
 * Add charges to multiple student accounts - processes individually to avoid timeout
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
    const { studentIds, amount, description, notes, chargeType } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (studentIds.length > 500) {
      return NextResponse.json(
        { error: 'Maximum 500 students can be charged at once' },
        { status: 400 }
      );
    }

    // Get all students with their accounts
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        status: 'ACTIVE',
      },
      include: {
        account: true,
        currentClass: true,
      },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No valid active students found' },
        { status: 404 }
      );
    }

    // Step 1: Create missing accounts in batch (fast, single query)
    const studentsWithoutAccounts = students.filter(s => !s.account);
    if (studentsWithoutAccounts.length > 0) {
      await prisma.studentAccount.createMany({
        data: studentsWithoutAccounts.map(s => ({
          studentId: s.id,
          balance: 0,
        })),
        skipDuplicates: true,
      });

      // Refresh accounts for those students
      const newAccounts = await prisma.studentAccount.findMany({
        where: { studentId: { in: studentsWithoutAccounts.map(s => s.id) } },
      });
      for (const student of studentsWithoutAccounts) {
        const acc = newAccounts.find(a => a.studentId === student.id);
        if (acc) student.account = acc as any;
      }
    }

    // Step 2: Process charges individually (no wrapping transaction = no timeout)
    const chargeAmount = parseFloat(amount);
    const timestamp = Date.now();
    const chargeDesc = `${description}${chargeType ? ` - ${chargeType}` : ''}`;
    const successfulCharges: any[] = [];
    const failedCharges: any[] = [];

    for (const student of students) {
      try {
        if (!student.account) {
          throw new Error('Account not found');
        }

        const balanceBefore = Number(student.account.balance || 0);
        const balanceAfter = balanceBefore + chargeAmount;

        // Each charge is its own small transaction (fast, won't timeout)
        const result = await prisma.$transaction(async (tx) => {
          await tx.studentAccount.update({
            where: { id: student.account!.id },
            data: { balance: balanceAfter },
          });

          return tx.transaction.create({
            data: {
              studentAccountId: student.account!.id,
              type: 'CHARGE',
              amount: chargeAmount,
              balanceBefore,
              balanceAfter,
              description: chargeDesc,
              processedBy: session.user.id,
              notes: notes || null,
              reference: `BULK-${timestamp}-${student.studentNumber}`,
            },
          });
        });

        successfulCharges.push({
          studentId: student.id,
          studentNumber: student.studentNumber,
          name: `${student.firstName} ${student.lastName}`,
          class: student.currentClass?.name || 'N/A',
          previousBalance: balanceBefore,
          newBalance: balanceAfter,
          amountCharged: chargeAmount,
          transactionId: result.id,
        });
      } catch (error: any) {
        failedCharges.push({
          studentId: student.id,
          studentNumber: student.studentNumber,
          name: `${student.firstName} ${student.lastName}`,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk charge completed. ${successfulCharges.length} of ${students.length} students charged successfully.`,
      summary: {
        totalRequested: studentIds.length,
        totalProcessed: students.length,
        successful: successfulCharges.length,
        failed: failedCharges.length,
        accountsCreated: studentsWithoutAccounts.length,
        totalAmountCharged: successfulCharges.length * chargeAmount,
      },
      details: {
        successfulCharges,
        failedCharges,
      },
    });
  } catch (error: any) {
    console.error('Error processing bulk charge:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk charge', details: error.message },
      { status: 500 }
    );
  }
}
