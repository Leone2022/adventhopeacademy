import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateResetToken, hashToken, sanitizeEmail } from "@/lib/security"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { identifier, recoveryMethod } = await request.json()

    if (!identifier) {
      return NextResponse.json(
        { error: "Identifier is required" },
        { status: 400 }
      )
    }

    let user = null

    // Find user based on recovery method
    if (recoveryMethod === "email") {
      user = await prisma.user.findUnique({
        where: { email: sanitizeEmail(identifier) },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      })
    } else if (recoveryMethod === "phone") {
      user = await prisma.user.findFirst({
        where: {
          phone: identifier,
          role: { in: ["PARENT", "STUDENT"] },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      })
    } else if (recoveryMethod === "studentNumber") {
      // Find student by registration number
      const student = await prisma.student.findUnique({
        where: { studentNumber: identifier },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
            },
          },
        },
      })

      user = student?.user || null
    }

    // For security, always return success even if user doesn't exist
    // This prevents account enumeration attacks
    if (!user || !user.isActive) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, reset instructions have been sent",
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const hashedToken = hashToken(resetToken)

    // Save hashed token to database with expiry (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    })

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/portal/reset-password?token=${resetToken}`

    const emailSent = await sendPasswordResetEmail(user.email, user.name, resetUrl)
    if (!emailSent) {
      throw new Error("Password reset email delivery failed")
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, reset instructions have been sent",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}
