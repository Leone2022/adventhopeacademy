import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Search for students by number or name
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"]
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Search query too short" }, { status: 400 })
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { studentNumber: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
        status: "ACTIVE",
        schoolId: session.user.schoolId || undefined,
      },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        lastName: true,
        currentClassId: true,
        currentClass: {
          select: {
            name: true,
          },
        },
        gender: true,
        dateOfBirth: true,
        parents: {
          select: {
            parentId: true,
          },
        },
      },
      take: 20,
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error searching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Link student to parent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"]
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Linking is managed by school administration after in-person verification." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { studentId, parentId, relationship } = body

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    if (!parentId) {
      return NextResponse.json({ error: "Parent ID is required" }, { status: 400 })
    }

    const parentProfile = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        user: {
          select: {
            schoolId: true,
            name: true,
          },
        },
      },
    })

    if (!parentProfile) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 })
    }

    if (
      session.user.schoolId &&
      parentProfile.user?.schoolId &&
      parentProfile.user.schoolId !== session.user.schoolId
    ) {
      return NextResponse.json({ error: "Parent belongs to another school" }, { status: 403 })
    }

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentNumber: true,
        schoolId: true,
        currentClass: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (session.user.schoolId && student.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: "Student belongs to another school" }, { status: 403 })
    }

    // Check if already linked
    const existing = await prisma.parentStudent.findFirst({
      where: {
        parentId: parentProfile.id,
        studentId: studentId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "This student is already linked to this parent" },
        { status: 400 }
      )
    }

    // Create link
    const link = await prisma.parentStudent.create({
      data: {
        parentId: parentProfile.id,
        studentId: studentId,
        relationship: relationship || "Parent",
        isPrimary: true,
        canPickup: true,
        emergencyContact: false,
      },
    })

    await prisma.auditLog.create({
      data: {
        schoolId: student.schoolId,
        userId: session.user.id,
        action: "LINK_PARENT_STUDENT",
        entityType: "ParentStudent",
        entityId: link.id,
        newValues: {
          parentId: parentProfile.id,
          studentId: student.id,
          relationship: link.relationship,
          linkedByRole: session.user.role,
        },
      },
    })

    return NextResponse.json({
      message: "Student linked successfully",
      link,
      student,
    })
  } catch (error) {
    console.error("Error linking student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Unlink student from parent (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parentId")
    const studentId = searchParams.get("studentId")

    if (!parentId || !studentId) {
      return NextResponse.json({ error: "parentId and studentId are required" }, { status: 400 })
    }

    const link = await prisma.parentStudent.findFirst({
      where: { parentId, studentId },
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    await prisma.parentStudent.delete({
      where: { id: link.id },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UNLINK_PARENT_STUDENT",
        entityType: "ParentStudent",
        entityId: link.id,
        oldValues: {
          parentId,
          studentId,
        },
      },
    })

    return NextResponse.json({ message: "Student unlinked successfully" })
  } catch (error) {
    console.error("Error unlinking student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
