import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSecurePassword, hashPassword, sanitizeEmail } from '@/lib/security';

// POST /api/applications/[id]/convert - Convert approved application to student
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can convert applications
    const allowedRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'REGISTRAR'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the application
    const application = await prisma.application.findUnique({
      where: { id: params.id },
    }) as any;

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if already converted
    if (application.convertedToStudentId) {
      return NextResponse.json({ error: 'Application already converted to student' }, { status: 400 });
    }

    // Only convert approved applications
    if (application.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Only approved applications can be converted' }, { status: 400 });
    }

    // Generate student number
    const year = new Date().getFullYear();
    const lastStudent = await prisma.student.findFirst({
      where: {
        studentNumber: { startsWith: `STU${year}` },
      },
      orderBy: { studentNumber: 'desc' },
    });

    let sequence = 1;
    if (lastStudent) {
      const lastSeq = parseInt(lastStudent.studentNumber.slice(-5));
      sequence = lastSeq + 1;
    }
    const studentNumber = `STU${year}${sequence.toString().padStart(5, '0')}`;

    // Generate a temporary password for the student's user account
    const tempPassword = generateSecurePassword(12);
    const hashedPassword = await hashPassword(tempPassword);
    const email = application.email ? sanitizeEmail(application.email) : null;

    // Check if email already has a user account
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: `A user account with email ${email} already exists. Please use a different email or link to the existing account.` },
          { status: 400 }
        );
      }
    }

    // Create User + Student + update Application atomically in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account so the student can log in
      const user = await tx.user.create({
        data: {
          email: email || `${studentNumber.toLowerCase()}@temp.local`,
          password: hashedPassword,
          name: `${application.firstName} ${application.lastName}`,
          phone: application.phone || undefined,
          role: 'STUDENT',
          isActive: true,
          status: 'ACTIVE',
          mustChangePassword: true,
          schoolId: application.schoolId,
          createdBy: session.user.id,
        },
      });

      // Create student record with ALL data from application
      const student = await tx.student.create({
        data: {
          schoolId: application.schoolId,
          studentNumber,
          userId: user.id,

          // Personal Information
          firstName: application.firstName,
          lastName: application.lastName,
          middleName: application.middleName,
          dateOfBirth: application.dateOfBirth,
          gender: application.gender,
          nationalId: application.nationalId,
          birthCertNumber: application.birthCertNumber,
          religion: application.religion,

          // Contact Information
          email: application.email,
          phone: application.phone,
          address: application.address,

          // Academic Information
          curriculum: application.curriculum,
          grade: application.applyingForClass,
          previousSchool: application.previousSchool,
          previousGrade: application.previousGrade,

          // Former Primary School
          formerPrimarySchool: application.formerPrimarySchool,
          formerPrimarySchoolAddress: application.formerPrimarySchoolAddress,
          formerPrimarySchoolContact: application.formerPrimarySchoolContact,

          // Medical Information
          bloodGroup: application.bloodGroup,
          allergies: application.allergies,
          medicalConditions: application.medicalConditions,

          // Activities & Interests
          specialTalents: application.specialTalents,
          clubsInterests: application.clubsInterests,
          recreationalActivities: application.recreationalActivities || undefined,

          // Photo and documents
          photo: application.photo,
          documents: application.documents || undefined,

          // Emergency information (store as JSON)
          emergencyContacts: application.emergencyContacts || undefined,

          // Accommodation
          isBoarding: application.isBoarding,

          // Other
          admissionDate: new Date(),
          status: 'ACTIVE',
        },
      });

      // Create student financial account
      await tx.studentAccount.create({
        data: {
          studentId: student.id,
          balance: 0,
        },
      });

      // Update application to mark as converted
      await tx.application.update({
        where: { id: params.id },
        data: {
          status: 'ENROLLED',
          convertedToStudentId: student.id,
          convertedAt: new Date(),
        },
      });

      return { user, student };
    });

    return NextResponse.json({
      success: true,
      student: {
        id: result.student.id,
        studentNumber: result.student.studentNumber,
        name: `${result.student.firstName} ${result.student.lastName}`,
      },
      tempPassword,
    });
  } catch (error) {
    console.error('Error converting application:', error);
    return NextResponse.json(
      { error: 'Failed to convert application to student' },
      { status: 500 }
    );
  }
}
