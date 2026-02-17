import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/finances/bursary
 * Get all bursaries with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (studentId) where.studentId = studentId;
    if (isActive !== null) where.isActive = isActive === 'true';

    const bursaries = await prisma.bursary.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            currentClass: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bursaries });
  } catch (error: any) {
    console.error('Error fetching bursaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bursaries', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/finances/bursary
 * Create a new bursary (apply scholarship/discount)
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
    const {
      studentId,
      studentIds,
      percentage,
      reason,
      notes,
      academicYearId,
      termId,
      startDate,
      endDate,
      approvedBy,
    } = body;

    // Validation
    if (!percentage || parseFloat(percentage) <= 0 || parseFloat(percentage) > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Handle single or multiple students
    const targetStudentIds = studentIds || (studentId ? [studentId] : []);

    if (targetStudentIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one student ID is required' },
        { status: 400 }
      );
    }

    // Verify students exist
    const students = await prisma.student.findMany({
      where: {
        id: { in: targetStudentIds },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        lastName: true,
        currentClass: {
          select: { name: true },
        },
      },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No valid students found' },
        { status: 404 }
      );
    }

    // Create bursaries for each student
    const bursaries = await prisma.$transaction(
      students.map((student) =>
        prisma.bursary.create({
          data: {
            studentId: student.id,
            appliedBy: session.user.id,
            percentage: parseFloat(percentage),
            reason,
            notes: notes || null,
            academicYearId: academicYearId || null,
            termId: termId || null,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            approvedBy: approvedBy || session.user.id,
            approvedAt: new Date(),
          },
          include: {
            student: {
              select: {
                id: true,
                studentNumber: true,
                firstName: true,
                lastName: true,
                currentClass: {
                  select: { name: true },
                },
              },
            },
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Bursary applied to ${bursaries.length} student(s)`,
      bursaries,
    });
  } catch (error: any) {
    console.error('Error creating bursary:', error);
    return NextResponse.json(
      { error: 'Failed to create bursary', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/finances/bursary
 * Update a bursary
 */
export async function PATCH(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Bursary ID is required' },
        { status: 400 }
      );
    }

    // Clean up update data
    const cleanData: any = {};
    if (updateData.percentage !== undefined) {
      const pct = parseFloat(updateData.percentage);
      if (pct <= 0 || pct > 100) {
        return NextResponse.json(
          { error: 'Percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
      cleanData.percentage = pct;
    }
    if (updateData.reason !== undefined) cleanData.reason = updateData.reason;
    if (updateData.notes !== undefined) cleanData.notes = updateData.notes;
    if (updateData.endDate !== undefined) {
      cleanData.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    }
    if (updateData.isActive !== undefined) cleanData.isActive = updateData.isActive;

    const bursary = await prisma.bursary.update({
      where: { id },
      data: cleanData,
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            currentClass: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      bursary,
    });
  } catch (error: any) {
    console.error('Error updating bursary:', error);
    return NextResponse.json(
      { error: 'Failed to update bursary', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/finances/bursary
 * Delete a bursary
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Bursary ID is required' },
        { status: 400 }
      );
    }

    await prisma.bursary.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Bursary deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting bursary:', error);
    return NextResponse.json(
      { error: 'Failed to delete bursary', details: error.message },
      { status: 500 }
    );
  }
}
