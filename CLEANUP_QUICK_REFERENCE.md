# Database Cleanup - Quick Reference

## 🚀 Quick Start (Copy & Paste)

### 1. Backup First (Safety!)
```powershell
npx ts-node scripts/backup-database.js
```

### 2. Preview What Will Be Deleted (Read-Only - Safe!)
```powershell
npx ts-node scripts/analyze-cleanup.ts
```
**Read the output. If you see something you need to keep, DON'T run step 3.**

### 3. Run Cleanup (Modifies Database)
```powershell
npx ts-node scripts/cleanup-database.ts
```

### 4. Test & Verify
```powershell
npm run dev
```
Test login with your credentials. If all works, proceed to step 5.

### 5. Commit & Push
```powershell
git add .
git commit -m "chore: Clean up duplicate users and orphaned records"
git push origin main
```

---

## 🎯 Common Scenarios

### Scenario 1: Member Registered Before, Need Clean Slate
1. Run analysis: `npx ts-node scripts/analyze-cleanup.ts`
2. Look for their old email in "DUPLICATE USERS" section
3. Delete old account: `npx ts-node scripts/delete-user-by-email.ts`
4. Then they can register fresh with same email

### Scenario 2: Just Want Cleanup, Don't Care About Specifics
1. Backup: `npx ts-node scripts/backup-database.js`
2. Analyze: `npx ts-node scripts/analyze-cleanup.ts`
3. Cleanup: `npx ts-node scripts/cleanup-database.ts`
4. Test: `npm run dev`
5. Push: `git push origin main`

### Scenario 3: Delete One Specific User Manually
```powershell
npx ts-node scripts/delete-user-by-email.ts
# Enter email when prompted, confirm deletion
```

---

## 📊 What Each Script Does

| Script | Does What | Safe? |
|--------|-----------|-------|
| `analyze-cleanup.ts` | Shows what will be deleted | ✅ YES - Read-only |
| `cleanup-database.ts` | Actually deletes the records | ⚠️ Modifies database |
| `delete-user-by-email.ts` | Delete one user at a time | ⚠️ Modifies database |
| `backup-database.js` | Create backup copy | ✅ YES - Backup only |
| `restore-database.js` | Restore from backup | ⚠️ Overwrites database |

---

## ⚠️ If Something Goes Wrong

### "Oh no, I deleted something I needed!"
Don't panic. Restore from backup:
```powershell
npx ts-node scripts/restore-database.js
```

### "Script won't run, says module not found"
Install dependencies:
```powershell
npm install
npm install --save-dev typescript ts-node
npx ts-node scripts/cleanup-database.ts
```

### "Database connection error"
Check your .env file has correct DATABASE_URL:
```powershell
cat .env
# Should see: POSTGRES_PRISMA_URL or DATABASE_URL with connection string
```

### "Can't find my email in duplicate users"
Run analysis again and look at output carefully:
```powershell
npx ts-node scripts/analyze-cleanup.ts | more
```

---

## 🔍 What Gets Cleaned

✅ **Safe to Delete:**
- Duplicate user accounts (keeps oldest)
- Students with no grades/attendance
- Parents with no children
- Staff with no classes/duties
- Old draft applications (>90 days)
- Expired login sessions
- Orphaned OAuth accounts

❌ **Will Keep:**
- Active user accounts
- Students with grades/attendance
- Parents with students
- Staff with assigned classes
- Submitted applications
- Invoices with activity

---

## 📝 Before You Push to GitHub

```powershell
# Check what you're committing
git status

# See the actual changes (should be none - it's local database only)
git diff

# Commit with good message
git commit -m "chore: Remove duplicate users and orphaned records

- Cleaned up duplicate accounts
- Removed unused records
- Database size reduced
- All tests passing"

# Push to origin
git push origin main
```

---

## 🆘 Need Help?

1. **Run analysis first** - see what will happen
2. **Read the output carefully** - make sure nothing is critical
3. **Make a backup** - always, no exceptions
4. **Run cleanup** - watch for errors
5. **Test everything** - login, create accounts, check data
6. **If broken** - restore backup and start over

---

## Local Development Workflow

```
┌─ Start with backup
│
├─ Analyze (read-only)
│  └─ Review output carefully
│
├─ Cleanup (modifies)
│  └─ Watch for errors
│
├─ Test locally
│  ├─ npm run dev
│  ├─ Try login
│  └─ Check important data
│
├─ If OK → Push to git
│  ├─ git commit
│  └─ git push
│
└─ If BROKEN → Restore backup
   ├─ npx ts-node scripts/restore-database.js
   └─ Diagnose what went wrong
```

---

**Pro Tip**: Copy this entire command to get started immediately:
```powershell
# Backup, analyze, cleanup, test workflow
npx ts-node scripts/backup-database.js; npx ts-node scripts/analyze-cleanup.ts
```

After reviewing output, if satisfied:
```powershell
npx ts-node scripts/cleanup-database.ts
```

---

**Remember**: The analysis script never modifies your database. Run it first, always.
