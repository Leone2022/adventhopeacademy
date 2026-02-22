import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendApprovalEmailWithResetLink } from "@/lib/email"
import { generateResetToken, hashToken } from "@/lib/security"
import { generateNextStudentNumber, isStandardStudentNumber } from "@/lib/student-number"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN"]
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, parentProfile: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.status !== "PENDING") {
      return NextResponse.json({ error: "User is not pending approval" }, { status: 400 })
    }

    // Generate password reset token (secure, one-time use)
    const resetToken = generateResetToken()
    const hashedToken = hashToken(resetToken)
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user status to ACTIVE and set reset token
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        passwordResetToken: hashedToken,
        passwordResetExpires: resetExpires,
        mustChangePassword: true,
      },
    })

    // Generate student number if student role
    let studentNumber: string | undefined
    if (user.role === "STUDENT" && user.studentProfile) {
      const existingStudentNumber = user.studentProfile.studentNumber
      if (!isStandardStudentNumber(existingStudentNumber)) {
        studentNumber = await generateNextStudentNumber()
        await prisma.student.update({
          where: { id: user.studentProfile.id },
          data: { studentNumber },
        })
      } else {
        studentNumber = existingStudentNumber
      }
    }

    // Build reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/portal/reset-password?token=${resetToken}`

    // Get application number for parents
    let applicationNumber: string | undefined
    if (user.role === "PARENT" && user.parentProfile?.applicationNumber) {
      applicationNumber = user.parentProfile.applicationNumber
    }

    // Send approval email with secure reset link
    await sendApprovalEmailWithResetLink(
      user.email,
      user.name,
      user.role as "PARENT" | "STUDENT",
      resetUrl,
      { studentNumber, applicationNumber }
    )

    return NextResponse.json(
      {
        message: "Registration approved and password setup link sent",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          status: updatedUser.status,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Approval error:", error)
    return NextResponse.json(
      { error: "Failed to approve registration" },
      { status: 500 }
    )
  }
}
