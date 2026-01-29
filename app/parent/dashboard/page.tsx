import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ParentDashboardClient from "./client"

export default async function ParentDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "PARENT") {
    redirect("/portal/login")
  }

  // Fetch parent data with children
  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
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
              gender: true,
              dateOfBirth: true,
              status: true,
              currentClassId: true,
              currentClass: {
                select: {
                  name: true,
                },
              },
              photo: true,
              bloodGroup: true,
              phone: true,
              email: true,
              address: true,
              admissionDate: true,
              account: {
                select: {
                  balance: true,
                  lastPaymentDate: true,
                  lastPaymentAmount: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!parent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Parent Profile Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            Please contact the school administration for assistance.
          </p>
        </div>
      </div>
    )
  }

  // Get active children and transform data for client component
  const activeChildren = parent.students
    .filter((ps) => ps.student.status === "ACTIVE")
    .map((ps) => ({
      id: ps.student.id,
      firstName: ps.student.firstName,
      lastName: ps.student.lastName,
      studentNumber: ps.student.studentNumber,
      photo: ps.student.photo,
      currentClass: ps.student.currentClass ? {
        name: ps.student.currentClass.name,
        level: ps.student.currentClass.level,
      } : null,
      account: ps.student.account ? {
        balance: ps.student.account.balance.toNumber(),
      } : null,
    }))

  return <ParentDashboardClient parent={parent} children={activeChildren} />
}
