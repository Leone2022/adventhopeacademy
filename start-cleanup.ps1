#!/usr/bin/env powershell
# Quick Start Script for Database Cleanup
# Copy and run this in PowerShell to begin the cleanup process

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Database Cleanup Wizard" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "This script will help you clean up duplicate users and orphaned data`n"

Write-Host "⚠️  IMPORTANT SAFETY STEPS:" -ForegroundColor Yellow
Write-Host "   1. Always backup first" -ForegroundColor Yellow
Write-Host "   2. Always analyze before cleanup" -ForegroundColor Yellow
Write-Host "   3. Always test locally before pushing`n" -ForegroundColor Yellow

# Step 1: Backup
Write-Host "Step 1: Create Backup..." -ForegroundColor Green
Write-Host "Command: npx ts-node scripts/backup-database.js`n" -ForegroundColor White
$backup = Read-Host "Create backup now? (yes/no)"

if ($backup -eq "yes") {
    Write-Host "Creating backup..." -ForegroundColor Cyan
    npx ts-node scripts/backup-database.js
} else {
    Write-Host "⚠️  Skipped backup! Strongly recommended to backup first!" -ForegroundColor Yellow
}

# Step 2: Analyze
Write-Host "`n`nStep 2: Analyze What Will Be Deleted..." -ForegroundColor Green
Write-Host "Command: npx ts-node scripts/analyze-cleanup.ts`n" -ForegroundColor White
$analyze = Read-Host "Run analysis? (yes/no)"

if ($analyze -eq "yes") {
    Write-Host "Analyzing database..." -ForegroundColor Cyan
    npx ts-node scripts/analyze-cleanup.ts
    
    Write-Host "`n" -ForegroundColor White
    $proceed = Read-Host "Proceed with cleanup? (yes/no)"
    
    if ($proceed -eq "yes") {
        # Step 3: Cleanup
        Write-Host "`nStep 3: Run Cleanup..." -ForegroundColor Green
        Write-Host "Command: npx ts-node scripts/cleanup-database.ts`n" -ForegroundColor White
        $cleanup = Read-Host "Run cleanup? (yes/no)"
        
        if ($cleanup -eq "yes") {
            Write-Host "Running cleanup..." -ForegroundColor Cyan
            npx ts-node scripts/cleanup-database.ts
            
            Write-Host "`n" -ForegroundColor White
            Write-Host "✅ Cleanup completed!" -ForegroundColor Green
            Write-Host "`nNext Steps:" -ForegroundColor Green
            Write-Host "  1. Test locally: npm run dev" -ForegroundColor White
            Write-Host "  2. Verify login and data" -ForegroundColor White
            Write-Host "  3. If OK, commit and push:" -ForegroundColor White
            Write-Host "     git commit -m 'chore: Clean up duplicate users and orphaned records'" -ForegroundColor White
            Write-Host "     git push origin main" -ForegroundColor White
        } else {
            Write-Host "❌ Cleanup cancelled" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Cleanup cancelled - review the analysis output above" -ForegroundColor Yellow
        Write-Host "If you disagree with deletions, do NOT run cleanup!" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Analysis skipped" -ForegroundColor Red
    Write-Host "Run this first to see what will be deleted!" -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Wizard Complete" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Documentation:" -ForegroundColor Green
Write-Host "  - CLEANUP_QUICK_REFERENCE.md    (Quick commands)" -ForegroundColor White
Write-Host "  - DATABASE_CLEANUP_GUIDE.md     (Detailed guide)" -ForegroundColor White
Write-Host "  - CLEANUP_IMPLEMENTATION.md     (Implementation details)" -ForegroundColor White
