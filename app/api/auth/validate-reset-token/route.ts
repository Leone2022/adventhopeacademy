import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token is required", valid: false },
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
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token", valid: false },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate token", valid: false },
      { status: 500 }
    )
  }
}
