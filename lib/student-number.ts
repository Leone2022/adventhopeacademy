import { prisma } from "@/lib/prisma"

const STUDENT_NUMBER_PREFIX = "STU"
const STUDENT_SEQUENCE_PAD = 5

export function isStandardStudentNumber(studentNumber: string | null | undefined): boolean {
  if (!studentNumber) return false
  return /^STU\d{9}$/.test(studentNumber)
}

export async function generateNextStudentNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()

  const lastStudent = await prisma.student.findFirst({
    where: {
      studentNumber: {
        startsWith: `${STUDENT_NUMBER_PREFIX}${currentYear}`,
      },
    },
    orderBy: {
      studentNumber: "desc",
    },
    select: {
      studentNumber: true,
    },
  })

  let sequence = 1
  if (lastStudent?.studentNumber) {
    const lastSequence = parseInt(lastStudent.studentNumber.slice(7), 10)
    if (!Number.isNaN(lastSequence)) {
      sequence = lastSequence + 1
    }
  }

  return `${STUDENT_NUMBER_PREFIX}${currentYear}${sequence.toString().padStart(STUDENT_SEQUENCE_PAD, "0")}`
}
