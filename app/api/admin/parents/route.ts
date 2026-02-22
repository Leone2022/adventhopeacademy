import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"]
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const parents = await prisma.parent.findMany({
      where: {
        user: {
          role: "PARENT",
          status: "ACTIVE",
          schoolId: session.user.schoolId || undefined,
        },
      },
      select: {
        id: true,
        applicationNumber: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(
      parents.map((parent) => ({
        id: parent.id,
        name: parent.user.name,
        email: parent.user.email,
        phone: parent.user.phone,
        applicationNumber: parent.applicationNumber,
        linkedStudents: parent._count.students,
      }))
    )
  } catch (error) {
    console.error("Failed to fetch parents:", error)
    return NextResponse.json({ error: "Failed to fetch parents" }, { status: 500 })
  }
}
