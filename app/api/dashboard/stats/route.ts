import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const schoolFilter = session.user.schoolId
      ? { schoolId: session.user.schoolId }
      : {}

    const now = new Date()

    const [
      pendingApprovals,
      totalStudents,
      totalStaff,
      activeClasses,
      totalCharges,
      totalPayments,
      upcomingTerms,
    ] = await Promise.all([
      prisma.user.count({ where: { status: "PENDING", ...schoolFilter } }),
      prisma.student.count({ where: schoolFilter }),
      prisma.staff.count({ where: { ...schoolFilter, isActive: true } }),
      prisma.class.count({ where: { ...schoolFilter, isActive: true } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "CHARGE",
          studentAccount: {
            student: schoolFilter,
          },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "PAYMENT",
          studentAccount: {
            student: schoolFilter,
          },
        },
      }),
      prisma.term.findMany({
        where: {
          startDate: { gte: now },
          academicYear: schoolFilter,
        },
        orderBy: { startDate: "asc" },
        take: 3,
        select: {
          id: true,
          name: true,
          startDate: true,
        },
      }),
    ])

    const chargeTotal = Number(totalCharges._sum.amount || 0)
    const paymentTotal = Number(totalPayments._sum.amount || 0)
    const feeCollectionRate =
      chargeTotal > 0 ? Math.min(100, Math.round((paymentTotal / chargeTotal) * 100)) : 0

    const upcomingEvents = upcomingTerms.map((term) => ({
      id: term.id,
      title: `${term.name} Begins`,
      date: term.startDate.toISOString(),
    }))

    return NextResponse.json({
      pendingApprovals,
      totalStudents,
      totalStaff,
      activeClasses,
      feeCollectionRate,
      upcomingEvents,
    })
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
