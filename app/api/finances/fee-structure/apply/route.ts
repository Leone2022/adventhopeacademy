import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/finances/fee-structure/apply
 * Apply fee structure to students based on criteria
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
    const { feeStructureId, studentIds, applyToAll, classId } = body;

    if (!feeStructureId) {
      return NextResponse.json(
        { error: 'Fee structure ID is required' },
        { status: 400 }
      );
    }

    // Get fee structure
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      include: {
        term: true,
        class: true,
      },
    });

    if (!feeStructure) {
      return NextResponse.json(
        { error: 'Fee structure not found' },
        { status: 404 }
      );
    }

    // Determine which students to apply to
    let targetStudents: any[] = [];

    if (applyToAll) {
      // Apply to all students matching criteria
      const where: any = {
        schoolId: session.user.schoolId,
        status: 'ACTIVE',
      };

      // Filter by student type (Day Scholar / Boarder)
      if (feeStructure.studentType === 'DAY_SCHOLAR') {
        where.isBoarding = false;
      } else if (feeStructure.studentType === 'BOARDER') {
        where.isBoarding = true;
      }
      // If BOTH, don't filter by isBoarding

      // Filter by class if specified
      if (feeStructure.classId) {
        where.currentClassId = feeStructure.classId;
      } else if (classId) {
        where.currentClassId = classId;
      }

      // Filter by curriculum if specified
      if (feeStructure.curriculum) {
        where.curriculum = feeStructure.curriculum;
      }

      targetStudents = await prisma.student.findMany({
        where,
        include: {
          account: true,
          currentClass: true,
        },
      });
    } else if (studentIds && Array.isArray(studentIds)) {
      // Apply to specific students
      targetStudents = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          status: 'ACTIVE',
        },
        include: {
          account: true,
          currentClass: true,
        },
      });

      // Validate students match fee structure criteria
      targetStudents = targetStudents.filter((student) => {
        if (feeStructure.studentType === 'DAY_SCHOLAR' && student.isBoarding) {
          return false;
        }
        if (feeStructure.studentType === 'BOARDER' && !student.isBoarding) {
          return false;
        }
        return true;
      });
    } else {
      return NextResponse.json(
        { error: 'Either applyToAll or studentIds must be provided' },
        { status: 400 }
      );
    }

    if (targetStudents.length === 0) {
      return NextResponse.json(
        { error: 'No eligible students found' },
        { status: 404 }
      );
    }

    // Get active bursaries for students
    const studentIdsForBursary = targetStudents.map((s) => s.id);
    const activeBursaries = await prisma.bursary.findMany({
      where: {
        studentId: { in: studentIdsForBursary },
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
    });

    const bursaryMap = new Map(
      activeBursaries.map((b) => [b.studentId, b.percentage.toNumber()])
    );

    // Step 1: Create missing accounts in batch (single query, no transaction needed)
    const studentsWithoutAccounts = targetStudents.filter(s => !s.account);
    const createdAccounts: any[] = [];
    if (studentsWithoutAccounts.length > 0) {
      await prisma.studentAccount.createMany({
        data: studentsWithoutAccounts.map(s => ({
          studentId: s.id,
          balance: 0,
        })),
        skipDuplicates: true,
      });

      // Fetch newly created accounts
      const newAccounts = await prisma.studentAccount.findMany({
        where: {
          studentId: { in: studentsWithoutAccounts.map(s => s.id) },
        },
      });

      // Update students array with new accounts
      studentsWithoutAccounts.forEach(student => {
        const account = newAccounts.find(a => a.studentId === student.id);
        if (account) {
          student.account = account as any;
          createdAccounts.push({
            studentId: student.id,
            studentNumber: student.studentNumber,
          });
        }
      });
    }

    // Step 2: Process each student charge as its own small transaction (no timeout)
    const successfulCharges: any[] = [];
    const failedCharges: any[] = [];
    const feeRef = feeStructure.id.substring(0, 8);
    const feeAmount = feeStructure.amount.toNumber();

    for (const student of targetStudents) {
      try {
        if (!student.account) {
          throw new Error('Account not found or creation failed');
        }

        // Calculate amount with bursary discount
        let finalAmount = feeAmount;
        const bursaryPercentage = bursaryMap.get(student.id) || 0;
        const discount = (finalAmount * bursaryPercentage) / 100;
        finalAmount = finalAmount - discount;

        const balanceBefore = Number(student.account.balance || 0);
        const balanceAfter = balanceBefore + finalAmount;

        // Each charge is its own small transaction (fast, won't timeout)
        const transaction = await prisma.$transaction(async (tx) => {
          await tx.studentAccount.update({
            where: { id: student.account!.id },
            data: { balance: balanceAfter },
          });

          return tx.transaction.create({
            data: {
              studentAccountId: student.account!.id,
              type: 'CHARGE',
              amount: finalAmount,
              balanceBefore,
              balanceAfter,
              description: `${feeStructure.name}${feeStructure.term ? ` - ${feeStructure.term.name}` : ''}${bursaryPercentage > 0 ? ` (${bursaryPercentage}% bursary applied)` : ''}`,
              processedBy: session.user.id,
              notes: feeStructure.description,
              reference: `FEE-${feeRef}-${student.studentNumber}`,
            },
          });
        });

        successfulCharges.push({
          studentId: student.id,
          studentNumber: student.studentNumber,
          name: `${student.firstName} ${student.lastName}`,
          class: student.currentClass?.name || 'N/A',
          studentType: student.isBoarding ? 'Boarder' : 'Day Scholar',
          originalAmount: feeAmount,
          bursaryDiscount: discount,
          finalAmount,
          previousBalance: balanceBefore,
          newBalance: balanceAfter,
          transactionId: transaction.id,
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

    const results = { successfulCharges, failedCharges, createdAccounts };

    return NextResponse.json({
      success: true,
      message: `Fee structure applied. ${results.successfulCharges.length} of ${targetStudents.length} students charged successfully.`,
      feeStructure: {
        name: feeStructure.name,
        amount: feeStructure.amount.toNumber(),
        studentType: feeStructure.studentType,
      },
      summary: {
        totalStudents: targetStudents.length,
        successful: results.successfulCharges.length,
        failed: results.failedCharges.length,
        accountsCreated: results.createdAccounts.length,
        totalAmountCharged: results.successfulCharges.reduce(
          (sum, c) => sum + c.finalAmount,
          0
        ),
        totalBursaryDiscounts: results.successfulCharges.reduce(
          (sum, c) => sum + c.bursaryDiscount,
          0
        ),
      },
      details: results,
    });
  } catch (error: any) {
    console.error('Error applying fee structure:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply fee structure',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
