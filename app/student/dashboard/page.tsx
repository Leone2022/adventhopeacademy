import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentDashboardClient from "./client"

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    redirect("/portal/login")
  }

  // Fetch student data
  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
    include: {
      user: true,
      currentClass: true,
      school: true,
      account: true,
    },
  })

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Student Profile Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            Please contact the school administration for assistance.
          </p>
        </div>
      </div>
    )
  }

  if (student.status !== "ACTIVE") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Account Inactive
          </h1>
          <p className="text-slate-600 mb-6">
            Your student account is currently {student.status.toLowerCase()}.
            Please contact the school administration for assistance.
          </p>
        </div>
      </div>
    )
  }

  // Transform data for client component
  const studentData = {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    studentNumber: student.studentNumber,
    photo: student.photo,
    email: student.email,
    phone: student.phone,
    currentClass: student.currentClass ? {
      name: student.currentClass.name,
      level: student.currentClass.level,
    } : null,
    account: student.account ? {
      balance: student.account.balance.toNumber(),
    } : null,
    school: {
      name: student.school.name,
    },
  }

  return <StudentDashboardClient student={studentData} />
}
