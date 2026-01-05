import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    });

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

    // Generate student number if not exists
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

    // Parse guardian info
    const guardianInfo = application.guardianInfo as any;
    const documents = application.documents as any;

    // Create student record
    const student = await prisma.student.create({
      data: {
        schoolId: application.schoolId,
        studentNumber,
        
        // Personal Information
        firstName: application.firstName,
        lastName: application.lastName,
        middleName: application.middleName,
        dateOfBirth: application.dateOfBirth,
        gender: application.gender,
        nationalId: application.nationalId,
        birthCertNumber: application.birthCertNumber,
        
        // Contact Information
        email: application.email,
        phone: application.phone,
        address: application.address,
        
        // Academic Information
        curriculum: application.curriculum,
        grade: application.applyingForClass,
        previousSchool: application.previousSchool,
        previousGrade: application.previousGrade,
        
        // Photo and documents
        photo: application.photo,
        birthCertificate: application.birthCertificate,
        
        // Guardian information (store as JSON)
        guardianInfo: application.guardianInfo,
        
        // Medical info if available in documents
        medicalRecords: application.medicalRecords,
        
        // Other
        admissionDate: new Date(),
        status: 'ACTIVE',
        isActive: true,
      },
    });

    // Update application to mark as converted
    await prisma.application.update({
      where: { id: params.id },
      data: {
        status: 'ENROLLED',
        convertedToStudentId: student.id,
        convertedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        name: `${student.firstName} ${student.lastName}`,
      },
    });
  } catch (error) {
    console.error('Error converting application:', error);
    return NextResponse.json(
      { error: 'Failed to convert application to student' },
      { status: 500 }
    );
  }
}
