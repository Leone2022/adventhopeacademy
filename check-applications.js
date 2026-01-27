const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  try {
    const total = await prisma.application.count()
    console.log(`Total applications in database: ${total}`)

    const applications = await prisma.application.findMany({
      select: {
        id: true,
        applicationNumber: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    console.log(`\nFirst 50 applications:`)
    applications.forEach((app, index) => {
      console.log(
        `${index + 1}. ${app.applicationNumber} - ${app.firstName} ${app.lastName} (${app.status}) - ${app.createdAt}`
      )
    })
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
