import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendRejectionEmail } from "@/lib/email"

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

    const { userId, reason } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user status to REJECTED
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    })

    // Send rejection email
    await sendRejectionEmail(user.email, user.name, user.role as "PARENT" | "STUDENT", reason)

    return NextResponse.json(
      {
        message: "Registration rejected and notification sent",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          status: updatedUser.status,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Rejection error:", error)
    return NextResponse.json(
      { error: "Failed to reject registration" },
      { status: 500 }
    )
  }
}
