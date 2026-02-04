/**
 * Database Cleanup Script
 * Removes duplicate users, orphaned records, and unused data
 * 
 * Usage: npx ts-node scripts/cleanup-database.ts
 * 
 * WARNING: This script modifies the database. Make a backup first!
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CleanupStats {
  duplicateUsersRemoved: number;
  orphanedStudentsRemoved: number;
  orphanedParentsRemoved: number;
  orphanedStaffRemoved: number;
  inactiveApplicationsRemoved: number;
  orphanedInvoicesRemoved: number;
  orphanedSessionsRemoved: number;
  orphanedAccountsRemoved: number;
  totalRecordsProcessed: number;
}

const stats: CleanupStats = {
  duplicateUsersRemoved: 0,
  orphanedStudentsRemoved: 0,
  orphanedParentsRemoved: 0,
  orphanedStaffRemoved: 0,
  inactiveApplicationsRemoved: 0,
  orphanedInvoicesRemoved: 0,
  orphanedSessionsRemoved: 0,
  orphanedAccountsRemoved: 0,
  totalRecordsProcessed: 0,
};

async function cleanupDuplicateUsers() {
  console.log("\n📋 Checking for duplicate users by email...");

  // Find all emails that appear more than once
  const duplicates = await prisma.$queryRaw<
    Array<{ email: string; count: number }>
  >`
    SELECT email, COUNT(*) as count
    FROM users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  `;

  for (const dup of duplicates) {
    console.log(`\n  Found ${dup.count} users with email: ${dup.email}`);

    // Get all users with this email
    const usersWithEmail = await prisma.user.findMany({
      where: { email: dup.email },
      orderBy: { createdAt: "asc" },
    });

    // Keep the first one (oldest), remove others
    for (let i = 1; i < usersWithEmail.length; i++) {
      const userToDelete = usersWithEmail[i];

      // Check if this user is referenced elsewhere
      const studentCount = await prisma.student.count({
        where: { userId: userToDelete.id },
      });
      const parentCount = await prisma.parent.count({
        where: { userId: userToDelete.id },
      });
      const staffCount = await prisma.staff.count({
        where: { userId: userToDelete.id },
      });

      // Only delete if not actively used
      if (studentCount === 0 && parentCount === 0 && staffCount === 0) {
        console.log(
          `    ✓ Deleting unused duplicate user: ${userToDelete.id}`
        );

        // Delete related records first (Cascade should handle this, but explicit is safer)
        await prisma.session.deleteMany({
          where: { userId: userToDelete.id },
        });
        await prisma.account.deleteMany({
          where: { userId: userToDelete.id },
        });

        // Delete the user
        await prisma.user.delete({
          where: { id: userToDelete.id },
        });

        stats.duplicateUsersRemoved++;
      } else {
        console.log(
          `    ⚠ Keeping duplicate (in use): ${userToDelete.id} - Student: ${studentCount}, Parent: ${parentCount}, Staff: ${staffCount}`
        );
      }
    }
  }
}

async function cleanupOrphanedStudents() {
  console.log("\n👨‍🎓 Checking for orphaned students (no valid user)...");

  // Find students without valid user references
  const orphanedStudents = await prisma.student.findMany({
    where: {
      userId: null,
    },
    select: { id: true, firstName: true, lastName: true, createdAt: true },
  });

  console.log(`  Found ${orphanedStudents.length} students without user accounts`);

  for (const student of orphanedStudents) {
    // Check if student has any active relationships
    const parentCount = await prisma.parentStudent.count({
      where: { studentId: student.id },
    });
    const gradeCount = await prisma.grade.count({
      where: { studentId: student.id },
    });
    const attendanceCount = await prisma.attendance.count({
      where: { studentId: student.id },
    });

    // Only delete if no related data
    if (parentCount === 0 && gradeCount === 0 && attendanceCount === 0) {
      console.log(`  ✓ Deleting orphaned student: ${student.firstName} ${student.lastName}`);

      // Delete related records
      await prisma.disciplineRecord.deleteMany({
        where: { studentId: student.id },
      });
      await prisma.reportCard.deleteMany({
        where: { studentId: student.id },
      });
      await prisma.hostelAllocation.deleteMany({
        where: { studentId: student.id },
      });
      await prisma.studentAccount.deleteMany({
        where: { studentId: student.id },
      });
      await prisma.application.deleteMany({
        where: {
          convertedToStudentId: student.id,
        },
      });

      await prisma.student.delete({
        where: { id: student.id },
      });

      stats.orphanedStudentsRemoved++;
    } else {
      console.log(
        `  ⚠ Keeping orphaned student (has data): ${student.firstName} - Parents: ${parentCount}, Grades: ${gradeCount}, Attendance: ${attendanceCount}`
      );
    }
  }
}

async function cleanupOrphanedParents() {
  console.log("\n👨‍👩‍👧 Checking for orphaned parents (no students)...");

  // Find parents without any students
  const orphanedParents = await prisma.parent.findMany({
    where: {
      students: {
        none: {},
      },
    },
    select: { id: true, firstName: true, lastName: true, createdAt: true },
  });

  console.log(`  Found ${orphanedParents.length} parents without students`);

  for (const parent of orphanedParents) {
    // Check if parent has payments
    const paymentCount = await prisma.payment.count({
      where: { parentId: parent.id },
    });

    if (paymentCount === 0) {
      console.log(`  ✓ Deleting orphaned parent: ${parent.firstName} ${parent.lastName}`);

      await prisma.parent.delete({
        where: { id: parent.id },
      });

      stats.orphanedParentsRemoved++;
    } else {
      console.log(
        `  ⚠ Keeping orphaned parent (has payments): ${parent.firstName}`
      );
    }
  }
}

async function cleanupOrphanedStaff() {
  console.log("\n👨‍🏫 Checking for orphaned staff (no user)...");

  const orphanedStaff = await prisma.staff.findMany({
    where: {
      userId: null,
    },
    select: { id: true, firstName: true, lastName: true, createdAt: true },
  });

  console.log(`  Found ${orphanedStaff.length} staff without user accounts`);

  for (const staff of orphanedStaff) {
    // Check if staff has any responsibilities
    const classCount = await prisma.class.count({
      where: { classTeacherId: staff.id },
    });
    const timetableCount = await prisma.timetable.count({
      where: { teacherId: staff.id },
    });
    const hostelCount = await prisma.hostel.count({
      where: { managerId: staff.id },
    });

    if (classCount === 0 && timetableCount === 0 && hostelCount === 0) {
      console.log(`  ✓ Deleting orphaned staff: ${staff.firstName} ${staff.lastName}`);

      await prisma.classSubject.deleteMany({
        where: { teacherId: staff.id },
      });

      await prisma.staff.delete({
        where: { id: staff.id },
      });

      stats.orphanedStaffRemoved++;
    } else {
      console.log(
        `  ⚠ Keeping orphaned staff (has responsibilities): ${staff.firstName} - Classes: ${classCount}, Timetables: ${timetableCount}, Hostels: ${hostelCount}`
      );
    }
  }
}

async function cleanupInactiveApplications() {
  console.log("\n📝 Checking for inactive applications (DRAFT status, old)...");

  // Find draft applications older than 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const inactiveApps = await prisma.application.findMany({
    where: {
      AND: [
        { status: "DRAFT" },
        { createdAt: { lt: ninetyDaysAgo } },
        { convertedToStudentId: null },
      ],
    },
    select: {
      id: true,
      applicationNumber: true,
      firstName: true,
      createdAt: true,
    },
  });

  console.log(
    `  Found ${inactiveApps.length} inactive draft applications (older than 90 days)`
  );

  for (const app of inactiveApps) {
    console.log(
      `  ✓ Deleting inactive application: ${app.applicationNumber} (${app.firstName})`
    );

    await prisma.application.delete({
      where: { id: app.id },
    });

    stats.inactiveApplicationsRemoved++;
  }
}

async function cleanupOrphanedInvoices() {
  console.log("\n📄 Checking for orphaned invoices (deleted student accounts)...");

  const orphanedInvoices = await prisma.invoice.findMany({
    where: {
      studentAccount: null,
    },
    select: { id: true, invoiceNumber: true, createdAt: true },
  });

  console.log(`  Found ${orphanedInvoices.length} invoices without student accounts`);

  for (const invoice of orphanedInvoices) {
    console.log(`  ✓ Deleting orphaned invoice: ${invoice.invoiceNumber}`);

    // Delete invoice items and transactions first
    const items = await prisma.invoiceItem.findMany({
      where: { invoiceId: invoice.id },
      select: { id: true },
    });

    for (const item of items) {
      await prisma.transaction.deleteMany({
        where: { invoiceItemId: item.id },
      });
    }

    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: invoice.id },
    });

    await prisma.invoice.delete({
      where: { id: invoice.id },
    });

    stats.orphanedInvoicesRemoved++;
  }
}

async function cleanupExpiredSessions() {
  console.log("\n🔐 Checking for expired sessions...");

  const now = new Date();
  const expiredSessions = await prisma.session.findMany({
    where: {
      expires: {
        lt: now,
      },
    },
    select: { id: true, expires: true },
  });

  console.log(`  Found ${expiredSessions.length} expired sessions`);

  if (expiredSessions.length > 0) {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: now,
        },
      },
    });

    stats.orphanedSessionsRemoved = result.count;
    console.log(`  ✓ Deleted ${result.count} expired sessions`);
  }
}

async function cleanupOrphanedAccounts() {
  console.log("\n🔑 Checking for orphaned OAuth accounts...");

  const orphanedAccounts = await prisma.account.findMany({
    where: {
      user: null,
    },
    select: { id: true, provider: true, createdAt: true },
  });

  console.log(`  Found ${orphanedAccounts.length} orphaned OAuth accounts`);

  if (orphanedAccounts.length > 0) {
    const result = await prisma.account.deleteMany({
      where: {
        user: null,
      },
    });

    stats.orphanedAccountsRemoved = result.count;
    console.log(`  ✓ Deleted ${result.count} orphaned OAuth accounts`);
  }
}

async function main() {
  try {
    console.log("🚀 Starting database cleanup...\n");
    console.log("⚠️  WARNING: This script will permanently delete records!");
    console.log("📦 Make sure you have a backup before proceeding.\n");

    // Execute cleanup operations
    await cleanupDuplicateUsers();
    await cleanupOrphanedStudents();
    await cleanupOrphanedParents();
    await cleanupOrphanedStaff();
    await cleanupInactiveApplications();
    await cleanupOrphanedInvoices();
    await cleanupExpiredSessions();
    await cleanupOrphanedAccounts();

    // Calculate total
    stats.totalRecordsProcessed =
      stats.duplicateUsersRemoved +
      stats.orphanedStudentsRemoved +
      stats.orphanedParentsRemoved +
      stats.orphanedStaffRemoved +
      stats.inactiveApplicationsRemoved +
      stats.orphanedInvoicesRemoved +
      stats.orphanedSessionsRemoved +
      stats.orphanedAccountsRemoved;

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 CLEANUP SUMMARY");
    console.log("=".repeat(50));
    console.log(`✓ Duplicate users removed:     ${stats.duplicateUsersRemoved}`);
    console.log(`✓ Orphaned students removed:   ${stats.orphanedStudentsRemoved}`);
    console.log(`✓ Orphaned parents removed:    ${stats.orphanedParentsRemoved}`);
    console.log(`✓ Orphaned staff removed:      ${stats.orphanedStaffRemoved}`);
    console.log(
      `✓ Inactive applications removed: ${stats.inactiveApplicationsRemoved}`
    );
    console.log(`✓ Orphaned invoices removed:   ${stats.orphanedInvoicesRemoved}`);
    console.log(`✓ Expired sessions removed:    ${stats.orphanedSessionsRemoved}`);
    console.log(
      `✓ Orphaned OAuth accounts removed: ${stats.orphanedAccountsRemoved}`
    );
    console.log("=".repeat(50));
    console.log(`📈 TOTAL RECORDS REMOVED:      ${stats.totalRecordsProcessed}`);
    console.log("=".repeat(50) + "\n");

    console.log("✅ Cleanup completed successfully!");
    console.log(
      "📌 If satisfied with results, commit and push to git.\n"
    );
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
