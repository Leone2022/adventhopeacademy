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

    const { name, email, phone } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeEmail(email)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered in the system" },
        { status: 400 }
      )
    }

    // Generate temporary password
    const tempPassword = generateSecurePassword(12)
    const hashedPassword = await hashPassword(tempPassword)

    // Create user and parent in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: sanitizedEmail,
          password: hashedPassword,
          name,
          phone: phone || null,
          role: "PARENT",
          isActive: true,
          mustChangePassword: true,
          schoolId: session.user.schoolId,
          createdBy: session.user.id,
        },
      })

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          address: null,
        },
      })

      return { user, parent }
    })

    // Send welcome email
    try {
      await sendWelcomeEmail(sanitizedEmail, name, "PARENT", {
        username: sanitizedEmail,
        password: tempPassword,
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
      tempPassword,
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
