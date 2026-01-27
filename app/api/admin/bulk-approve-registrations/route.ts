import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendApprovalEmailWithResetLink } from "@/lib/email"
import { generateResetToken, hashToken } from "@/lib/security"

export async function POST(request: NextRequest) {
  try {
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
          const year = new Date().getFullYear()
          studentNumber = `ADV${year}${String(Date.now()).slice(-6)}`
          await prisma.student.update({
            where: { id: user.studentProfile.id },
            data: { studentNumber },
          })
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
