import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/staff - Get all staff with pagination and filters
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const position = searchParams.get('position') || '';
    const isActive = searchParams.get('isActive');

    let schoolId = session.user.schoolId;

    // For SUPER_ADMIN without a schoolId, allow specifying one
    if (!schoolId && session.user.role === 'SUPER_ADMIN') {
      const schoolIdParam = searchParams.get('schoolId');
      if (schoolIdParam) {
        schoolId = schoolIdParam;
      } else {
        // Auto-select first available school for super admin
        const firstSchool = await prisma.school.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
        if (firstSchool) {
          schoolId = firstSchool.id;
        }
      }
    }

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School context required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      schoolId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = department;
    }

    if (position) {
      where.position = position;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get total count
    const total = await prisma.staff.count({ where });

    // Get staff
    const staff = await prisma.staff.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create a new staff member
export async function POST(request: NextRequest) {
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
    let schoolId = session.user.schoolId;

    // For SUPER_ADMIN without a schoolId, allow specifying one
    if (!schoolId) {
      if (body.schoolId) {
        schoolId = body.schoolId;
      } else if (session.user.role === 'SUPER_ADMIN') {
        const firstSchool = await prisma.school.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
        if (firstSchool) {
          schoolId = firstSchool.id;
        }
      }
    }

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School context required' },
        { status: 400 }
      );
    }

    // Generate employee number
    const year = new Date().getFullYear();
    const lastStaff = await prisma.staff.findFirst({
      where: {
        schoolId,
        employeeNumber: { startsWith: `EMP${year}` },
      },
      orderBy: { employeeNumber: 'desc' },
    });

    let sequence = 1;
    if (lastStaff) {
      const lastSeq = parseInt(lastStaff.employeeNumber.slice(-4)) || 0;
      sequence = lastSeq + 1;
    }
    const employeeNumber = `EMP${year}${sequence.toString().padStart(4, '0')}`;

    // Check if email is provided and if user should be created
    let userId = null;
    if (body.email && body.createUserAccount) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      // Hash password (default or provided)
      const defaultPassword = body.password || 'Staff123!';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Determine role based on position
      let userRole = 'TEACHER';
      if (body.position?.toLowerCase().includes('admin')) {
        userRole = 'SCHOOL_ADMIN';
      } else if (body.position?.toLowerCase().includes('accountant')) {
        userRole = 'ACCOUNTANT';
      } else if (body.position?.toLowerCase().includes('registrar')) {
        userRole = 'REGISTRAR';
      } else if (body.position?.toLowerCase().includes('hostel')) {
        userRole = 'HOSTEL_MANAGER';
      }

      // Create user account
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: `${body.firstName} ${body.lastName}`,
          phone: body.phone || null,
          role: body.role || userRole,
          schoolId,
          isActive: true,
        },
      });

      userId = user.id;
    }

    // Create staff record
    const staff = await prisma.staff.create({
      data: {
        schoolId,
        userId,
        employeeNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || 'MALE',
        nationalId: body.nationalId || null,
        photo: body.photo || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        employmentType: body.employmentType || 'Full-time',
        position: body.position || 'Teacher',
        department: body.department || null,
        hireDate: new Date(body.hireDate || new Date()),
        salary: body.salary ? parseFloat(body.salary) : null,
        qualifications: body.qualifications || null,
        isActive: true,
        createdBy: session.user.id,
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
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create staff' },
      { status: 500 }
    );
  }
}

