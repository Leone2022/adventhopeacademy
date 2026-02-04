# Database Cleanup Guide

## Overview

This guide walks you through cleaning up duplicate and orphaned data from your Advent Hope Academy database. This is useful when:
- Members registered before but data was lost
- Creating new accounts for previously registered members
- You have duplicate user emails in the system
- You need to remove unused/orphaned records before fresh registrations

## ⚠️ Important Safety First

**ALWAYS backup your database before running cleanup scripts!**

```powershell
# Create a backup
npx ts-node scripts/backup-database.js
```

## Step 1: Analyze What Will Be Deleted (Safe, Read-Only)

First, run the analysis script to see what will be cleaned up:

```powershell
npx ts-node scripts/analyze-cleanup.ts
```

This script will show you:
- ✗ **DELETE (safe)** - Records that can be safely deleted
- ⚠ **KEEP (has data)** - Records that will be kept because they have related data
- Count of everything that will be removed

**Review the output carefully** before proceeding to the actual cleanup.

### What Gets Analyzed

1. **Duplicate Users** - Multiple user accounts with same email
   - Keeps: oldest (first) user
   - Deletes: newer duplicates (if not in use)

2. **Orphaned Students** - Student records without user account
   - Deletes: only if they have no grades, attendance, or parent relationships

3. **Orphaned Parents** - Parent accounts without any students
   - Deletes: only if they have no payment history

4. **Orphaned Staff** - Staff records without user account
   - Deletes: only if not assigned as class teacher, in timetables, or hostel manager

5. **Inactive Applications** - DRAFT applications older than 90 days
   - Deletes: old draft applications that were never submitted

6. **Orphaned Invoices** - Invoices without student accounts
   - Deletes: invoices linked to deleted student accounts

7. **Expired Sessions** - Login sessions that have expired
   - Deletes: old session tokens (safe to delete)

8. **Orphaned OAuth Accounts** - OAuth accounts without user references
   - Deletes: abandoned social login records

## Step 2: Run the Actual Cleanup (Modifies Database)

Once you've reviewed the analysis and are satisfied, run:

```powershell
npx ts-node scripts/cleanup-database.ts
```

The script will:
- Show progress as it deletes each record
- Delete cascading relationships automatically
- Show a summary at the end
- NOT delete anything marked as "⚠ KEEP"

## Step 3: Verify Results

After cleanup:

1. Check that legitimate accounts still exist:
   ```powershell
   # Login and verify
   npm run dev
   ```

2. Test logging in with admin and student accounts

3. Verify no important data is missing

4. If something went wrong, restore from backup:
   ```powershell
   npx ts-node scripts/restore-database.js
   ```

## Step 4: Commit and Push to Git

Once you're confident everything is correct:

```powershell
# Stage changes (cleanup is local database, no file changes)
git status

# Create a commit documenting the cleanup
git commit -m "clean: Remove duplicate users and orphaned records

- Cleaned up duplicate user accounts with same email
- Removed orphaned student/parent/staff records
- Deleted old draft applications (>90 days)
- Removed expired sessions and orphaned invoices
- Database size reduced, improved data integrity"

# Push to GitHub
git push origin main
```

## Handling Duplicate Emails - Specific Cases

### Case: User Registered Before, Lost Data, Now Registering Again

1. **Scenario**: User registered with email before, data lost, now creating new account
2. **Solution**: 
   - The old inactive user account will be flagged as duplicate
   - Cleanup keeps the oldest (first registration)
   - New registrations will fail due to unique email constraint
   - **Action**: Delete the old record manually BEFORE creating new account, OR use a different email temporarily

### How to Manually Delete One Specific User

If you need to delete a specific user account before cleanup:

```typescript
// Create a temporary script at scripts/delete-user.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteSpecificUser(userId: string) {
  try {
    // Delete related records
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });

    // Delete the user
    const user = await prisma.user.delete({ where: { id: userId } });
    console.log(`✓ Deleted user: ${user.email}`);
  } catch (error) {
    console.error("Error deleting user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage
const userIdToDelete = "YOUR_USER_ID_HERE";
deleteSpecificUser(userIdToDelete);
```

Then run:
```powershell
npx ts-node scripts/delete-user.ts
```

## Troubleshooting

### Script Won't Run - Dependencies Missing

```powershell
# Install TypeScript if needed
npm install --save-dev typescript ts-node @types/node

# Run with proper TS loader
npx ts-node scripts/cleanup-database.ts
```

### Database Connection Error

```powershell
# Verify environment variables
cat .env

# Ensure DATABASE_URL or POSTGRES_PRISMA_URL is set correctly
# For local testing, use local PostgreSQL connection string
```

### Accidentally Deleted Important Data

Don't panic! Restore from backup:

```powershell
# Restore the backup
npx ts-node scripts/restore-database.js

# Or manually restore from backup file
psql -U postgres -d advent_hope < backups/backup-2026-01-22T20-12-37-527Z.sql
```

## Workflow Summary

```
1. Backup database
   ↓
2. Run: npx ts-node scripts/analyze-cleanup.ts
   ↓
3. Review output (don't delete anything you need!)
   ↓
4. Run: npx ts-node scripts/cleanup-database.ts
   ↓
5. Test application - verify nothing broke
   ↓
6. If OK: commit and push
   If NOT OK: restore from backup and try again
```

## Questions?

- **Duplicate emails after cleanup?** The oldest account is kept. Delete it manually if needed.
- **Lost important data?** Restore from backup - backups are in `/backups` folder
- **Script errors?** Check that all dependencies are installed: `npm install`

---

**Remember**: Run the analysis script first (step 1) - it never modifies your database!
