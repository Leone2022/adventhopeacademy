import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/apply - Submit application form (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'curriculum', 'gradeApplyingFor'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate parent info
    if (!body.parentName || !body.parentEmail || !body.parentPhone) {
      return NextResponse.json(
        { error: 'Parent/guardian information is required' },
        { status: 400 }
      );
    }

    // Get default school (or you can make this configurable)
    const school = await prisma.school.findFirst({
      where: { isActive: true },
    });

    if (!school) {
      return NextResponse.json(
        { error: 'No active school found' },
        { status: 500 }
      );
    }

    // Generate application number
    const year = new Date().getFullYear();
    const lastApplication = await prisma.application.findFirst({
      where: {
        applicationNumber: { startsWith: `APP${year}` },
      },
      orderBy: { applicationNumber: 'desc' },
    });

    let sequence = 1;
    if (lastApplication) {
      const lastSeq = parseInt(lastApplication.applicationNumber.slice(-5));
      sequence = lastSeq + 1;
    }
    const applicationNumber = `APP${year}${sequence.toString().padStart(5, '0')}`;

    // Prepare guardian info
    const guardianInfo = {
      name: body.parentName,
      email: body.parentEmail,
      phone: body.parentPhone,
      relationship: body.parentRelationship || 'Parent',
      occupation: body.parentOccupation || null,
    };

    // Prepare emergency contacts
    const emergencyContacts = body.emergencyContacts || [];

    // Create application with ALL fields
    const application = await prisma.application.create({
      data: {
        applicationNumber,
        schoolId: school.id,
        
        // Student info
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName || null,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        nationalId: body.nationalId || null,
        birthCertNumber: body.birthCertNumber || null,
        religion: body.religion || null,
        
        // Academic info
        curriculum: body.curriculum,
        applyingForClass: body.applyingForClass || body.gradeApplyingFor,
        previousSchool: body.previousSchool || null,
        previousGrade: body.previousGrade || null,
        transferReason: body.transferReason || null,
        
        // Former Primary School
        formerPrimarySchool: body.formerPrimarySchool || null,
        formerPrimarySchoolAddress: body.formerPrimarySchoolAddress || null,
        formerPrimarySchoolContact: body.formerPrimarySchoolContact || null,
        formerPrimaryGrade: body.formerPrimaryGrade || null,
        
        // Medical info
        bloodGroup: body.bloodGroup || null,
        allergies: body.allergies || null,
        medicalConditions: body.medicalConditions || null,
        
        // Activities & Interests
        recreationalActivities: body.recreationalActivities || null,
        specialTalents: body.specialTalents || null,
        clubsInterests: body.clubsInterests || null,
        
        // Contact info
        address: body.address || null,
        phone: body.phone || null,
        email: body.email || null,
        
        // Guardian info (as JSON)
        guardianInfo,
        
        // Emergency contacts
        emergencyContacts: emergencyContacts.length > 0 ? emergencyContacts : null,
        
        // Documents
        photo: body.photo || null,
        birthCertificate: body.birthCertificate || null,
        documents: body.documents || null,
        
        // Accommodation
        isBoarding: body.isBoarding || false,
        specialNeeds: body.specialNeeds || null,
        
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });

    // TODO: Send confirmation email to parent

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationNumber: application.applicationNumber,
      status: 'PENDING',
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// GET /api/apply?applicationNumber=xxx - Check application status (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationNumber = searchParams.get('applicationNumber');
    const email = searchParams.get('email');

    if (!applicationNumber || !email) {
      return NextResponse.json(
        { error: 'Application number and email are required' },
        { status: 400 }
      );
    }

    const application = await prisma.application.findFirst({
      where: {
        applicationNumber,
      },
      select: {
        applicationNumber: true,
        firstName: true,
        lastName: true,
        applyingForClass: true,
        guardianInfo: true,
        status: true,
        reviewNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify email matches guardian email
    const guardianData = application.guardianInfo as any;
    if (guardianData?.email !== email) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...application,
      gradeApplyingFor: application.applyingForClass,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
