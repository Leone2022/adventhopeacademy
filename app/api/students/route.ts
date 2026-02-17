import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/students - List all students with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const classId = searchParams.get('classId') || '';
    const curriculum = searchParams.get('curriculum') || '';
    const isBoarding = searchParams.get('isBoarding') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.StudentWhereInput = {
      schoolId: session.user.schoolId || undefined,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (classId) {
      where.currentClassId = classId;
    }

    if (curriculum) {
      where.curriculum = curriculum as any;
    }

    if (isBoarding) {
      where.isBoarding = isBoarding === 'true';
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          hostelAllocation: {
            include: {
              bed: {
                include: {
                  room: true,
                },
              },
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role permissions
    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'REGISTRAR'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    let schoolId = session.user.schoolId;

    // For SUPER_ADMIN without a schoolId, allow specifying one or use the first school
    if (!schoolId) {
      if (body.schoolId) {
        schoolId = body.schoolId;
      } else if (session.user.role === 'SUPER_ADMIN') {
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
        { error: 'School context required. Please select a school or log in with a school-specific account.' },
        { status: 400 }
      );
    }

    // Use manually entered student number or generate one if not provided
    let studentNumber = body.studentNumber?.trim();
    
    if (!studentNumber) {
      // Auto-generate if not provided (fallback)
      const year = new Date().getFullYear();
      const lastStudent = await prisma.student.findFirst({
        where: {
          schoolId,
          studentNumber: { startsWith: `AHA${year}` },
        },
        orderBy: { studentNumber: 'desc' },
      });

      let sequence = 1;
      if (lastStudent) {
        const lastSeq = parseInt(lastStudent.studentNumber.slice(-4));
        sequence = lastSeq + 1;
      }
      studentNumber = `AHA${year}${sequence.toString().padStart(4, '0')}`;
    } else {
      // Check if student number already exists
      const existingStudent = await prisma.student.findFirst({
        where: {
          schoolId,
          studentNumber: studentNumber,
        },
      });
      
      if (existingStudent) {
        return NextResponse.json(
          { error: `Student number "${studentNumber}" already exists. Please use a different registration number.` },
          { status: 400 }
        );
      }
    }

    // Calculate initial balance
    const totalFees = body.totalFees ? parseFloat(body.totalFees) : 0;
    const initialDeposit = body.initialDepositAmount ? parseFloat(body.initialDepositAmount) : 0;
    const balance = totalFees - initialDeposit;

    // Create student + account + fees + parent linkage atomically
    const student = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          studentNumber,
          schoolId,
          firstName: body.firstName,
          lastName: body.lastName,
          middleName: body.middleName || null,
          dateOfBirth: new Date(body.dateOfBirth),
          gender: body.gender,
          curriculum: body.curriculum,
          admissionDate: new Date(body.admissionDate || new Date()),
          currentClassId: body.classId || null,
          status: 'ACTIVE',

          // Photo
          photo: body.photo || null,

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

          // Previous education - Secondary
          previousSchool: body.previousSchool || null,
          previousGrade: body.previousGrade || null,
          transferReason: body.transferReason || null,

          // Previous education - Primary School
          formerPrimarySchool: body.formerPrimarySchool || null,
          formerPrimarySchoolAddress: body.formerPrimarySchoolAddress || null,
          formerPrimarySchoolContact: body.formerPrimarySchoolContact || null,
          formerPrimaryGrade: body.formerPrimaryGrade || null,

          // Recreational Activities
          recreationalActivities: body.recreationalActivities?.length > 0 ? body.recreationalActivities : null,
          specialTalents: body.specialTalents || null,
          clubsInterests: body.clubsInterests || null,

          // Academic documents and results
          academicResults: body.academicResults || null,
          documents: body.documents || null,

          // IDs
          nationalId: body.nationalId || null,
          birthCertNumber: body.birthCertNumber || null,

          // Flags
          isBoarding: body.isBoarding || false,

          // Audit
          createdBy: session.user.id,
        },
        include: {
          currentClass: true,
        },
      });

      // Create student account for fee management with initial balance
      const studentAccount = await tx.studentAccount.create({
        data: {
          studentId: student.id,
          balance: balance,
          lastPaymentDate: initialDeposit > 0 ? new Date() : null,
          lastPaymentAmount: initialDeposit > 0 ? initialDeposit : null,
        },
      });

      // If there's an initial deposit, create the initial transactions
      if (initialDeposit > 0) {
        await tx.transaction.create({
          data: {
            studentAccountId: studentAccount.id,
            type: 'CHARGE',
            amount: totalFees,
            balanceBefore: 0,
            balanceAfter: totalFees,
            description: `Initial fee charge - ${body.term || ''} ${body.academicYear || new Date().getFullYear()}`,
            reference: `CHARGE-${studentNumber}-${Date.now()}`,
            processedBy: session.user.id,
            processedAt: new Date(),
          },
        });

        await tx.transaction.create({
          data: {
            studentAccountId: studentAccount.id,
            type: 'PAYMENT',
            amount: initialDeposit,
            balanceBefore: totalFees,
            balanceAfter: balance,
            description: 'Initial registration deposit',
            reference: body.paymentReference || `PAY-${studentNumber}-${Date.now()}`,
            paymentMethod: body.paymentMethod || 'CASH',
            proofOfPayment: body.paymentProofUrl || null,
            bankReference: body.paymentReference || null,
            processedBy: session.user.id,
            processedAt: new Date(),
          },
        });
      }

      // If parent info is provided, create or link parent
      if (body.parentInfo && body.parentInfo.length > 0) {
        for (const parentData of body.parentInfo) {
          let parentUser = await tx.user.findUnique({
            where: { email: parentData.email },
            include: { parentProfile: true },
          });

          if (!parentUser) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('parent123', 10);

            parentUser = await tx.user.create({
              data: {
                email: parentData.email,
                password: hashedPassword,
                name: parentData.name,
                phone: parentData.phone,
                role: 'PARENT',
                schoolId,
                parentProfile: {
                  create: {
                    occupation: parentData.occupation || null,
                    employer: parentData.employer || null,
                    address: parentData.address || null,
                    alternatePhone: parentData.alternatePhone || null,
                  },
                },
              },
              include: { parentProfile: true },
            });
          }

          if (parentUser.parentProfile) {
            await tx.parentStudent.create({
              data: {
                parentId: parentUser.parentProfile.id,
                studentId: student.id,
                relationship: parentData.relationship || 'Parent',
                isPrimary: parentData.isPrimary || false,
                canPickup: parentData.canPickup !== false,
                emergencyContact: parentData.emergencyContact !== false,
              },
            });
          }
        }
      }

      return student;
    });

    // Handle hostel bed allocation outside transaction (non-critical, should not block registration)
    if (body.isBoarding && body.bedId) {
      try {
        const bed = await prisma.hostelBed.findUnique({
          where: { id: body.bedId },
          include: {
            allocation: {
              where: { isActive: true },
            },
          },
        });

        if (bed && !bed.allocation) {
          await prisma.hostelAllocation.create({
            data: {
              studentId: student.id,
              bedId: body.bedId,
              checkInDate: new Date(),
              isActive: true,
              allocatedBy: session.user.id,
              notes: `Initial allocation during student registration`,
            },
          });

          await prisma.hostelBed.update({
            where: { id: body.bedId },
            data: { isAvailable: false },
          });
        }
      } catch (error: any) {
        console.error('Error allocating bed:', error);
      }
    }

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
