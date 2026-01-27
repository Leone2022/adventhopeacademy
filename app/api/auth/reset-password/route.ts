import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashToken, validatePassword, hashPassword } from "@/lib/security"
import { sendPasswordChangedEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    // Validate password strength
    const validation = validatePassword(password)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      )
    }

    // Hash the token to compare with database
    const hashedToken = hashToken(token)

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(), // Token not expired
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(password)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        mustChangePassword: false, // Clear forced password change
        failedLoginAttempts: 0, // Reset failed attempts
        accountLockedUntil: null, // Unlock account
      },
    })

    // Send confirmation email
    await sendPasswordChangedEmail(user.email, user.name)

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
