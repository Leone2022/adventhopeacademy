import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/finances/fee-structure
 * Get all fee structures with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const termId = searchParams.get('termId');
    const classId = searchParams.get('classId');
    const studentType = searchParams.get('studentType');
    const isActive = searchParams.get('isActive');

    const where: any = {
      schoolId: session.user.schoolId,
    };

    if (academicYearId) where.academicYearId = academicYearId;
    if (termId) where.termId = termId;
    if (classId) where.classId = classId;
    if (studentType) where.studentType = studentType;
    if (isActive !== null) where.isActive = isActive === 'true';

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      include: {
        academicYear: true,
        term: true,
        class: true,
      },
      orderBy: [
        { academicYear: { startDate: 'desc' } },
        { feeType: 'asc' },
      ],
    });

    return NextResponse.json({ feeStructures });
  } catch (error: any) {
    console.error('Error fetching fee structures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee structures', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/finances/fee-structure
 * Create a new fee structure
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
      academicYearId,
      termId,
      classId,
      name,
      feeType,
      curriculum,
      studentType,
      amount,
      dueDate,
      lateFee,
      description,
    } = body;

    // Validation
    if (!academicYearId) {
      return NextResponse.json(
        { error: 'Academic year is required' },
        { status: 400 }
      );
    }

    if (!name || !feeType || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Name, fee type, and valid amount are required' },
        { status: 400 }
      );
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        schoolId: session.user.schoolId!,
        academicYearId,
        termId: termId || null,
        classId: classId || null,
        name,
        feeType,
        curriculum: curriculum || null,
        studentType: studentType || 'BOTH',
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        lateFee: lateFee ? parseFloat(lateFee) : null,
        description: description || null,
        createdBy: session.user.id,
      },
      include: {
        academicYear: true,
        term: true,
        class: true,
      },
    });

    return NextResponse.json({
      success: true,
      feeStructure,
    });
  } catch (error: any) {
    console.error('Error creating fee structure:', error);
    return NextResponse.json(
      { error: 'Failed to create fee structure', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/finances/fee-structure
 * Update a fee structure
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
        { error: 'Fee structure ID is required' },
        { status: 400 }
      );
    }

    // Clean up update data
    const cleanData: any = {};
    if (updateData.name !== undefined) cleanData.name = updateData.name;
    if (updateData.feeType !== undefined) cleanData.feeType = updateData.feeType;
    if (updateData.studentType !== undefined) cleanData.studentType = updateData.studentType;
    if (updateData.amount !== undefined) cleanData.amount = parseFloat(updateData.amount);
    if (updateData.dueDate !== undefined) cleanData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    if (updateData.lateFee !== undefined) cleanData.lateFee = updateData.lateFee ? parseFloat(updateData.lateFee) : null;
    if (updateData.description !== undefined) cleanData.description = updateData.description;
    if (updateData.isActive !== undefined) cleanData.isActive = updateData.isActive;

    const feeStructure = await prisma.feeStructure.update({
      where: { id },
      data: cleanData,
      include: {
        academicYear: true,
        term: true,
        class: true,
      },
    });

    return NextResponse.json({
      success: true,
      feeStructure,
    });
  } catch (error: any) {
    console.error('Error updating fee structure:', error);
    return NextResponse.json(
      { error: 'Failed to update fee structure', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/finances/fee-structure
 * Delete a fee structure
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
        { error: 'Fee structure ID is required' },
        { status: 400 }
      );
    }

    await prisma.feeStructure.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Fee structure deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting fee structure:', error);
    return NextResponse.json(
      { error: 'Failed to delete fee structure', details: error.message },
      { status: 500 }
    );
  }
}
