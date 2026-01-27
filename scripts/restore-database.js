const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

async function restoreDatabase(backupFilePath) {
  console.log("🔄 Starting database restore...")
  console.log(`📁 Backup file: ${backupFilePath}`)

  try {
    // Read backup file
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`)
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, "utf8"))

    console.log(`📅 Backup created: ${backupData.timestamp}`)
    console.log(`📊 Backup statistics:`)
    if (backupData.statistics) {
      Object.entries(backupData.statistics).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`)
      })
    }

    // Confirm restore
    console.log("\n⚠️  WARNING: This will delete ALL current data and restore from backup!")
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...")

    await new Promise((resolve) => setTimeout(resolve, 5000))

    console.log("\n🗑️  Deleting current data...")

    // Delete in correct order (respecting foreign keys)
    await prisma.parentStudent.deleteMany()
    await prisma.studentAccount.deleteMany()
    await prisma.parent.deleteMany()
    await prisma.student.deleteMany()
    await prisma.application.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.class.deleteMany()
    await prisma.feeStructure.deleteMany()
    await prisma.user.deleteMany()
    await prisma.school.deleteMany()

    console.log("✅ Current data deleted")
    console.log("\n📥 Restoring data from backup...")

    // Restore data in correct order
    const data = backupData.data

    // Schools
    for (const school of data.schools) {
      await prisma.school.create({ data: school })
    }
    console.log(`   ✓ Restored ${data.schools.length} schools`)

    // Users (need to handle password field separately - it's excluded in backup)
    for (const user of data.users) {
      await prisma.user.create({
        data: {
          ...user,
          password: user.password || "$2a$10$defaultpasswordhash", // Placeholder if missing
        },
      })
    }
    console.log(`   ✓ Restored ${data.users.length} users`)

    // Classes
    for (const classItem of data.classes) {
      await prisma.class.create({ data: classItem })
    }
    console.log(`   ✓ Restored ${data.classes.length} classes`)

    // Fee Structures
    for (const fee of data.feeStructures) {
      await prisma.feeStructure.create({ data: fee })
    }
    console.log(`   ✓ Restored ${data.feeStructures.length} fee structures`)

    // Parents
    for (const parent of data.parents) {
      await prisma.parent.create({ data: parent })
    }
    console.log(`   ✓ Restored ${data.parents.length} parents`)

    // Students
    for (const student of data.students) {
      await prisma.student.create({ data: student })
    }
    console.log(`   ✓ Restored ${data.students.length} students`)

    // Applications
    for (const application of data.applications) {
      await prisma.application.create({ data: application })
    }
    console.log(`   ✓ Restored ${data.applications.length} applications`)

    // Staff
    for (const staffMember of data.staff) {
      await prisma.staff.create({ data: staffMember })
    }
    console.log(`   ✓ Restored ${data.staff.length} staff`)

    // Subjects
    for (const subject of data.subjects) {
      await prisma.subject.create({ data: subject })
    }
    console.log(`   ✓ Restored ${data.subjects.length} subjects`)

    // Student Accounts
    for (const account of data.studentAccounts) {
      await prisma.studentAccount.create({ data: account })
    }
    console.log(`   ✓ Restored ${data.studentAccounts.length} student accounts`)

    // Parent-Student relationships
    for (const relation of data.parentStudents) {
      await prisma.parentStudent.create({ data: relation })
    }
    console.log(`   ✓ Restored ${data.parentStudents.length} parent-student relationships`)

    console.log("\n✅ Database restore completed successfully!")
    console.log("⚠️  NOTE: User passwords may need to be reset if they were not included in backup")
  } catch (error) {
    console.error("❌ Restore failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get backup file from command line argument
const backupFile = process.argv[2]

if (!backupFile) {
  console.error("❌ Error: Please provide a backup file path")
  console.log("\nUsage: node restore-database.js <backup-file-path>")
  console.log("Example: node restore-database.js ../backups/backup-2026-01-22.json")
  process.exit(1)
}

const absolutePath = path.resolve(backupFile)

restoreDatabase(absolutePath)
  .then(() => {
    console.log("\n✅ Restore process completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Restore process failed:", error)
    process.exit(1)
  })
