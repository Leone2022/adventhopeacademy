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

    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      )
    }

    const approvedUsers = []
    const failedUsers = []

    // Approve each user
    for (const userId of userIds) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { studentProfile: true, parentProfile: true },
        })

        if (!user) {
          failedUsers.push({ userId, reason: "User not found" })
          continue
        }

        if (user.status !== "PENDING") {
          failedUsers.push({ userId, reason: "Not pending approval" })
          continue
        }

        // Generate password reset token (secure, one-time use)
        const resetToken = generateResetToken()
        const hashedToken = hashToken(resetToken)
        const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Update user status to ACTIVE
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            status: "ACTIVE",
            passwordResetToken: hashedToken,
            passwordResetExpires: resetExpires,
            mustChangePassword: true,
          },
        })

        // Generate student number if needed
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

        approvedUsers.push({
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        })
      } catch (error) {
        console.error(`Error approving user ${userId}:`, error)
        failedUsers.push({ userId, reason: "Error processing approval" })
      }
    }

    return NextResponse.json(
      {
        message: `Approved ${approvedUsers.length} registrations`,
        approved: approvedUsers,
        failed: failedUsers,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Bulk approval error:", error)
    return NextResponse.json(
      { error: "Failed to process bulk approval" },
      { status: 500 }
    )
  }
}
