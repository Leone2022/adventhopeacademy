# 📑 Database Cleanup - Complete Index

**Everything You Need to Clean Your Database Locally Before Pushing to GitHub**

---

## 🎯 Start Here

**New to this? Read this first**:  
→ [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) - 5 minute overview

**In a hurry?**  
→ [CLEANUP_QUICK_REFERENCE.md](CLEANUP_QUICK_REFERENCE.md) - Copy-paste commands

**Want a wizard?**  
→ Run: `.\start-cleanup.ps1` - Interactive step-by-step guide

---

## 📚 Documentation (Pick Your Style)

### Quick Guides
- **[CLEANUP_QUICK_REFERENCE.md](CLEANUP_QUICK_REFERENCE.md)** (2 min)
  - Copy-paste commands
  - Common scenarios
  - Quick help table

- **[CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)** (5 min)
  - Overview of everything
  - What you have now
  - Next steps

### Detailed Guides  
- **[DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md)** (10 min)
  - Step-by-step instructions
  - Detailed explanation
  - Troubleshooting section

- **[CLEANUP_IMPLEMENTATION.md](CLEANUP_IMPLEMENTATION.md)** (5 min)
  - Technical details
  - What gets cleaned
  - Safety features

### Visual Guides
- **[CLEANUP_VISUAL_GUIDE.md](CLEANUP_VISUAL_GUIDE.md)** (7 min)
  - Diagrams and flowcharts
  - Visual workflow
  - Decision trees

### Practical Tools
- **[CLEANUP_CHECKLIST.md](CLEANUP_CHECKLIST.md)** (Printable)
  - Step-by-step checklist
  - Print and use while working
  - Track progress

- **[CLEANUP_READY_TO_USE.md](CLEANUP_READY_TO_USE.md)** (3 min)
  - Files created
  - How to use them
  - Testing procedures

---

## 🛠️ Executable Scripts

Located in `scripts/` folder:

### Main Scripts
1. **cleanup-database.ts**
   - Actually deletes records
   - Modifies database
   - Run after analyzing

2. **analyze-cleanup.ts**
   - Preview what will be deleted
   - Read-only (safe)
   - Run first

3. **delete-user-by-email.ts**
   - Delete one user interactively
   - Useful for manual cleanup
   - Cascades delete related data

### Helper Script
4. **start-cleanup.ps1**
   - Interactive wizard
   - Guides you through all steps
   - Easiest option

### Existing Scripts (Already Present)
- `backup-database.js` - Create backup
- `restore-database.js` - Restore from backup

---

## 🚀 How to Use

### Approach 1: Interactive Wizard (Easiest)
```powershell
.\start-cleanup.ps1
```
→ Follows you through each step

### Approach 2: Manual Commands
```powershell
# Step 1: Backup
npx ts-node scripts/backup-database.js

# Step 2: Analyze (preview)
npx ts-node scripts/analyze-cleanup.ts

# Step 3: Review output...

# Step 4: Cleanup
npx ts-node scripts/cleanup-database.ts

# Step 5: Test
npm run dev

# Step 6: Push
git commit -m "chore: Clean up database"
git push origin main
```

### Approach 3: Learning First
1. Read [CLEANUP_QUICK_REFERENCE.md](CLEANUP_QUICK_REFERENCE.md)
2. Read [DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md) if needed
3. Run scripts following the guide
4. Use [CLEANUP_CHECKLIST.md](CLEANUP_CHECKLIST.md) to track progress

---

## 📊 What Gets Cleaned

✅ **Will Delete**:
- Duplicate users (keeps oldest)
- Orphaned students (no user, no grades)
- Orphaned parents (no students)
- Orphaned staff (no assignments)
- Old draft applications (>90 days)
- Expired sessions
- Orphaned OAuth accounts

✅ **Will Keep**:
- Active users
- Students with grades
- Parents with children
- Staff with assignments
- Submitted applications
- Recent data

---

## 🔐 Safety First

**5 Protection Layers**:
1. ✅ Backup first
2. ✅ Analysis script (read-only)
3. ✅ Clear logging
4. ✅ Easy restore
5. ✅ Cascade deletes

**Your Responsibility**:
- Always backup first
- Always analyze before cleanup
- Always test locally first
- Always review output

---

## ❓ Choosing the Right Document

**I need to...**

Get started quickly?
→ [CLEANUP_QUICK_REFERENCE.md](CLEANUP_QUICK_REFERENCE.md)

Understand what's happening?
→ [DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md)

See visual diagrams?
→ [CLEANUP_VISUAL_GUIDE.md](CLEANUP_VISUAL_GUIDE.md)

Use a checklist while working?
→ [CLEANUP_CHECKLIST.md](CLEANUP_CHECKLIST.md)

Know what I'm getting?
→ [CLEANUP_READY_TO_USE.md](CLEANUP_READY_TO_USE.md)

Understand technical details?
→ [CLEANUP_IMPLEMENTATION.md](CLEANUP_IMPLEMENTATION.md)

See overview of everything?
→ [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)

---

## 🎯 Step-by-Step Overview

```
1. BACKUP (Safety)
   └─ npx ts-node scripts/backup-database.js
   └─ Creates snapshot of database

2. ANALYZE (Preview)
   └─ npx ts-node scripts/analyze-cleanup.ts
   └─ Shows what will be deleted
   └─ Never modifies database

3. REVIEW
   └─ Read output carefully
   └─ Confirm you're okay with deletions
   └─ If not sure, read guides

4. CLEANUP (Action)
   └─ npx ts-node scripts/cleanup-database.ts
   └─ Actually deletes records
   └─ Shows statistics

5. TEST (Verify)
   └─ npm run dev
   └─ Test login and core functions
   └─ Verify no data loss

6. COMMIT & PUSH (Deploy)
   └─ git commit -m "chore: Clean up database"
   └─ git push origin main
   └─ Database cleaned and committed
```

---

## ⏱️ Time Estimates

| Task | Time | Notes |
|------|------|-------|
| Backup | 1-2 min | Once |
| Analyze | 1-2 min | Review this carefully |
| Cleanup | 1-5 min | Depends on size |
| Test | 5-10 min | Thorough testing |
| Push | 1-2 min | Git operations |
| **Total** | **15-30 min** | If all goes well |

---

## 🆘 Troubleshooting

**Script won't run?**  
→ [DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md#troubleshooting)

**Deleted wrong data?**  
→ `npx ts-node scripts/restore-database.js`

**Need help?**  
→ See [DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md) - Has Q&A section

**Want to delete one person?**  
→ `npx ts-node scripts/delete-user-by-email.ts`

---

## 📋 Your Specific Scenario

**Problem**: Members registered before, data lost, now registering again

**Solution Steps**:
1. Backup: `npx ts-node scripts/backup-database.js`
2. Analyze: `npx ts-node scripts/analyze-cleanup.ts`
   - Look for their email in "DUPLICATE USERS"
3. Cleanup: `npx ts-node scripts/cleanup-database.ts`
   - Removes old account if safe
4. Test: `npm run dev`
   - Try registration with same email
5. Push: `git commit` + `git push`

---

## ✅ Success Checklist

- [ ] Backup created
- [ ] Analysis reviewed
- [ ] Deletions approved
- [ ] Cleanup completed
- [ ] Tests passed
- [ ] Code pushed
- [ ] Database cleaned

---

## 📞 Quick Help

| Question | Answer |
|----------|--------|
| Where do I start? | [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) |
| How do I do this? | [CLEANUP_QUICK_REFERENCE.md](CLEANUP_QUICK_REFERENCE.md) |
| What's being cleaned? | [CLEANUP_VISUAL_GUIDE.md](CLEANUP_VISUAL_GUIDE.md) |
| How do I test? | [DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md) |
| What can go wrong? | [DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md#troubleshooting) |

---

## 🚀 Ready to Start?

**Choose your path**:

- **Easiest**: Run `.\start-cleanup.ps1` (interactive)
- **Quick**: Follow [CLEANUP_QUICK_REFERENCE.md](CLEANUP_QUICK_REFERENCE.md)
- **Learning**: Read [DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md) first

**All paths lead to the same result**: Clean database ready for GitHub! ✓

---

## 📁 File Organization

```
c:\adverthopeacademy\
│
├── 📄 CLEANUP_INDEX.md ← You are here
├── 📄 CLEANUP_SUMMARY.md ← Quick overview
├── 📄 CLEANUP_QUICK_REFERENCE.md ← Copy-paste commands
├── 📄 CLEANUP_READY_TO_USE.md ← What you have
├── 📄 DATABASE_CLEANUP_GUIDE.md ← Full guide
├── 📄 CLEANUP_IMPLEMENTATION.md ← Technical
├── 📄 CLEANUP_VISUAL_GUIDE.md ← Diagrams
├── 📄 CLEANUP_CHECKLIST.md ← Printable
│
├── 📁 scripts/
│   ├── cleanup-database.ts ← Cleanup script
│   ├── analyze-cleanup.ts ← Preview script
│   ├── delete-user-by-email.ts ← Delete one user
│   ├── backup-database.js ← Existing
│   └── restore-database.js ← Existing
│
├── 📁 backups/
│   └── [your backups will be here]
│
└── [rest of project files...]
```

---

## 🎓 Key Learnings

- **Backup before cleanup** - Non-negotiable
- **Analyze before cleanup** - Preview first
- **Test locally** - Before pushing
- **Document changes** - Git commit message
- **Keep it simple** - Follow the steps

---

## ✨ You Have Everything You Need

✅ Scripts to clean database  
✅ Safe analysis tool  
✅ Complete documentation  
✅ Visual guides  
✅ Printable checklist  
✅ Interactive wizard  
✅ Troubleshooting help  
✅ Recovery procedures  

**Now go clean your database!** 🚀

---

**Questions?** Start with [CLEANUP_QUICK_REFERENCE.md](CLEANUP_QUICK_REFERENCE.md) or [DATABASE_CLEANUP_GUIDE.md](DATABASE_CLEANUP_GUIDE.md)

**Ready?** Run `.\start-cleanup.ps1` or follow the quick reference above!
