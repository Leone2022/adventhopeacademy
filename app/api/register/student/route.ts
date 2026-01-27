import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateVerificationToken } from "@/lib/security"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      nationalId,
      address,
      city,
      previousSchool,
      gradeApplying,
      parentName,
      parentPhone,
      parentEmail,
      password,
    } = body

    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } })
    if (existingUser) {
      return NextResponse.json({ error: "Email or phone number already registered" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const tempStudentNumber = `TEMP${Date.now().toString().slice(-8)}`
    const fullName = `${firstName} ${lastName}`

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name: fullName,
        password: hashedPassword,
        role: "STUDENT",
        status: "PENDING",
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    })

    await prisma.student.create({
      data: {
        userId: user.id,
        studentNumber: tempStudentNumber,
        schoolId: process.env.DEFAULT_SCHOOL_ID || "default",
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender: gender as any,
        nationalId: nationalId || null,
        address,
        gradeApplying,
        previousSchool: previousSchool || null,
        curriculum: "CAMBRIDGE",
        admissionDate: new Date(),
        parentInfo: JSON.stringify({ name: parentName, phone: parentPhone, email: parentEmail }),
      },
    })

    try {
      const { sendEmailVerification } = await import("@/lib/email")
      const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/verify-email?token=${verificationToken}`
      await sendEmailVerification(email, fullName, verificationUrl)
      await sendEmailVerification(parentEmail, parentName, verificationUrl)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
    }

    return NextResponse.json(
      { success: true, message: "Application submitted. Please check your email to verify your address." },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Student registration error:", error)
    return NextResponse.json(
      { error: "Failed to register. Please try again." },
      { status: 500 }
    )
  }
}
