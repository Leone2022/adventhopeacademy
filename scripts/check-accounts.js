const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("=== Checking Login Accounts ===\n")

  // Check admin
  const admin = await prisma.user.findUnique({
    where: { email: "admin@adventhope.ac.zw" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      status: true,
      emailVerified: true,
      failedLoginAttempts: true,
      accountLockedUntil: true,
    },
  })

  console.log("1. Admin Account:")
  if (admin) {
    console.log("   ✅ Found")
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Status: ${admin.status}`)
    console.log(`   Active: ${admin.isActive ? "Yes" : "No"}`)
    console.log(`   Must Change Password: ${admin.mustChangePassword ? "Yes" : "No"}`)
    console.log(`   Email Verified: ${admin.emailVerified ? "Yes" : "No"}`)
    console.log(`   Failed Login Attempts: ${admin.failedLoginAttempts}`)
    console.log(`   Account Locked: ${admin.accountLockedUntil ? "Yes until " + admin.accountLockedUntil : "No"}`)
  } else {
    console.log("   ❌ Not Found")
  }

  // Check parent
  const parent = await prisma.user.findUnique({
    where: { email: "testparent@adventhope.ac.zw" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      status: true,
      emailVerified: true,
      failedLoginAttempts: true,
      accountLockedUntil: true,
    },
  })

  console.log("\n2. Parent Account:")
  if (parent) {
    console.log("   ✅ Found")
    console.log(`   Email: ${parent.email}`)
    console.log(`   Name: ${parent.name}`)
    console.log(`   Role: ${parent.role}`)
    console.log(`   Status: ${parent.status}`)
    console.log(`   Active: ${parent.isActive ? "Yes" : "No"}`)
    console.log(`   Must Change Password: ${parent.mustChangePassword ? "Yes" : "No"}`)
    console.log(`   Email Verified: ${parent.emailVerified ? "Yes" : "No"}`)
    console.log(`   Failed Login Attempts: ${parent.failedLoginAttempts}`)
    console.log(`   Account Locked: ${parent.accountLockedUntil ? "Yes until " + parent.accountLockedUntil : "No"}`)
  } else {
    console.log("   ❌ Not Found")
  }

  // Check student
  const student = await prisma.user.findUnique({
    where: { email: "teststudent@adventhope.ac.zw" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      status: true,
      emailVerified: true,
      failedLoginAttempts: true,
      accountLockedUntil: true,
    },
  })

  console.log("\n3. Student Account:")
  if (student) {
    console.log("   ✅ Found")
    console.log(`   Email: ${student.email}`)
    console.log(`   Name: ${student.name}`)
    console.log(`   Role: ${student.role}`)
    console.log(`   Status: ${student.status}`)
    console.log(`   Active: ${student.isActive ? "Yes" : "No"}`)
    console.log(`   Must Change Password: ${student.mustChangePassword ? "Yes" : "No"}`)
    console.log(`   Email Verified: ${student.emailVerified ? "Yes" : "No"}`)
    console.log(`   Failed Login Attempts: ${student.failedLoginAttempts}`)
    console.log(`   Account Locked: ${student.accountLockedUntil ? "Yes until " + student.accountLockedUntil : "No"}`)

    // Check student profile
    const studentProfile = await prisma.student.findUnique({
      where: { studentNumber: "STU2024999" },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    })
    
    console.log("\n   Student Profile:")
    if (studentProfile) {
      console.log("   ✅ Found")
      console.log(`   Number: ${studentProfile.studentNumber}`)
      console.log(`   Name: ${studentProfile.firstName} ${studentProfile.lastName}`)
      console.log(`   Status: ${studentProfile.status}`)
    } else {
      console.log("   ❌ Not Found")
    }
  } else {
    console.log("   ❌ Not Found")
  }

  console.log("\n=== Summary ===")
  console.log("All accounts should be:")
  console.log("  - Active: Yes")
  console.log("  - Must Change Password: No")
  console.log("  - Account Locked: No")
  console.log("  - Failed Login Attempts: 0")
  console.log("\nIf any account has issues, run:")
  console.log("  - node scripts/create-admin.js (for admin)")
  console.log("  - node scripts/create-test-accounts.js (for parent/student)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
