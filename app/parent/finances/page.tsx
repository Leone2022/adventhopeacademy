import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ParentFinancesClient from "./client"

export default async function ParentFinancesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "PARENT") {
    redirect("/portal/login")
  }

  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: { name: true },
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
              curriculum: true,
              currentClass: {
                select: { name: true },
              },
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
    redirect("/portal/login")
  }

  const children = parent.students
    .filter((ps) => ps.student.status === "ACTIVE")
    .map((ps) => ({
      id: ps.student.id,
      firstName: ps.student.firstName,
      lastName: ps.student.lastName,
      studentNumber: ps.student.studentNumber,
      curriculum: ps.student.curriculum,
      className: ps.student.currentClass?.name || "Unassigned",
      balance: ps.student.account?.balance ? Number(ps.student.account.balance) : 0,
      lastPaymentDate: ps.student.account?.lastPaymentDate?.toISOString() || null,
      lastPaymentAmount: ps.student.account?.lastPaymentAmount
        ? Number(ps.student.account.lastPaymentAmount)
        : null,
    }))

  return (
    <ParentFinancesClient
      parentName={parent.user.name || "Parent"}
      children={children}
    />
  )
}
