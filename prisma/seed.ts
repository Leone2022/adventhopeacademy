import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create a Super Admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@adventhopeacademy.com" },
    update: {},
    create: {
      email: "admin@adventhopeacademy.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  })

  console.log("Created Super Admin:", superAdmin.email)

  // Create a sample school (Advent Hope Academy)
  const school = await prisma.school.upsert({
    where: { subdomain: "adventhope" },
    update: {},
    create: {
      name: "Advent Hope Academy",
      subdomain: "adventhope",
      domain: "adventhope.ac.zw",
      email: "info@adventhope.ac.zw",
      phone: "+263-4-1234567",
      address: "Harare, Zimbabwe",
      website: "https://adventhope.ac.zw",
      isActive: true,
    },
  })

  console.log("Created school:", school.name)

  // Create a School Admin for the school
  const schoolAdminPassword = await bcrypt.hash("admin123", 10)
  const schoolAdmin = await prisma.user.upsert({
    where: { email: "admin@adventhope.ac.zw" },
    update: {},
    create: {
      email: "admin@adventhope.ac.zw",
      password: schoolAdminPassword,
      name: "School Administrator",
      role: "SCHOOL_ADMIN",
      schoolId: school.id,
      isActive: true,
    },
  })

  console.log("Created School Admin:", schoolAdmin.email)

  // Create a test student
  const testStudent = await prisma.student.upsert({
    where: { studentNumber: "TEST001" },
    update: {},
    create: {
      studentNumber: "TEST001",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("2010-05-15"),
      gender: "MALE",
      grade: "Grade 6",
      curriculum: "CAMBRIDGE",
      admissionDate: new Date("2024-01-15"),
      schoolId: school.id,
    },
  })

  console.log("Created test student:", testStudent.studentNumber)

  // Create a test parent account
  const parentPassword = await bcrypt.hash("parent123", 10)
  const testParent = await prisma.user.upsert({
    where: { email: "testparent@example.com" },
    update: {},
    create: {
      email: "testparent@example.com",
      password: parentPassword,
      name: "Margaret Doe",
      phone: "+263-77-123-4567",
      role: "PARENT",
      schoolId: school.id,
      isActive: true,
    },
  })

  console.log("Created test parent:", testParent.email)

  // Create Parent record linked to the user
  const parentRecord = await prisma.parent.upsert({
    where: { userId: testParent.id },
    update: {},
    create: {
      userId: testParent.id,
      firstName: "Margaret",
      lastName: "Doe",
      address: "123 School Street, Harare",
    },
  })

  console.log("Created parent record:", parentRecord.id)

  // Link parent to student
  await prisma.parentStudent.upsert({
    where: {
      parentId_studentId: {
        parentId: parentRecord.id,
        studentId: testStudent.id,
      },
    },
    update: {},
    create: {
      parentId: parentRecord.id,
      studentId: testStudent.id,
      relationship: "Mother",
      isPrimary: true,
      canPickup: true,
      emergencyContact: true,
    },
  })

  console.log("Linked parent to student")

  console.log("\n✅ Seeding completed!\n")
  console.log("Test Credentials:")
  console.log("─".repeat(50))
  console.log("Admin Login:")
  console.log("  Email: admin@adventhope.ac.zw")
  console.log("  Password: admin123")
  console.log("\nParent Login:")
  console.log("  Email: testparent@example.com")
  console.log("  Password: parent123")
  console.log("─".repeat(50))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

