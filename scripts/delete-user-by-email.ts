/**
 * Delete User by Email Script
 * Use this to manually remove a specific user before cleanup
 * 
 * Usage: npx ts-node scripts/delete-user-by-email.ts
 */

import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function findAndDeleteUser(email: string) {
  try {
    console.log(`\n🔍 Searching for user with email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        parentProfile: true,
        staffProfile: true,
        sessions: true,
        accounts: true,
      },
    });

    if (!user) {
      console.log("❌ User not found");
      return false;
    }

    console.log("\n📋 Found User:");
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Status: ${user.status}`);
    console.log(`  Created: ${user.createdAt.toLocaleDateString()}`);

    if (user.studentProfile) {
      console.log(`  📚 Student: ${user.studentProfile.firstName} ${user.studentProfile.lastName}`);
      console.log(`     Student #: ${user.studentProfile.studentNumber}`);
      console.log(`     Status: ${user.studentProfile.status}`);
    }

    if (user.parentProfile) {
      console.log(`  👨‍👩‍👧 Parent: ${user.parentProfile.firstName} ${user.parentProfile.lastName}`);
    }

    if (user.staffProfile) {
      console.log(`  👨‍🏫 Staff: ${user.staffProfile.firstName} ${user.staffProfile.lastName}`);
      console.log(`     Position: ${user.staffProfile.position}`);
    }

    console.log(`  Sessions: ${user.sessions.length}`);
    console.log(`  OAuth Accounts: ${user.accounts.length}`);

    // Confirm deletion
    const confirm = await question(
      "\n⚠️  Are you sure you want to delete this user? This cannot be undone! (yes/no): "
    );

    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Deletion cancelled");
      return false;
    }

    console.log("\n🗑️  Deleting user and related data...");

    // Delete in correct order to respect foreign keys
    if (user.studentProfile) {
      // Delete student-related data
      const studentId = user.studentProfile.id;

      // Delete attendances
      await prisma.attendance.deleteMany({
        where: { studentId },
      });
      console.log("  ✓ Deleted attendance records");

      // Delete grades
      await prisma.grade.deleteMany({
        where: { studentId },
      });
      console.log("  ✓ Deleted grade records");

      // Delete discipline records
      await prisma.disciplineRecord.deleteMany({
        where: { studentId },
      });
      console.log("  ✓ Deleted discipline records");

      // Delete report cards
      await prisma.reportCard.deleteMany({
        where: { studentId },
      });
      console.log("  ✓ Deleted report cards");

      // Delete hostel allocations
      await prisma.hostelAllocation.deleteMany({
        where: { studentId },
      });
      console.log("  ✓ Deleted hostel allocations");

      // Delete parent-student relationships
      await prisma.parentStudent.deleteMany({
        where: { studentId },
      });
      console.log("  ✓ Deleted parent-student relationships");

      // Delete student account
      await prisma.studentAccount.deleteMany({
        where: { studentId },
      });
      console.log("  ✓ Deleted student account (invoices & transactions cascade)");

      // Delete application
      await prisma.application.deleteMany({
        where: { convertedToStudentId: studentId },
      });
      console.log("  ✓ Deleted application");

      // Delete student profile
      await prisma.student.delete({
        where: { id: studentId },
      });
      console.log("  ✓ Deleted student profile");
    }

    if (user.parentProfile) {
      const parentId = user.parentProfile.id;

      // Messages cascade delete
      await prisma.parent.delete({
        where: { id: parentId },
      });
      console.log("  ✓ Deleted parent profile");
    }

    if (user.staffProfile) {
      const staffId = user.staffProfile.id;

      // Delete class subject relationships
      await prisma.classSubject.deleteMany({
        where: { teacherId: staffId },
      });
      console.log("  ✓ Deleted class subject relationships");

      // Delete timetables
      await prisma.timetable.deleteMany({
        where: { teacherId: staffId },
      });
      console.log("  ✓ Deleted timetables");

      // Delete staff profile
      await prisma.staff.delete({
        where: { id: staffId },
      });
      console.log("  ✓ Deleted staff profile");
    }

    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
    console.log("  ✓ Deleted sessions");

    // Delete OAuth accounts
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });
    console.log("  ✓ Deleted OAuth accounts");

    // Finally delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log("  ✓ Deleted user account");

    console.log("\n✅ User and all related data deleted successfully!");
    console.log("ℹ️  You can now create a new account with this email address.\n");

    return true;
  } catch (error) {
    console.error("❌ Error during deletion:", error);
    return false;
  }
}

async function main() {
  try {
    console.log("🗑️  DELETE USER BY EMAIL\n");
    console.log("⚠️  WARNING: This will permanently delete the user and associated data!");
    console.log("   Make sure you have a backup before proceeding.\n");

    let continueLoop = true;

    while (continueLoop) {
      const email = await question(
        "Enter user email to delete (or 'quit' to exit): "
      );

      if (email.toLowerCase() === "quit") {
        continueLoop = false;
      } else if (email.trim()) {
        await findAndDeleteUser(email.trim());

        const another = await question(
          "\nDelete another user? (yes/no): "
        );
        if (another.toLowerCase() !== "yes") {
          continueLoop = false;
        }
      } else {
        console.log("❌ Please enter a valid email");
      }
    }

    console.log("\n👋 Goodbye!");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
