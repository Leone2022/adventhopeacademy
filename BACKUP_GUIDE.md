# Database Backup System

## Overview
Automated database backup system that:
- Creates daily backups of all database tables
- Stores backups as JSON files
- Automatically cleans up backups older than 30 days
- Can be scheduled to run automatically

---

## Manual Backup

### Create a backup now:
```powershell
node scripts/backup-database.js
```

**Output:**
- Backup file created in `backups/` directory
- Filename format: `backup-YYYY-MM-DDTHH-MM-SS.json`
- Shows statistics of backed up data

**Example:**
```
✅ Database backup completed successfully!
📁 Backup file: C:\adverthopeacademy\backups\backup-2026-01-22T19-30-00.json
📊 Backup statistics:
   - Schools: 1
   - Users: 5
   - Parents: 2
   - Students: 3
   - Applications: 48
   - Classes: 10
   - Staff: 15
```

---

## Restore from Backup

### Restore database from a backup file:
```powershell
node scripts/restore-database.js backups/backup-2026-01-22T19-30-00.json
```

**⚠️ WARNING:** This will delete ALL current data and restore from the backup!

**Process:**
1. 5-second countdown to cancel (Ctrl+C)
2. Deletes current database data
3. Restores data from backup file
4. Shows progress for each table

---

## Automated Daily Backups

### Option 1: Windows Task Scheduler (Recommended)

**Setup:**
1. Open Task Scheduler (search "Task Scheduler" in Windows)
2. Click "Create Basic Task"
3. Name: "Advent Hope Academy Database Backup"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
6. Program: `powershell.exe`
7. Arguments: `-ExecutionPolicy Bypass -File "C:\adverthopeacademy\scripts\automated-backup.ps1"`
8. Click Finish

**View logs:**
```powershell
Get-Content logs/backup-2026-01-22.log
```

---

### Option 2: Manual PowerShell Script

Run this once to test:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/automated-backup.ps1
```

---

## Backup File Structure

Backup files contain:
```json
{
  "timestamp": "2026-01-22T19:30:00.000Z",
  "version": "1.0",
  "statistics": {
    "schools": 1,
    "users": 5,
    "parents": 2,
    "students": 3,
    "applications": 48
  },
  "data": {
    "schools": [...],
    "users": [...],
    "parents": [...],
    "students": [...],
    "applications": [...],
    "classes": [...],
    "staff": [...]
  }
}
```

---

## Backup Retention

- **Default:** Keeps backups for 30 days
- **Auto-cleanup:** Runs after each backup
- **Manual cleanup:** Delete files from `backups/` directory

---

## Best Practices

### Daily Backups
✅ Schedule daily backups at 2:00 AM (low traffic time)
✅ Monitor backup logs weekly
✅ Test restore process monthly

### Before Major Changes
✅ Create manual backup before:
   - Database schema changes
   - Bulk data imports
   - System upgrades
   - Deployment to production

### Offsite Backups
✅ Copy backup files to external storage:
   - Cloud storage (OneDrive, Google Drive, Dropbox)
   - External hard drive
   - Network storage

---

## Quick Reference

| Task | Command |
|------|---------|
| Create backup | `node scripts/backup-database.js` |
| Restore backup | `node scripts/restore-database.js <file>` |
| View backup logs | `Get-Content logs/backup-*.log` |
| List backups | `Get-ChildItem backups/` |
| Automated backup | `powershell -ExecutionPolicy Bypass -File scripts/automated-backup.ps1` |

---

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"
```powershell
npm install
npx prisma generate
```

### Error: "Backup file not found"
Check the file path is correct:
```powershell
Get-ChildItem backups/
```

### Error: "Permission denied"
Run PowerShell as Administrator:
```powershell
Start-Process powershell -Verb RunAs
```

---

## Production Deployment

For Vercel/Production:

1. **Vercel Cron Job:**
   Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/backup",
       "schedule": "0 2 * * *"
     }]
   }
   ```

2. **Create API endpoint:**
   `app/api/cron/backup/route.ts`

3. **Store backups in:**
   - Vercel Blob Storage
   - AWS S3
   - Google Cloud Storage

---

## Security Notes

⚠️ **Passwords are excluded** from backups for security
⚠️ **Backup files contain sensitive data** - protect access
⚠️ **Never commit backups** to Git (already in .gitignore)
⚠️ **Encrypt backups** for offsite storage

---

## Support

For issues or questions:
- Check logs in `logs/` directory
- Review backup files in `backups/` directory
- Test restore on a separate database first
