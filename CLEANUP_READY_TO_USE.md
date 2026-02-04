# 🎯 Database Cleanup - Complete Setup

**Status**: ✅ READY TO USE  
**Created**: February 4, 2026  
**Purpose**: Clean duplicate users and orphaned data locally before pushing to GitHub

---

## 📦 What You Have Now

### Scripts Created
1. **cleanup-database.ts** - Main cleanup script (modifies database)
2. **analyze-cleanup.ts** - Preview script (read-only, no changes)
3. **delete-user-by-email.ts** - Delete specific user interactively
4. **start-cleanup.ps1** - Interactive wizard to guide the process

### Documentation
1. **CLEANUP_QUICK_REFERENCE.md** - Copy-paste commands for quick start
2. **DATABASE_CLEANUP_GUIDE.md** - Comprehensive guide with all details
3. **CLEANUP_IMPLEMENTATION.md** - Technical implementation details
4. **This file** - Overview and next steps

---

## 🚀 Quick Start (3 Minutes)

### Option 1: Interactive Wizard (Easiest)
```powershell
# Run the wizard - it guides you through each step
.\start-cleanup.ps1
```

### Option 2: Manual Commands
```powershell
# 1. Backup first (safety!)
npx ts-node scripts/backup-database.js

# 2. Preview what will be deleted (read-only)
npx ts-node scripts/analyze-cleanup.ts

# 3. Review output carefully...

# 4. Run cleanup if satisfied
npx ts-node scripts/cleanup-database.ts

# 5. Test locally
npm run dev

# 6. Push to git
git commit -m "chore: Clean up duplicate users and orphaned records"
git push origin main
```

---

## 🎯 Your Specific Situation

**Challenge**: Members registered before, data lost, now creating accounts again  
**Solution**: Clean up old unused data before fresh registrations

**How It Helps**:
1. ✅ Removes old duplicate accounts with same email
2. ✅ Cleans up orphaned records from lost data
3. ✅ Allows fresh registration with same email
4. ✅ Smaller, cleaner database
5. ✅ Better data integrity going forward

**Workflow**:
```
Analyze → Review → Cleanup → Test → Push to GitHub
```

---

## 📋 What Gets Cleaned

| Item | Action | Details |
|------|--------|---------|
| Duplicate Users | Keep oldest, delete unused newer | Safely handles duplicate emails |
| Orphaned Students | Delete if no grades/attendance | Won't delete active students |
| Orphaned Parents | Delete if no students | Won't delete if has payments |
| Orphaned Staff | Delete if no classes | Won't delete if assigned duties |
| Old Drafts | Delete if >90 days old | Draft applications never submitted |
| Expired Sessions | Delete | Old login tokens |
| Orphaned Invoices | Delete | Invoices without student accounts |

---

## 🔐 Safety Guarantees

✅ **Will NOT Accidentally Delete**:
- Active user accounts
- Student records with grades or attendance
- Parent records with children
- Staff assigned to classes or duties
- Recent transactions
- Submitted applications
- Recent data

✅ **Protection Mechanisms**:
1. Analysis script shows what will be deleted (read-only)
2. User confirms in script before deletion
3. Cascade deletes maintain relationships
4. Backup restore available anytime
5. Clear logging of what was removed

---

## 🧪 Testing Before Pushing

```powershell
# 1. Start dev server
npm run dev

# 2. Test in browser:
#    - Login with admin
#    - Login with student
#    - Create new student account
#    - View applications
#    - Check dashboard

# 3. Verify in console:
#    - No errors
#    - No data missing
#    - Everything works

# 4. If broken:
npx ts-node scripts/restore-database.js
# Then diagnose and try again
```

---

## 📚 Which Document to Read?

| Need | Document | Time |
|------|----------|------|
| Get started fast | CLEANUP_QUICK_REFERENCE.md | 2 min |
| Understand everything | DATABASE_CLEANUP_GUIDE.md | 10 min |
| Technical details | CLEANUP_IMPLEMENTATION.md | 5 min |
| What's available | This file | 3 min |

---

## 🆘 Common Questions

**Q: Is the analysis script safe?**  
A: ✅ YES - It only reads data, never modifies anything

**Q: Can I undo the cleanup?**  
A: ✅ YES - Restore from backup anytime

**Q: What if I break something?**  
A: Don't panic! Restore: `npx ts-node scripts/restore-database.js`

**Q: Should I backup production?**  
A: ✅ YES - Always backup before cleanup, anywhere

**Q: How long does cleanup take?**  
A: Minutes for most databases, depends on size

**Q: Can I clean one person at a time?**  
A: ✅ YES - Use `delete-user-by-email.ts` script

**Q: Do I need to push after cleanup?**  
A: ✅ YES - Commit and push the cleaned database state

---

## ✅ Checklist

### Before Cleanup
- [ ] Read CLEANUP_QUICK_REFERENCE.md
- [ ] Run backup: `npx ts-node scripts/backup-database.js`
- [ ] Run analysis: `npx ts-node scripts/analyze-cleanup.ts`
- [ ] Review output carefully
- [ ] Make sure nothing critical is marked for deletion

### During Cleanup
- [ ] Run cleanup: `npx ts-node scripts/cleanup-database.ts`
- [ ] Watch for any errors
- [ ] Note the statistics shown

### After Cleanup
- [ ] Test locally: `npm run dev`
- [ ] Try login
- [ ] Create test account
- [ ] Verify important data is still there
- [ ] Check console for errors

### Before Pushing
- [ ] Everything working locally
- [ ] No console errors
- [ ] Important data intact
- [ ] Ready to commit: `git commit -m "chore: Clean up duplicate users and orphaned records"`
- [ ] Ready to push: `git push origin main`

---

## 🎯 One-Liner Commands

```powershell
# Backup
npx ts-node scripts/backup-database.js

# Analyze (read-only)
npx ts-node scripts/analyze-cleanup.ts

# Cleanup (modifies)
npx ts-node scripts/cleanup-database.ts

# Delete one user
npx ts-node scripts/delete-user-by-email.ts

# Restore from backup
npx ts-node scripts/restore-database.js

# Test locally
npm run dev

# Git workflow
git commit -m "chore: Clean up duplicate users and orphaned records"
git push origin main
```

---

## 📊 Expected Results

### Database State After Cleanup
- ✅ No duplicate user emails
- ✅ No orphaned records
- ✅ Smaller database size
- ✅ Better data integrity
- ✅ Ready for fresh registrations
- ✅ Clean, organized data

### Git Commit
```
chore: Clean up duplicate users and orphaned records

- Removed duplicate user accounts with same email
- Deleted orphaned student/parent/staff records
- Removed old draft applications (>90 days)
- Cleaned up expired sessions and OAuth accounts
- Database optimized, ready for new registrations
```

---

## 🚀 You're Ready!

Everything is set up. Time to:

1. **Open PowerShell**
2. **Navigate to project**: `cd c:\adverthopeacademy`
3. **Choose your approach**:
   - Easy: `.\start-cleanup.ps1` (interactive wizard)
   - Manual: Follow CLEANUP_QUICK_REFERENCE.md commands

That's it! The cleanup system is ready to use locally, and you can push to GitHub when satisfied.

---

**Need Help?**
- Quick commands → **CLEANUP_QUICK_REFERENCE.md**
- Detailed guide → **DATABASE_CLEANUP_GUIDE.md**  
- Technical details → **CLEANUP_IMPLEMENTATION.md**

**Remember**: Analyze first, cleanup second, test third, push last! 🎯
