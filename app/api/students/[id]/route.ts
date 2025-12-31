import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/students/[id] - Get single student with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        school: {
          select: {
            name: true,
            logo: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        currentClass: true,
        account: {
          include: {
            transactions: {
              orderBy: { processedAt: 'desc' },
              take: 10,
            },
            invoices: {
              orderBy: { issueDate: 'desc' },
              take: 5,
              include: {
                items: true,
              },
            },
          },
        },
        parents: {
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        hostelAllocation: {
          include: {
            bed: {
              include: {
                room: {
                  include: {
                    block: {
                      include: {
                        hostel: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        grades: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            subject: true,
            term: true,
          },
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        disciplineRecords: {
          orderBy: { incidentDate: 'desc' },
          take: 5,
        },
        transportRoute: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check school access
    if (session.user.role !== 'SUPER_ADMIN' && student.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'REGISTRAR'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Verify student exists and belongs to school
    const existingStudent = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (session.user.role !== 'SUPER_ADMIN' && existingStudent.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const student = await prisma.student.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
        curriculum: body.curriculum,
        currentClassId: body.classId || null,
        status: body.status,
        
        // Contact info
        address: body.address || null,
        phone: body.phone || null,
        email: body.email || null,
        
        // Medical info
        bloodGroup: body.bloodGroup || null,
        allergies: body.allergies || null,
        medicalConditions: body.medicalConditions || null,
        medicalRecords: body.medicalRecords || null,
        
        // Emergency contacts
        emergencyContacts: body.emergencyContacts || null,
        
        // IDs
        nationalId: body.nationalId || null,
        birthCertNumber: body.birthCertNumber || null,
        
        // Flags
        isBoarding: body.isBoarding,
        
        // Audit
        updatedBy: session.user.id,
      },
      include: {
        currentClass: true,
        account: true,
        parents: {
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Delete student (soft delete by changing status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (session.user.role !== 'SUPER_ADMIN' && existingStudent.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete - change status to WITHDRAWN
    await prisma.student.update({
      where: { id: params.id },
      data: {
        status: 'WITHDRAWN',
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Student withdrawn successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
