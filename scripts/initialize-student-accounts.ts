/**
 * Script to initialize financial accounts for all students
 * Run with: npx ts-node scripts/initialize-student-accounts.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for students without financial accounts...\n');

  // Get all students without accounts
  const studentsWithoutAccounts = await prisma.student.findMany({
    where: {
      account: null,
    },
    select: {
      id: true,
      studentNumber: true,
      firstName: true,
      lastName: true,
      status: true,
    },
  });

  console.log(`Found ${studentsWithoutAccounts.length} students without financial accounts\n`);

  if (studentsWithoutAccounts.length === 0) {
    console.log('✅ All students already have financial accounts!');
    return;
  }

  console.log('📝 Students without accounts:');
  studentsWithoutAccounts.forEach((student, index) => {
    console.log(
      `   ${index + 1}. ${student.studentNumber} - ${student.firstName} ${student.lastName} (${student.status})`
    );
  });

  console.log('\n💾 Creating financial accounts...\n');

  // Create accounts in batch
  const accountsToCreate = studentsWithoutAccounts.map(student => ({
    studentId: student.id,
    balance: 0,
  }));

  const result = await prisma.studentAccount.createMany({
    data: accountsToCreate,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully created ${result.count} financial accounts!\n`);

  // Verify all accounts were created
  const remainingWithoutAccounts = await prisma.student.count({
    where: {
      account: null,
    },
  });

  if (remainingWithoutAccounts === 0) {
    console.log('🎉 All students now have financial accounts!');
  } else {
    console.log(`⚠️  Warning: ${remainingWithoutAccounts} students still don't have accounts`);
  }
}

main()
  .catch((error) => {
    console.error('❌ Error initializing accounts:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
