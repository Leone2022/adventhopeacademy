import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentsListClient from "./client"

export default async function AdminStudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.user.role)) {
    redirect("/auth/login")
  }

  // Fetch all students with related data
  const students = await prisma.student.findMany({
    where: {
      schoolId: session.user.schoolId!,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
        },
      },
      currentClass: {
        select: {
          id: true,
          name: true,
          level: true,
        },
      },
      account: {
        select: {
          balance: true,
        },
      },
      parents: {
        include: {
          parent: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Transform data for client component
  const studentsData = students.map((student) => ({
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
    status: student.status,
    admissionDate: student.admissionDate.toISOString(),
    currentClass: student.currentClass
      ? {
          id: student.currentClass.id,
          name: student.currentClass.name,
          level: student.currentClass.level,
        }
      : null,
    account: student.account
      ? {
          balance: Number(student.account.balance || 0),
        }
      : null,
    parents: student.parents.map((ps) => ({
      name: ps.parent.user.name,
      email: ps.parent.user.email,
      phone: ps.parent.user.phone,
      relationship: ps.relationship,
      isPrimary: ps.isPrimary,
    })),
    userActive: student.user?.isActive || false,
    documents: student.documents as any,
    address: student.address,
    bloodGroup: student.bloodGroup,
    allergies: student.allergies,
    medicalConditions: student.medicalConditions,
    previousSchool: student.previousSchool,
    curriculum: student.curriculum,
    isBoarding: student.isBoarding,
  }))

  return <StudentsListClient students={studentsData} />
}
