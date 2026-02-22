import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET parent details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parentId = params.id

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            status: true,
            isActive: true,
          },
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                studentNumber: true,
                firstName: true,
                lastName: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 })
    }

    return NextResponse.json(parent)
  } catch (error) {
    console.error("Error fetching parent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// UPDATE parent details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parentId = params.id
    const body = await request.json()

    const { firstName, lastName, city, occupation, employer, workPhone, workAddress, address, alternatePhone, email, phone, name } = body

    // Update parent details
    const parent = await prisma.parent.update({
      where: { id: parentId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        city: city || undefined,
        occupation: occupation || undefined,
        employer: employer || undefined,
        workPhone: workPhone || undefined,
        workAddress: workAddress || undefined,
        address: address || undefined,
        alternatePhone: alternatePhone || undefined,
      },
      include: {
        user: true,
        students: {
          include: {
            student: {
              select: {
                id: true,
                studentNumber: true,
                firstName: true,
                lastName: true,
                status: true,
              },
            },
          },
        },
      },
    })

    // Update user details if provided
    if (email || name || phone) {
      await prisma.user.update({
        where: { id: parent.userId },
        data: {
          email: email || undefined,
          name: name || undefined,
          phone: phone || undefined,
        },
      })
    }

    return NextResponse.json({
      message: "Parent updated successfully",
      parent,
    })
  } catch (error) {
    console.error("Error updating parent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Reset parent password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parentId = params.id
    const body = await request.json()
    const { action } = body

    if (action === "reset-password") {
      const { newPassword } = body

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        )
      }

      const parent = await prisma.parent.findUnique({
        where: { id: parentId },
        select: { userId: true },
      })

      if (!parent) {
        return NextResponse.json({ error: "Parent not found" }, { status: 404 })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await prisma.user.update({
        where: { id: parent.userId },
        data: {
          password: hashedPassword,
          mustChangePassword: true, // Force password change on next login
        },
      })

      return NextResponse.json({
        message: "Password reset successfully. Parent must change password on next login.",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE parent account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parentId = params.id

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            schoolId: true,
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    })

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 })
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN"
    if (!isSuperAdmin && session.user.schoolId && parent.user.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (parent._count.payments > 0) {
      return NextResponse.json(
        { error: "Cannot delete parent with payment records. Remove payment references first." },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.message.updateMany({
        where: { parentId },
        data: { parentId: null },
      })

      await tx.user.delete({
        where: { id: parent.userId },
      })
    })

    return NextResponse.json({ message: "Parent deleted successfully" })
  } catch (error) {
    console.error("Error deleting parent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
