import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/staff/[id] - Get staff by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        classTeacher: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        timetables: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Check permissions
    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      // Staff can view their own profile
      if (session.user.id !== staff.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// PATCH /api/staff/[id] - Update staff
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role permissions
    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Update staff
    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        nationalId: body.nationalId,
        photo: body.photo,
        phone: body.phone,
        email: body.email,
        address: body.address,
        employmentType: body.employmentType,
        position: body.position,
        department: body.department,
        hireDate: body.hireDate ? new Date(body.hireDate) : undefined,
        terminationDate: body.terminationDate ? new Date(body.terminationDate) : null,
        salary: body.salary ? parseFloat(body.salary) : null,
        qualifications: body.qualifications,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        updatedBy: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Update user if exists
    if (staff.userId && body.email) {
      await prisma.user.update({
        where: { id: staff.userId },
        data: {
          email: body.email,
          name: `${body.firstName} ${body.lastName}`,
          phone: body.phone || null,
        },
      });
    }

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update staff' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete staff
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role permissions
    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      include: {
        classTeacher: true,
        timetables: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Check if staff has dependencies
    if (staff.classTeacher.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete staff member who is assigned as class teacher' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.staff.update({
      where: { id: params.id },
      data: {
        isActive: false,
        terminationDate: new Date(),
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Staff deactivated successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}

