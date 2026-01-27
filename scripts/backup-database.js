const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupDir = path.join(__dirname, "../backups")
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`)

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  console.log("🔄 Starting database backup...")

  try {
    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        schools: await prisma.school.findMany(),
        users: await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            schoolId: true,
            isActive: true,
            emailVerified: true,
            lastLogin: true,
            mustChangePassword: true,
            failedLoginAttempts: true,
            lastFailedLoginAt: true,
            accountLockedUntil: true,
            createdAt: true,
            updatedAt: true,
            createdBy: true,
          },
        }),
        parents: await prisma.parent.findMany(),
        students: await prisma.student.findMany(),
        applications: await prisma.application.findMany(),
        classes: await prisma.class.findMany(),
        staff: await prisma.staff.findMany(),
        subjects: await prisma.subject.findMany(),
        studentAccounts: await prisma.studentAccount.findMany(),
        feeStructures: await prisma.feeStructure.findMany(),
        parentStudents: await prisma.parentStudent.findMany(),
      },
    }

    // Calculate statistics
    const stats = {
      schools: backup.data.schools.length,
      users: backup.data.users.length,
      parents: backup.data.parents.length,
      students: backup.data.students.length,
      applications: backup.data.applications.length,
      classes: backup.data.classes.length,
      staff: backup.data.staff.length,
    }

    backup.statistics = stats

    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))

    console.log("✅ Database backup completed successfully!")
    console.log(`📁 Backup file: ${backupFile}`)
    console.log(`📊 Backup statistics:`)
    console.log(`   - Schools: ${stats.schools}`)
    console.log(`   - Users: ${stats.users}`)
    console.log(`   - Parents: ${stats.parents}`)
    console.log(`   - Students: ${stats.students}`)
    console.log(`   - Applications: ${stats.applications}`)
    console.log(`   - Classes: ${stats.classes}`)
    console.log(`   - Staff: ${stats.staff}`)

    // Clean up old backups (keep last 30 days)
    cleanOldBackups(backupDir)

    return backupFile
  } catch (error) {
    console.error("❌ Backup failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

function cleanOldBackups(backupDir) {
  const files = fs.readdirSync(backupDir)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let deletedCount = 0

  files.forEach((file) => {
    if (file.startsWith("backup-") && file.endsWith(".json")) {
      const filePath = path.join(backupDir, file)
      const stats = fs.statSync(filePath)

      if (stats.mtime < thirtyDaysAgo) {
        fs.unlinkSync(filePath)
        deletedCount++
      }
    }
  })

  if (deletedCount > 0) {
    console.log(`🗑️  Cleaned up ${deletedCount} old backup(s) (older than 30 days)`)
  }
}

// Run backup
backupDatabase()
  .then(() => {
    console.log("\n✅ Backup process completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Backup process failed:", error)
    process.exit(1)
  })
