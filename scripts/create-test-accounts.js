const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("Creating test accounts with pre-approved passwords...")

  // Test Parent Account
  const parentPassword = await bcrypt.hash("parent123", 10)
  const testParent = await prisma.user.upsert({
    where: { email: "testparent@adventhope.ac.zw" },
    update: {},
    create: {
      email: "testparent@adventhope.ac.zw",
      password: parentPassword,
      name: "Test Parent",
      phone: "+263773102001",
      role: "PARENT",
      mustChangePassword: false, // Allow immediate access
      isActive: true,
    },
  })

  // Create parent profile
  const parentProfile = await prisma.parent.upsert({
    where: { userId: testParent.id },
    update: {},
    create: {
      userId: testParent.id,
    },
  })

  console.log("✅ Test Parent Account Created:")
  console.log("   Email: testparent@adventhope.ac.zw")
  console.log("   Password: parent123")
  console.log("   No password change required!")

  // Test Student Account
  const studentPassword = await bcrypt.hash("student123", 10)
  
  // Create school first if needed
  const school = await prisma.school.findFirst()
  
  if (school) {
    // Create user first
    const testStudentUser = await prisma.user.upsert({
      where: { email: "teststudent@adventhope.ac.zw" },
      update: {},
      create: {
        email: "teststudent@adventhope.ac.zw",
        password: studentPassword,
        name: "Test Student",
        role: "STUDENT",
        mustChangePassword: false,
        isActive: true,
        schoolId: school.id,
      },
    })

    // Then create student linked to user
    const testStudent = await prisma.student.upsert({
      where: { studentNumber: "STU2024999" },
      update: {},
      create: {
        studentNumber: "STU2024999",
        firstName: "Test",
        lastName: "Student",
        email: "teststudent@adventhope.ac.zw",
        gender: "MALE",
        dateOfBirth: new Date("2010-01-01"),
        admissionDate: new Date(),
        status: "ACTIVE",
        schoolId: school.id,
        curriculum: "ZIMSEC",
        userId: testStudentUser.id,
      },
    })

    // Create student account
    await prisma.studentAccount.upsert({
      where: { studentId: testStudent.id },
      update: {},
      create: {
        studentId: testStudent.id,
        balance: 0,
      },
    })

    // Link parent to student
    await prisma.parentStudent.upsert({
      where: {
        parentId_studentId: {
          parentId: parentProfile.id,
          studentId: testStudent.id,
        },
      },
      update: {},
      create: {
        parentId: parentProfile.id,
        studentId: testStudent.id,
        relationship: "Parent",
        isPrimary: true,
        canPickup: true,
        emergencyContact: true,
      },
    })

    console.log("\n✅ Test Student Account Created:")
    console.log("   Registration Number: STU2024999")
    console.log("   Password: student123")
    console.log("   No password change required!")
    console.log("\n✅ Parent-Student Relationship Created:")
    console.log("   Parent linked to student as primary contact!")
  }

  console.log("\n📝 Login URLs:")
  console.log("   Portal Login: http://localhost:3001/portal/login")
  console.log("   Admin Login: http://localhost:3001/auth/login")
  console.log("\n✅ You can now explore the system without password change prompts!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
