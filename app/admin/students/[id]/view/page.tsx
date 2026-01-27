import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentViewClient from "./client"

interface PageProps {
  params: {
    id: string
  }
}

export default async function StudentViewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/auth/login")
  }

  // Fetch student with all related data
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      currentClass: true,
      school: true,
      account: true,
      parents: {
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      },
      grades: {
        include: {
          subject: true,
          academicYear: true,
          term: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      attendance: {
        orderBy: {
          date: "desc",
        },
        take: 20,
      },
    },
  })

  if (!student) {
    redirect("/admin/students")
  }

  // Transform data for client component
  const studentData = {
    id: student.id,
    studentNumber: student.studentNumber,
    firstName: student.firstName,
    lastName: student.lastName,
    middleName: student.middleName,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth.toISOString(),
    email: student.email,
    phone: student.phone,
    photo: student.photo,
    nationalId: student.nationalId,
    birthCertNumber: student.birthCertNumber,
    status: student.status,
    admissionDate: student.admissionDate.toISOString(),
    address: student.address,
    bloodGroup: student.bloodGroup,
    allergies: student.allergies,
    medicalConditions: student.medicalConditions,
    previousSchool: student.previousSchool,
    previousGrade: student.previousGrade,
    curriculum: student.curriculum,
    isBoarding: student.isBoarding,
    currentClass: student.currentClass
      ? {
          id: student.currentClass.id,
          name: student.currentClass.name,
          level: student.currentClass.level,
        }
      : null,
    account: student.account
      ? {
          balance: student.account.balance.toNumber(),
          lastPaymentDate: student.account.lastPaymentDate?.toISOString() || null,
          lastPaymentAmount: student.account.lastPaymentAmount?.toNumber() || null,
        }
      : null,
    school: {
      name: student.school.name,
      email: student.school.email,
      phone: student.school.phone,
    },
    parents: student.parents.map((ps) => ({
      id: ps.parent.id,
      name: ps.parent.user.name,
      email: ps.parent.user.email,
      phone: ps.parent.user.phone,
      relationship: ps.relationship,
      isPrimary: ps.isPrimary,
      occupation: ps.parent.occupation,
      employer: ps.parent.employer,
      workPhone: ps.parent.workPhone,
    })),
    documents: student.documents as any,
    userActive: student.user?.isActive || false,
    userEmail: student.user?.email,
    grades: student.grades.map((grade) => ({
      id: grade.id,
      subject: grade.subject?.name || "Unknown",
      score: grade.score.toNumber(),
      term: grade.term?.name || "Unknown",
      academicYear: grade.academicYear?.name || "Unknown",
    })),
    attendance: student.attendance.map((att) => ({
      id: att.id,
      date: att.date.toISOString(),
      status: att.status,
      remarks: att.remarks,
    })),
  }

  return <StudentViewClient student={studentData} />
}
