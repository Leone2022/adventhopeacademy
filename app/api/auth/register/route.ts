import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, password, studentNumber, relationship } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Get the default school (Advent Hope Academy)
    const school = await prisma.school.findFirst({
      where: { subdomain: "adventhope" },
    })

    if (!school) {
      return NextResponse.json(
        { error: "School not found. Please contact administrator." },
        { status: 400 }
      )
    }

    // Create user with PARENT role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "PARENT",
        schoolId: school.id,
        isActive: true,
      },
    })

    // Create parent profile
    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
      },
    })

    // If student number provided, try to link to student
    if (studentNumber) {
      const student = await prisma.student.findUnique({
        where: { studentNumber },
      })

      if (student) {
        await prisma.parentStudent.create({
          data: {
            parentId: parent.id,
            studentId: student.id,
            relationship: relationship || "Parent",
            isPrimary: true,
          },
        })
      }
    }

    return NextResponse.json({
      message: "Account created successfully",
      userId: user.id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
