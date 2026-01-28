import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ParentsListClient from "./client"

export default async function ParentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.user.role)) {
    redirect("/auth/login")
  }

  const parents = await prisma.parent.findMany({
    where: {
      user: {
        role: "PARENT",
        status: "ACTIVE",
        schoolId: session.user.schoolId || undefined,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          isActive: true,
          createdAt: true,
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
    orderBy: { createdAt: "desc" },
  })

  const parentsData = parents.map((p) => ({
    id: p.id,
    applicationNumber: p.applicationNumber || "-",
    name: p.user.name,
    email: p.user.email,
    phone: p.user.phone,
    status: p.user.status,
    isActive: p.user.isActive,
    createdAt: p.user.createdAt.toISOString(),
    city: p.city,
    occupation: p.occupation,
    employer: p.employer,
    students: p.students.map((ps) => ({
      id: ps.student.id,
      studentNumber: ps.student.studentNumber,
      name: `${ps.student.firstName} ${ps.student.lastName}`.trim(),
      status: ps.student.status,
      relationship: ps.relationship,
      isPrimary: ps.isPrimary,
    })),
  }))

  return <ParentsListClient parents={parentsData} />
}
