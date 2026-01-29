import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentDetailsClient from "./client"

export default async function StudentDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "PARENT") {
    redirect("/portal/login")
  }

  // Verify parent has access to this student
  const parentProfile = await prisma.parent.findUnique({
    where: { userId: session.user.id },
  })

  if (!parentProfile) {
    redirect("/portal/login")
  }

  const link = await prisma.parentStudent.findFirst({
    where: {
      parentId: parentProfile.id,
      studentId: params.id,
    },
  })

  if (!link) {
    redirect("/parent/dashboard")
  }

  // Get complete student details
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      currentClass: {
        select: {
          id: true,
          name: true,
          level: true,
          stream: true,
          curriculum: true,
        },
      },
      school: {
        select: {
          id: true,
          name: true,
        },
      },
      account: {
        select: {
          balance: true,
          lastPaymentDate: true,
          lastPaymentAmount: true,
        },
      },
      attendance: {
        select: {
          id: true,
          date: true,
          status: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 10,
      },
      grades: {
        select: {
          id: true,
          subject: true,
          score: true,
          term: true,
          academicYear: true,
        },
        orderBy: {
          academicYear: "desc",
        },
      },
    },
  })

  if (!student) {
    redirect("/parent/dashboard")
  }

  return <StudentDetailsClient student={student} />
}
