/**
 * Database Cleanup Analysis Script (READ-ONLY)
 * Preview what will be deleted without making changes
 * 
 * Usage: npx ts-node scripts/analyze-cleanup.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AnalysisStats {
  duplicateUsers: number;
  orphanedStudents: number;
  orphanedParents: number;
  orphanedStaff: number;
  inactiveApplications: number;
  orphanedInvoices: number;
  expiredSessions: number;
  orphanedAccounts: number;
}

const stats: AnalysisStats = {
  duplicateUsers: 0,
  orphanedStudents: 0,
  orphanedParents: 0,
  orphanedStaff: 0,
  inactiveApplications: 0,
  orphanedInvoices: 0,
  expiredSessions: 0,
  orphanedAccounts: 0,
};

async function analyzeDuplicateUsers() {
  console.log("\n📋 DUPLICATE USERS ANALYSIS");
  console.log("-".repeat(50));

  const duplicates = await prisma.$queryRaw<
    Array<{ email: string; count: number }>
  >`
    SELECT email, COUNT(*) as count
    FROM users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  `;

  if (duplicates.length === 0) {
    console.log("No duplicate users found ✓");
    return;
  }

  for (const dup of duplicates) {
    console.log(`\n📧 Email: ${dup.email} (${dup.count} users)`);

    const users = await prisma.user.findMany({
      where: { email: dup.email },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const isKeep = i === 0 ? "✓ KEEP" : "✗ DELETE";

      console.log(
        `  ${isKeep} | ${user.id.slice(0, 8)} | ${user.name} | Role: ${user.role} | Status: ${user.status} | Created: ${user.createdAt.toLocaleDateString()}`
      );
    }

    stats.duplicateUsers += dup.count - 1; // Count excess users to be deleted
  }
}

async function analyzeOrphanedStudents() {
  console.log("\n\n👨‍🎓 ORPHANED STUDENTS ANALYSIS (No User Account)");
  console.log("-".repeat(50));

  const students = await prisma.student.findMany({
    where: { userId: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentNumber: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          parents: true,
          grades: true,
          attendance: true,
          disciplineRecords: true,
        },
      },
    },
  });

  if (students.length === 0) {
    console.log("No orphaned students found ✓");
    return;
  }

  console.log(`Found ${students.length} students without user accounts:\n`);

  for (const student of students) {
    const hasData =
      student._count.parents > 0 ||
      student._count.grades > 0 ||
      student._count.attendance > 0;
    const status = hasData ? "⚠ KEEP (has data)" : "✗ DELETE (safe)";

    console.log(
      `${status} | ${student.firstName} ${student.lastName} (${student.studentNumber})`
    );
    console.log(
      `        Parents: ${student._count.parents}, Grades: ${student._count.grades}, Attendance: ${student._count.attendance}`
    );

    if (!hasData) {
      stats.orphanedStudents++;
    }
  }
}

async function analyzeOrphanedParents() {
  console.log("\n\n👨‍👩‍👧 ORPHANED PARENTS ANALYSIS (No Students)");
  console.log("-".repeat(50));

  const parents = await prisma.parent.findMany({
    where: {
      students: {
        none: {},
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      _count: {
        select: {
          payments: true,
        },
      },
    },
  });

  if (parents.length === 0) {
    console.log("No orphaned parents found ✓");
    return;
  }

  console.log(`Found ${parents.length} parents without students:\n`);

  for (const parent of parents) {
    const status =
      parent._count.payments > 0 ? "⚠ KEEP (has payments)" : "✗ DELETE (safe)";

    console.log(`${status} | ${parent.firstName} ${parent.lastName}`);
    console.log(`        Payments: ${parent._count.payments}`);

    if (parent._count.payments === 0) {
      stats.orphanedParents++;
    }
  }
}

async function analyzeOrphanedStaff() {
  console.log("\n\n👨‍🏫 ORPHANED STAFF ANALYSIS (No User Account)");
  console.log("-".repeat(50));

  const staff = await prisma.staff.findMany({
    where: { userId: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeNumber: true,
      createdAt: true,
      _count: {
        select: {
          classTeacher: true,
          timetables: true,
          hostelManager: true,
        },
      },
    },
  });

  if (staff.length === 0) {
    console.log("No orphaned staff found ✓");
    return;
  }

  console.log(`Found ${staff.length} staff without user accounts:\n`);

  for (const s of staff) {
    const hasResponsibilities =
      s._count.classTeacher > 0 ||
      s._count.timetables > 0 ||
      s._count.hostelManager > 0;
    const status = hasResponsibilities ? "⚠ KEEP (has duties)" : "✗ DELETE (safe)";

    console.log(`${status} | ${s.firstName} ${s.lastName} (${s.employeeNumber})`);
    console.log(
      `        Classes: ${s._count.classTeacher}, Timetables: ${s._count.timetables}, Hostels: ${s._count.hostelManager}`
    );

    if (!hasResponsibilities) {
      stats.orphanedStaff++;
    }
  }
}

async function analyzeInactiveApplications() {
  console.log("\n\n📝 INACTIVE APPLICATIONS ANALYSIS (DRAFT, Older than 90 days)");
  console.log("-".repeat(50));

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const apps = await prisma.application.findMany({
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
      lastName: true,
      createdAt: true,
      status: true,
    },
  });

  if (apps.length === 0) {
    console.log("No old draft applications found ✓");
    return;
  }

  console.log(`Found ${apps.length} old draft applications (before ${ninetyDaysAgo.toLocaleDateString()}):\n`);

  for (const app of apps) {
    const daysOld = Math.floor(
      (Date.now() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(
      `✗ ${app.applicationNumber} | ${app.firstName} ${app.lastName} | ${daysOld} days old`
    );
    stats.inactiveApplications++;
  }
}

async function analyzeOrphanedInvoices() {
  console.log("\n\n📄 ORPHANED INVOICES ANALYSIS");
  console.log("-".repeat(50));

  // studentAccountId is required (NOT NULL) in schema, so orphaned invoices
  // cannot exist due to foreign key constraints
  console.log("No orphaned invoices possible (studentAccountId is required) ✓");
}

async function analyzeExpiredSessions() {
  console.log("\n\n🔐 EXPIRED SESSIONS ANALYSIS");
  console.log("-".repeat(50));

  const now = new Date();
  const expiredSessions = await prisma.session.count({
    where: {
      expires: {
        lt: now,
      },
    },
  });

  if (expiredSessions === 0) {
    console.log("No expired sessions found ✓");
    return;
  }

  console.log(`Found ${expiredSessions} expired sessions to clean up\n`);
  stats.expiredSessions = expiredSessions;
}

async function analyzeOrphanedAccounts() {
  console.log("\n\n🔑 ORPHANED OAUTH ACCOUNTS ANALYSIS");
  console.log("-".repeat(50));

  // userId is required (NOT NULL) in schema, so orphaned accounts
  // cannot exist due to foreign key constraints
  console.log("No orphaned OAuth accounts possible (userId is required) ✓");
}

async function main() {
  try {
    console.log("🔍 DATABASE CLEANUP ANALYSIS (READ-ONLY)\n");
    console.log("Scanning for unused and orphaned data...\n");

    await analyzeDuplicateUsers();
    await analyzeOrphanedStudents();
    await analyzeOrphanedParents();
    await analyzeOrphanedStaff();
    await analyzeInactiveApplications();
    await analyzeOrphanedInvoices();
    await analyzeExpiredSessions();
    await analyzeOrphanedAccounts();

    // Summary
    const totalToDelete =
      stats.duplicateUsers +
      stats.orphanedStudents +
      stats.orphanedParents +
      stats.orphanedStaff +
      stats.inactiveApplications +
      stats.orphanedInvoices +
      stats.expiredSessions +
      stats.orphanedAccounts;

    console.log("\n\n" + "=".repeat(50));
    console.log("📊 CLEANUP SUMMARY");
    console.log("=".repeat(50));
    console.log(`Duplicate users:          ${stats.duplicateUsers}`);
    console.log(`Orphaned students:        ${stats.orphanedStudents}`);
    console.log(`Orphaned parents:         ${stats.orphanedParents}`);
    console.log(`Orphaned staff:           ${stats.orphanedStaff}`);
    console.log(`Inactive applications:    ${stats.inactiveApplications}`);
    console.log(`Orphaned invoices:        ${stats.orphanedInvoices}`);
    console.log(`Expired sessions:         ${stats.expiredSessions}`);
    console.log(`Orphaned OAuth accounts:  ${stats.orphanedAccounts}`);
    console.log("=".repeat(50));
    console.log(`🗑️  TOTAL RECORDS TO DELETE: ${totalToDelete}\n`);
    console.log("To proceed with cleanup, run:");
    console.log("  npx ts-node scripts/cleanup-database.ts\n");
  } catch (error) {
    console.error("❌ Error during analysis:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
