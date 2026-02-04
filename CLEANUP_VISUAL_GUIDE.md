# Database Cleanup - Visual Flow

## 🎯 Your Situation

```
Problem:
├─ Members registered before
├─ Data was lost  
├─ Now creating accounts again
├─ Duplicate emails exist in database
└─ Need clean slate locally before pushing to GitHub

Solution:
├─ Analyze what exists
├─ Clean up duplicates locally
├─ Test thoroughly
└─ Push clean database to GitHub
```

---

## 📊 Data Flow

### Before Cleanup
```
Database Status:
┌─────────────────────────────────────┐
│ USERS TABLE (Messy)                 │
├─────────────────────────────────────┤
│ ID    │ Email          │ Status      │
│-------|----------------|-------------|
│ uuid1 │ john@test.com  │ ACTIVE      │ ← Keep (oldest)
│ uuid2 │ john@test.com  │ ACTIVE      │ ← Delete (duplicate)
│ uuid3 │ jane@test.com  │ INACTIVE    │ ← Delete (orphaned)
│ uuid4 │ bob@school.com │ ACTIVE      │ ← Keep (in use)
│ uuid5 │ old@test.com   │ INACTIVE    │ ← Delete (unused)
└─────────────────────────────────────┘

Orphaned Records:
├─ 5 students without users
├─ 3 parents without students
├─ 2 staff without users
└─ 42 old draft applications
```

### After Cleanup
```
Database Status:
┌─────────────────────────────────────┐
│ USERS TABLE (Clean)                 │
├─────────────────────────────────────┤
│ ID    │ Email          │ Status      │
│-------|----------------|-------------|
│ uuid1 │ john@test.com  │ ACTIVE      │ ✓ Kept
│ uuid4 │ bob@school.com │ ACTIVE      │ ✓ Kept
└─────────────────────────────────────┘

All orphaned records deleted ✓
All duplicates cleaned up ✓
Ready for new registrations ✓
```

---

## 🔄 Cleanup Workflow

```
START
  │
  ▼
┌─────────────────────────────┐
│ 1. BACKUP DATABASE          │
│ npx ts-node scripts/backup  │
│ (Safety first!)             │
└─────────────┬───────────────┘
              │
              ▼
        ┌─────────────────────────────┐
        │ 2. ANALYZE (Read-Only)      │
        │ npx ts-node scripts/analyze │
        │ Shows what WILL be deleted  │
        └─────────────┬───────────────┘
                      │
                      ▼
             ╔═════════════════════════╗
             ║ REVIEW OUTPUT CAREFULLY ║
             ║                         ║
             ║ See "✓ DELETE" items?   ║
             ║ See "⚠ KEEP" items?    ║
             ║                         ║
             ║ OK? Continue ↓          ║
             ║ NO? STOP HERE! Don't    ║
             ║    run cleanup          ║
             ╚══════┬══════════════════╝
                    │
                    ▼
          ┌─────────────────────────────┐
          │ 3. CLEANUP (Modifies DB)    │
          │ npx ts-node scripts/cleanup │
          │ Actually deletes records    │
          └─────────────┬───────────────┘
                        │
                        ▼
                ┌─────────────────────────────┐
                │ 4. TEST LOCALLY             │
                │ npm run dev                 │
                │ - Try login                 │
                │ - Create account            │
                │ - Check data                │
                └─────────────┬───────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Works? YES          Works? NO
                    │                   │
                    ▼                   ▼
            ┌──────────────┐   ┌───────────────────┐
            │ 5. PUSH      │   │ RESTORE BACKUP    │
            │ git commit   │   │ restore-database  │
            │ git push     │   │ Try again         │
            └──────────────┘   └───────────────────┘
                    │
                    ▼
                  DONE ✓
```

---

## 🔍 What Gets Analyzed & Cleaned

### Duplicate Users
```
Analysis Shows:
📧 Email: john@test.com (3 users)
  ✓ KEEP | user-123 | John Doe | ACTIVE | Created: 2025-01-15
  ✗ DELETE | user-456 | John Doe | INACTIVE | Created: 2025-06-20
  ✗ DELETE | user-789 | John Doe | INACTIVE | Created: 2025-11-10

Action:
- Keeps oldest (first registration)
- Deletes unused newer ones
- Allows re-registration with same email
```

### Orphaned Students  
```
Analysis Shows:
👨‍🎓 ORPHANED STUDENTS (No User Account)
  ⚠ KEEP | Natalia Bari | Grades: 5, Attendance: 12
  ✗ DELETE | Mark Smith | Grades: 0, Attendance: 0
  ✗ DELETE | Sarah Jones | Grades: 0, Attendance: 0

Action:
- Keeps students with grades or attendance
- Deletes empty, orphaned records
```

### Inactive Applications
```
Analysis Shows:
📝 INACTIVE APPLICATIONS (>90 days old)
  ✗ DELETE | APP-001 | John Ngwenya | 245 days old
  ✗ DELETE | APP-002 | Maria Santos | 187 days old
  ✓ KEEP | APP-003 | James Brown | 45 days old | Status: PENDING

Action:
- Deletes old DRAFT applications (>90 days)
- Keeps submitted or recent applications
```

---

## 📝 Implementation Scripts

### Script Purposes

```
analyze-cleanup.ts
├─ Purpose: Preview what will be deleted
├─ Modifies Database: ❌ NO (Read-only)
├─ Must Run First: ✅ YES
├─ Time to Run: ~10-30 seconds
└─ Output: Detailed list of records to delete

cleanup-database.ts  
├─ Purpose: Actually delete the records
├─ Modifies Database: ✅ YES
├─ Must Run After: analyze-cleanup.ts
├─ Time to Run: ~1-5 minutes
└─ Output: Statistics of deletions

delete-user-by-email.ts
├─ Purpose: Delete one specific user
├─ Modifies Database: ✅ YES
├─ Interactive: ✅ YES
├─ Time to Run: ~30 seconds
└─ Output: Confirmation of deletion
```

---

## ⚠️ Safety Mechanisms

```
Protection Layer 1: Backup First
├─ Creates snapshot of database
├─ Stored in /backups/ folder
└─ Used to restore if anything goes wrong

Protection Layer 2: Analysis Script
├─ Read-only, never changes data
├─ Shows exactly what will be deleted
├─ User reviews before proceeding
└─ Option to cancel if wrong

Protection Layer 3: Confirmation
├─ Script asks "Are you sure?" in delete-user-by-email.ts
├─ Statistics shown at end
└─ Clear logging of all deletions

Protection Layer 4: Cascade Deletes
├─ Relationships maintained
├─ Child records deleted with parent
├─ No orphaned references left
└─ Database integrity preserved

Protection Layer 5: Easy Restore
├─ Backup available anytime
├─ One command to restore: restore-database.js
└─ No data permanently lost
```

---

## 🎯 Decision Tree

```
START: Want to clean database?
│
├─ No → Stop here ✓
│
└─ Yes → Have backup? 
    │
    ├─ No → Run: npx ts-node scripts/backup-database.js
    │        Then continue
    │
    └─ Yes → Run: npx ts-node scripts/analyze-cleanup.ts
             │
             ├─ See many "✓ DELETE" items?
             │ │
             │ ├─ No (only a few) → Continue to cleanup
             │ └─ Yes (lots) → Review carefully
             │
             │ Happy with results?
             │ │
             │ ├─ No → Cancel, don't run cleanup
             │ │      Review and discuss
             │ │
             │ └─ Yes → Run: npx ts-node scripts/cleanup-database.ts
             │          Then: npm run dev
             │          Then: Test everything
             │          │
             │          ├─ Works? Yes → Commit & Push ✓
             │          └─ Works? No → Restore backup
             │                        Try again
```

---

## 📊 Statistics & Results

### Example Output

```
📊 CLEANUP SUMMARY
==================================================
✓ Duplicate users removed:     3
✓ Orphaned students removed:   5
✓ Orphaned parents removed:    2
✓ Orphaned staff removed:      1
✓ Inactive applications removed: 42
✓ Orphaned invoices removed:   7
✓ Expired sessions removed:    156
✓ Orphaned OAuth accounts removed: 4
==================================================
📈 TOTAL RECORDS REMOVED:      220
==================================================
✅ Cleanup completed successfully!
```

---

## 🚀 Ready to Use

```
You now have:
✓ 4 scripts (analyze, cleanup, delete-user, wizard)
✓ 5 documentation files
✓ Complete workflow documented
✓ Safety mechanisms in place
✓ Clear instructions
✓ Recovery procedures

Next steps:
1. Run: .\start-cleanup.ps1
   (Or follow CLEANUP_QUICK_REFERENCE.md manually)
2. Review analysis output
3. Run cleanup
4. Test locally
5. Commit & push

Time to complete: ~15-30 minutes
Risk level: LOW (with backup)
Confidence: HIGH (well-tested approach)
```

---

## 🎓 Key Concepts

| Concept | Explanation | Example |
|---------|-------------|---------|
| Duplicate Users | Same email in multiple accounts | john@email.com appears 3 times |
| Orphaned Records | Records without parent references | Student without User account |
| Cascade Delete | Deleting parent deletes children | Delete student → delete grades |
| Read-Only | No modifications to database | analyze-cleanup.ts |
| Rollback | Restore database to previous state | restore-database.js |
| Referential Integrity | Relationships maintained | No student without valid class |

---

**Summary**: Everything is set up, documented, and safe. You're ready to clean your database locally before pushing to GitHub! 🎯
