import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateVerificationToken, sanitizeEmail } from "@/lib/security"
import { generateParentApplicationNumber } from "@/lib/utils"
import { sendRegistrationConfirmation } from "@/lib/email"

async function createUniqueParentApplicationNumber(): Promise<string> {
  const maxAttempts = 5
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateParentApplicationNumber()
    const existing = await prisma.parent.findUnique({ where: { applicationNumber: candidate } })
    if (!existing) return candidate
  }
  throw new Error("Unable to generate unique parent application number")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, nationalId, address, city, password } = body

    const sanitizedEmail = sanitizeEmail(email)
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: sanitizedEmail }, { phone }] },
    })
    if (existingUser) {
      return NextResponse.json({ error: "Email or phone number already registered" }, { status: 400 })
    }

    const applicationNumber = await createUniqueParentApplicationNumber()
    const hashedPassword = await hashPassword(password)
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const fullName = `${firstName} ${lastName}`

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        phone,
        name: fullName,
        password: hashedPassword,
        role: "PARENT",
        status: "PENDING",
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    })

    await prisma.parent.create({
      data: {
        userId: user.id,
        applicationNumber,
        firstName,
        lastName,
        nationalId,
        address,
        city,
      },
    })

    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/verify-email?token=${verificationToken}`
      await sendRegistrationConfirmation(
        sanitizedEmail,
        fullName,
        "PARENT",
        `Your parent application number is ${applicationNumber}. We will notify you once approved.`
      )
      const { sendEmailVerification } = await import("@/lib/email")
      await sendEmailVerification(sanitizedEmail, fullName, verificationUrl)
    } catch (emailError) {
      console.error("Failed to send registration emails:", emailError)
    }

    return NextResponse.json(
      {
        success: true,
        applicationNumber,
        status: "PENDING",
        message: "Registration submitted. Please check your email to verify your address.",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Parent registration error:", error)
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 })
  }
}
