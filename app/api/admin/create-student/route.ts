import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSecurePassword, hashPassword, sanitizeEmail } from "@/lib/security"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check authorization
    if (
      !session ||
      !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      firstName,
      lastName,
      middleName,
      email,
      phone,
      gender,
      dateOfBirth,
      curriculum,
      gradeApplying,
      previousSchool,
      previousGrade,
      address,
      nationalId,
      birthCertNumber,
      bloodGroup,
      allergies,
      medicalConditions,
      religion,
      isBoarding,
      documents,
      parentInfo,
      emergencyContacts,
    } = await request.json()

    if (!firstName || !lastName || !gender) {
      return NextResponse.json(
        { error: "First name, last name, and gender are required" },
        { status: 400 }
      )
    }

    // Generate student number
    const currentYear = new Date().getFullYear()
    const lastStudent = await prisma.student.findFirst({
      where: {
        schoolId: session.user.schoolId!,
        studentNumber: {
          startsWith: `STU${currentYear}`,
        },
      },
      orderBy: {
        studentNumber: "desc",
      },
    })

    let sequence = 1
    if (lastStudent) {
      const lastSequence = parseInt(lastStudent.studentNumber.slice(-3))
      sequence = lastSequence + 1
    }

    const studentNumber = `STU${currentYear}${sequence.toString().padStart(3, "0")}`

    // Check if student number already exists (shouldn't happen, but be safe)
    const existingStudent = await prisma.student.findUnique({
      where: { studentNumber },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student number conflict. Please try again." },
        { status: 400 }
      )
    }

    // Generate temporary password
    const tempPassword = generateSecurePassword(12)
    const hashedPassword = await hashPassword(tempPassword)

    const sanitizedEmail = email ? sanitizeEmail(email) : null

    // Check if email already exists (if provided)
    if (sanitizedEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered in the system" },
          { status: 400 }
        )
      }
    }

    // Create user and student in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: sanitizedEmail || `${studentNumber.toLowerCase()}@temp.local`,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: "STUDENT",
          isActive: true,
          status: "ACTIVE", // Auto-approve admin-created students
          mustChangePassword: true,
          schoolId: session.user.schoolId,
          createdBy: session.user.id,
        },
      })

      const student = await tx.student.create({
        data: {
          studentNumber,
          firstName,
          lastName,
          middleName: middleName || undefined,
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          gender,
          curriculum: curriculum || "ZIMSEC",
          admissionDate: new Date(),
          schoolId: session.user.schoolId!,
          status: "ACTIVE", // Auto-approve
          createdBy: session.user.id,
          phone: phone || undefined,
          email: sanitizedEmail || undefined,
          address: address || undefined,
          nationalId: nationalId || undefined,
          birthCertNumber: birthCertNumber || undefined,
          bloodGroup: bloodGroup || undefined,
          allergies: allergies || undefined,
          medicalConditions: medicalConditions || undefined,
          religion: religion || undefined,
          isBoarding: isBoarding || false,
          gradeApplying: gradeApplying || undefined,
          gradeLevel: gradeApplying || undefined,
          previousSchool: previousSchool || undefined,
          previousGrade: previousGrade || undefined,
          documents: documents || undefined,
          parentInfo: parentInfo || undefined,
          emergencyContacts: emergencyContacts || undefined,
        },
      })

      // Create financial account so the student can be bulk-charged immediately
      await tx.studentAccount.create({
        data: {
          studentId: student.id,
          balance: 0,
        },
      })

      return { user, student }
    })

    // Send welcome email if email provided
    if (sanitizedEmail) {
      try {
        await sendWelcomeEmail(
          sanitizedEmail,
          `${firstName} ${lastName}`,
          "STUDENT",
          {
            username: studentNumber,
            password: tempPassword,
            loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portal/login`,
          }
        )
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Student enrolled successfully",
      studentNumber,
      tempPassword,
      userId: result.user.id,
      studentId: result.student.id,
    })
  } catch (error) {
    console.error("Create student error:", error)
    return NextResponse.json(
      { error: "Failed to enroll student" },
      { status: 500 }
    )
  }
}
