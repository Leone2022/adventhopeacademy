import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        rejectionReason: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "No registration found for this email address" },
        { status: 404 }
      )
    }

    // Check if user exists in the system at all (they should have status)
    if (!user.status) {
      return NextResponse.json(
        { error: "Invalid user status" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      email: user.email,
      name: user.name,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
      rejectionReason: user.rejectionReason,
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    )
  }
}
