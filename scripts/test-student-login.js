const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function testStudentLogin() {
  console.log("=== Testing Student Login Flow ===\n")

  // Step 1: Find student by registration number
  console.log("Step 1: Finding student by registration number (STU2024999)...")
  const student = await prisma.student.findUnique({
    where: { studentNumber: "STU2024999" },
    include: {
      user: {
        include: {
          school: true,
        },
      },
      school: true,
    },
  })

  if (!student) {
    console.log("❌ Student not found by registration number!")
    return
  }

  console.log("✅ Student found:")
  console.log(`   ID: ${student.id}`)
  console.log(`   Number: ${student.studentNumber}`)
  console.log(`   Name: ${student.firstName} ${student.lastName}`)
  console.log(`   Status: ${student.status}`)
  console.log(`   User ID: ${student.userId}`)

  if (!student.user) {
    console.log("\n❌ User not linked to student!")
    return
  }

  // Step 2: Check user
  console.log("\n✅ User linked to student:")
  console.log(`   Email: ${student.user.email}`)
  console.log(`   Role: ${student.user.role}`)
  console.log(`   Active: ${student.user.isActive}`)
  console.log(`   Must Change Password: ${student.user.mustChangePassword}`)
  console.log(`   Status: ${student.user.status}`)

  // Step 3: Check password
  console.log("\nStep 2: Checking password...")
  const testPassword = "student123"
  const passwordMatch = await bcrypt.compare(testPassword, student.user.password)
  console.log(`   Password: ${testPassword}`)
  console.log(`   Hash: ${student.user.password.substring(0, 30)}...`)
  console.log(`   Match: ${passwordMatch ? "✅ YES" : "❌ NO"}`)

  if (!passwordMatch) {
    console.log("\n   ⚠️  Password mismatch! Resetting password...")
    const newHash = await bcrypt.hash(testPassword, 10)
    await prisma.user.update({
      where: { id: student.user.id },
      data: { password: newHash },
    })
    console.log("   ✅ Password reset successfully")
  }

  // Step 4: Reset failed login attempts
  console.log("\nStep 3: Resetting failed login attempts...")
  await prisma.user.update({
    where: { id: student.user.id },
    data: {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      accountLockedUntil: null,
    },
  })
  console.log("✅ Failed login attempts reset to 0")

  console.log("\n=== Test Complete ===")
  console.log("Student login should now work with:")
  console.log("  Registration Number: STU2024999")
  console.log("  Password: student123")
  console.log("  Role: Student")
  console.log("\nURL: http://localhost:3001/portal/login")
}

testStudentLogin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
