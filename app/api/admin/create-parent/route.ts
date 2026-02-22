import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSecurePassword, hashPassword, sanitizeEmail } from "@/lib/security"
import { sendWelcomeEmail } from "@/lib/email"
import { generateParentApplicationNumber } from "@/lib/utils"

async function createUniqueParentApplicationNumber(): Promise<string> {
  const maxAttempts = 5
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateParentApplicationNumber()
    const existing = await prisma.parent.findUnique({ where: { applicationNumber: candidate } })
    if (!existing) return candidate
  }
  throw new Error("Unable to generate unique parent application number")
}

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
      email,
      phone,
      nationalId,
      address,
      city,
      password,
      name,
    } = await request.json()

    const resolvedFirstName = (firstName || "").trim()
    const resolvedLastName = (lastName || "").trim()
    const resolvedName = (name || `${resolvedFirstName} ${resolvedLastName}`).trim()

    if (!resolvedName || !email || !phone || !nationalId || !address || !city) {
      return NextResponse.json(
        { error: "Please complete all required parent registration fields" },
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeEmail(email)

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: sanitizedEmail }, { phone }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or phone number already registered in the system" },
        { status: 400 }
      )
    }

    const existingNationalId = await prisma.parent.findFirst({
      where: { nationalId },
      select: { id: true },
    })

    if (existingNationalId) {
      return NextResponse.json(
        { error: "National ID already registered in the system" },
        { status: 400 }
      )
    }

    // Generate temporary password
    const plainPassword = password && String(password).trim().length >= 8
      ? String(password).trim()
      : generateSecurePassword(12)
    const hashedPassword = await hashPassword(plainPassword)
    const applicationNumber = await createUniqueParentApplicationNumber()

    // Create user and parent in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: sanitizedEmail,
          password: hashedPassword,
          name: resolvedName,
          phone,
          role: "PARENT",
          status: "ACTIVE",
          isActive: true,
          mustChangePassword: !password,
          schoolId: session.user.schoolId,
          createdBy: session.user.id,
        },
      })

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          applicationNumber,
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
          nationalId,
          address,
          city,
        },
      })

      return { user, parent }
    })

    // Send welcome email
    try {
      await sendWelcomeEmail(sanitizedEmail, name, "PARENT", {
        username: sanitizedEmail,
        password: plainPassword,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portal/login`,
      })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Parent account created successfully",
      email: sanitizedEmail,
      tempPassword: plainPassword,
      applicationNumber,
      userId: result.user.id,
      parentId: result.parent.id,
    })
  } catch (error) {
    console.error("Create parent error:", error)
    return NextResponse.json(
      { error: "Failed to create parent account" },
      { status: 500 }
    )
  }
}
