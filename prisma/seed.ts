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

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

