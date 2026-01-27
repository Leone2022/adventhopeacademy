const { PrismaClient } = require("@prisma/client")
const crypto = require("crypto")

async function main() {
  const email = process.argv[2] || "admin@adventhope.ac.zw"
  const prisma = new PrismaClient()

  const rawToken = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
  const expires = new Date(Date.now() + 60 * 60 * 1000)

  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    },
  })

  console.log("User updated:", { id: user.id, email: user.email })
  console.log("Reset token:")
  console.log(rawToken)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
