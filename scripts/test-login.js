const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function testLogin() {
  console.log("=== Testing Login Password Verification ===\n")

  // Test admin login
  console.log("1. Testing Admin Login...")
  const admin = await prisma.user.findUnique({
    where: { email: "admin@adventhope.ac.zw" },
  })

  if (admin) {
    const testPassword = "admin123"
    const isValid = await bcrypt.compare(testPassword, admin.password)
    console.log(`   Password: ${testPassword}`)
    console.log(`   Hash in DB: ${admin.password.substring(0, 30)}...`)
    console.log(`   Match: ${isValid ? "✅ YES" : "❌ NO"}`)

    if (!isValid) {
      console.log("\n   ⚠️  Password mismatch detected! Updating...")
      const newHash = await bcrypt.hash(testPassword, 10)
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: newHash },
      })
      console.log("   ✅ Password updated successfully")
    }
  }

  // Test parent login
  console.log("\n2. Testing Parent Login...")
  const parent = await prisma.user.findUnique({
    where: { email: "testparent@adventhope.ac.zw" },
  })

  if (parent) {
    const testPassword = "parent123"
    const isValid = await bcrypt.compare(testPassword, parent.password)
    console.log(`   Password: ${testPassword}`)
    console.log(`   Hash in DB: ${parent.password.substring(0, 30)}...`)
    console.log(`   Match: ${isValid ? "✅ YES" : "❌ NO"}`)

    if (!isValid) {
      console.log("\n   ⚠️  Password mismatch detected! Updating...")
      const newHash = await bcrypt.hash(testPassword, 10)
      await prisma.user.update({
        where: { id: parent.id },
        data: { password: newHash },
      })
      console.log("   ✅ Password updated successfully")
    }
  }

  // Test student login
  console.log("\n3. Testing Student Login...")
  const student = await prisma.user.findUnique({
    where: { email: "teststudent@adventhope.ac.zw" },
  })

  if (student) {
    const testPassword = "student123"
    const isValid = await bcrypt.compare(testPassword, student.password)
    console.log(`   Password: ${testPassword}`)
    console.log(`   Hash in DB: ${student.password.substring(0, 30)}...`)
    console.log(`   Match: ${isValid ? "✅ YES" : "❌ NO"}`)

    if (!isValid) {
      console.log("\n   ⚠️  Password mismatch detected! Updating...")
      const newHash = await bcrypt.hash(testPassword, 10)
      await prisma.user.update({
        where: { id: student.id },
        data: { password: newHash },
      })
      console.log("   ✅ Password updated successfully")
    }
  }

  console.log("\n=== Test Complete ===")
  console.log("\nLogin Credentials:")
  console.log("  Admin:   admin@adventhope.ac.zw / admin123")
  console.log("  Parent:  testparent@adventhope.ac.zw / parent123")
  console.log("  Student: STU2024999 / student123")
  console.log("\nIf passwords match, login should work!")
}

testLogin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
