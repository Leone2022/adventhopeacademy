import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN"]
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    // Fetch pending registrations
    const where: any = { status: "PENDING" }
    if (session.user.schoolId) {
      where.schoolId = session.user.schoolId
    }
    if (role && role !== "ALL") {
      where.role = role
    }

    const registrations = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
          emailVerified: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true,
            gradeApplying: true,
          },
        },
        parentProfile: {
          select: {
            firstName: true,
            lastName: true,
            address: true,
            applicationNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format response to match client expectations
    const formattedRegistrations = registrations.map((reg) => ({
      id: reg.id,
      email: reg.email,
      name: reg.name,
      phone: reg.phone || "",
      role: reg.role,
      status: reg.status,
      createdAt: reg.createdAt,
        emailVerified: !!reg.emailVerified,
      studentInfo: reg.studentProfile
        ? {
            firstName: reg.studentProfile.firstName,
            lastName: reg.studentProfile.lastName,
            gradeApplying: reg.studentProfile.gradeApplying,
          }
        : undefined,
      parentInfo: reg.parentProfile
        ? {
            firstName: reg.parentProfile.firstName,
            lastName: reg.parentProfile.lastName,
            address: reg.parentProfile.address,
            applicationNumber: reg.parentProfile.applicationNumber,
          }
        : undefined,
    }))

    return NextResponse.json(formattedRegistrations)
  } catch (error) {
    console.error("Failed to fetch pending registrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    )
  }
}
