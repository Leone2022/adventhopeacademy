# Database Cleanup - Printable Checklist

**Date**: ________________  
**Database**: advent_hope_academy  
**Operator**: ________________

---

## ✅ PRE-CLEANUP CHECKLIST

- [ ] Read CLEANUP_QUICK_REFERENCE.md
- [ ] Close all connections to database
- [ ] Ensure development environment is set up
- [ ] Have backup location ready (/backups/)
- [ ] Have terminal/PowerShell open

---

## 📦 STEP 1: BACKUP (Do This First!)

**Command**: `npx ts-node scripts/backup-database.js`

**Checklist**:
- [ ] Command executed successfully
- [ ] Backup file created in /backups/ folder
- [ ] Note backup filename: ________________________
- [ ] Backup size reasonable (not empty)
- [ ] Error messages? ❌ NO ✅

**Time**: _____ seconds  
**Status**: ☐ Success ☐ Failed

---

## 🔍 STEP 2: ANALYZE (Read-Only, No Changes)

**Command**: `npx ts-node scripts/analyze-cleanup.ts`

**Checklist**:
- [ ] Command executed successfully
- [ ] Output shows "DUPLICATE USERS ANALYSIS"
- [ ] Output shows "ORPHANED STUDENTS ANALYSIS"
- [ ] Output shows "ORPHANED PARENTS ANALYSIS"
- [ ] Output shows "ORPHANED STAFF ANALYSIS"
- [ ] Output shows "INACTIVE APPLICATIONS ANALYSIS"
- [ ] Output shows "CLEANUP SUMMARY" at bottom
- [ ] Note total records to delete: ____________

**Review the output carefully**:
- [ ] Confirm "KEEP" vs "DELETE" items
- [ ] Verify nothing critical is marked for deletion
- [ ] Spot check a few "DELETE" entries
- [ ] Ask: "Is this okay to delete?" for each

**Important Decision**:
```
Are you satisfied with what will be deleted?

☐ YES → Proceed to Step 3 (CLEANUP)
☐ NO  → STOP HERE! Do NOT run cleanup
        Review concerns and discuss
        Consider manual deletion instead
```

**Time**: _____ seconds  
**Status**: ☐ Happy with results ☐ Have concerns

---

## 🗑️ STEP 3: CLEANUP (Modifies Database)

**Command**: `npx ts-node scripts/cleanup-database.ts`

**Pre-Cleanup Confirmation**:
- [ ] Backup exists ✓
- [ ] Analysis reviewed ✓
- [ ] I'm okay with deletions ✓
- [ ] I understand this modifies database ✓

**Run Cleanup**:
- [ ] Command executed successfully
- [ ] Watch output for errors
- [ ] See "CLEANUP SUMMARY" at end
- [ ] Note statistics:
  - Duplicate users removed: _____
  - Orphaned students removed: _____
  - Orphaned parents removed: _____
  - Orphaned staff removed: _____
  - Inactive applications removed: _____
  - Other records removed: _____
  - **TOTAL REMOVED**: _____

**Success Indicators**:
- [ ] Message says "✅ Cleanup completed successfully!"
- [ ] No error messages (except maybe warnings)
- [ ] Statistics match expectations
- [ ] Process completed without hanging

**Time**: _____ minutes  
**Status**: ☐ Success ☐ Failed ☐ Unexpected results

---

## 🧪 STEP 4: TEST LOCALLY

**Command**: `npm run dev`

**Functional Tests** (Try these in browser):

### Admin Access
- [ ] Can login as admin
- [ ] Admin dashboard loads
- [ ] No console errors
- [ ] Data displays correctly

### Student Login
- [ ] Can login as test student
- [ ] Student dashboard loads
- [ ] Application history visible
- [ ] Grades/marks display (if any)

### Student Registration
- [ ] Registration page loads
- [ ] Form fields functional
- [ ] Can submit application
- [ ] Confirmation shows

### Data Integrity
- [ ] Important data still present
- [ ] No unexpected data missing
- [ ] Report cards display
- [ ] Grades visible
- [ ] Attendance records intact

### System Health
- [ ] No console errors
- [ ] No 404 errors
- [ ] No database connection errors
- [ ] No crash logs
- [ ] Response times normal

**Checklist**:
- [ ] All tests passed
- [ ] No errors found
- [ ] Data looks good
- [ ] Ready for production

**Time**: _____ minutes  
**Issues found**: ☐ None ☐ Minor ☐ Major

---

## 🔧 TROUBLESHOOTING (If Tests Failed)

**If any test failed**:
1. [ ] Take note of specific error
2. [ ] Check console/logs
3. [ ] Run: `npx ts-node scripts/restore-database.js`
4. [ ] Test again to verify restore worked
5. [ ] Identify what went wrong
6. [ ] Try cleanup again if it was temporary

**Restore Confirmation**:
- [ ] Restore command completed
- [ ] Data is back to pre-cleanup state
- [ ] Tests pass again

---

## 📤 STEP 5: COMMIT & PUSH TO GIT

**Only if all tests passed ✓**

**Git Commands**:
```powershell
# Check status
git status

# Commit changes
git commit -m "chore: Clean up duplicate users and orphaned records

- Removed 3 duplicate user accounts
- Deleted 5 orphaned student records
- Removed 2 orphaned parent records
- Cleaned up 42 old draft applications
- Database size reduced
- All tests passing"

# Push to GitHub
git push origin main
```

**Checklist**:
- [ ] `git status` shows correct changes
- [ ] Commit message is clear and descriptive
- [ ] `git push` succeeds
- [ ] GitHub shows new commit
- [ ] CI/CD pipeline runs (if configured)

**Time**: _____ minutes  
**Status**: ☐ Pushed ☐ Not yet ☐ Failed

---

## 📊 FINAL SUMMARY

| Step | Status | Issues | Notes |
|------|--------|--------|-------|
| Backup | ☐ Done ☐ Fail | | Filename: _______ |
| Analyze | ☐ Done ☐ Fail | | Records to delete: _______ |
| Cleanup | ☐ Done ☐ Fail | | Records deleted: _______ |
| Test | ☐ Done ☐ Fail | | Duration: _______ |
| Push | ☐ Done ☐ Fail | | Commit: _______ |

---

## ✅ SUCCESS CRITERIA

All checkboxes below must be checked:

- [ ] Backup created successfully
- [ ] Analysis reviewed and approved
- [ ] Cleanup completed without major errors
- [ ] All local tests passed
- [ ] No data loss of important records
- [ ] Code pushed to GitHub
- [ ] No rollback needed

**Overall Status**: 
```
☐ SUCCESS - All tests passed, pushed to GitHub
☐ PARTIAL - Some concerns, monitoring required
☐ FAILED - Rolled back, issues identified
```

**Sign-off**:
- Reviewed by: ________________________
- Date: ________________________
- Notes: _______________________________

---

## 🆘 EMERGENCY CONTACTS

If something goes wrong:

**Quick Recovery**:
```powershell
# Restore backup
npx ts-node scripts/restore-database.js

# Verify restore worked
npm run dev
```

**Questions**:
- See: DATABASE_CLEANUP_GUIDE.md
- See: CLEANUP_QUICK_REFERENCE.md
- See: CLEANUP_VISUAL_GUIDE.md

---

## 📝 NOTES & OBSERVATIONS

```
Pre-Cleanup Observations:
_________________________________
_________________________________
_________________________________

During Cleanup:
_________________________________
_________________________________
_________________________________

Issues Encountered:
_________________________________
_________________________________
_________________________________

Post-Cleanup Observations:
_________________________________
_________________________________
_________________________________

Recommendations for Future:
_________________________________
_________________________________
_________________________________
```

---

**Print this checklist and keep it with you while performing cleanup!**

Date Printed: ________________  
Printed by: ________________
