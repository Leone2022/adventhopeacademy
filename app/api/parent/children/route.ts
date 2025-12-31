import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get parent profile
    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          include: {
            student: {
              include: {
                currentClass: true,
              },
            },
          },
        },
      },
    })

    if (!parent) {
      return NextResponse.json({ children: [] })
    }

    // Format children data
    const children = parent.students.map((ps) => ({
      id: ps.student.id,
      studentNumber: ps.student.studentNumber,
      firstName: ps.student.firstName,
      lastName: ps.student.lastName,
      middleName: ps.student.middleName,
      dateOfBirth: ps.student.dateOfBirth,
      gender: ps.student.gender,
      photo: ps.student.photo,
      curriculum: ps.student.curriculum,
      admissionDate: ps.student.admissionDate,
      email: ps.student.email,
      phone: ps.student.phone,
      address: ps.student.address,
      currentClass: ps.student.currentClass
        ? {
            id: ps.student.currentClass.id,
            name: ps.student.currentClass.name,
            level: ps.student.currentClass.level,
          }
        : null,
      relationship: ps.relationship,
    }))

    return NextResponse.json({ children })
  } catch (error) {
    console.error("Error fetching children:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching children" },
      { status: 500 }
    )
  }
}
