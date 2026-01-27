const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("Creating admin account...")

  // Create school first if needed
  const school = await prisma.school.upsert({
    where: { subdomain: "main" },
    update: {},
    create: {
      name: "Advent Hope Academy",
      subdomain: "main",
      isActive: true,
    },
  })

  // Admin Account
  const adminPassword = await bcrypt.hash("admin123", 10)
  const testAdmin = await prisma.user.upsert({
    where: { email: "admin@adventhope.ac.zw" },
    update: {
      password: adminPassword,
      mustChangePassword: false,
      isActive: true,
    },
    create: {
      email: "admin@adventhope.ac.zw",
      password: adminPassword,
      name: "Admin User",
      role: "SCHOOL_ADMIN",
      mustChangePassword: false,
      isActive: true,
      schoolId: school.id,
    },
  })

  console.log("✅ Admin Account Created/Updated:")
  console.log("   Email: admin@adventhope.ac.zw")
  console.log("   Password: admin123")
  console.log("   Role: SCHOOL_ADMIN")
  console.log("   Login at: http://localhost:3001/auth/login")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
