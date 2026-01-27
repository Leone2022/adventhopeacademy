# Automated Backup Script for Windows Task Scheduler
# This script runs the database backup and logs the output

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$LogDir = Join-Path $ProjectDir "logs"
$LogFile = Join-Path $LogDir ("backup-" + (Get-Date -Format "yyyy-MM-dd") + ".log")

# Create logs directory if it doesn't exist
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

# Log function
function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "$Timestamp - $Message"
    Write-Output $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

Write-Log "=========================================="
Write-Log "Starting automated database backup"
Write-Log "=========================================="

try {
    # Change to project directory
    Set-Location $ProjectDir
    Write-Log "Working directory: $ProjectDir"

    # Run backup script
    Write-Log "Running backup script..."
    $Output = & node scripts/backup-database.js 2>&1
    
    # Log output
    $Output | ForEach-Object { Write-Log $_ }

    Write-Log "Backup completed successfully"
    Write-Log "=========================================="
    exit 0
} catch {
    Write-Log "ERROR: Backup failed - $($_.Exception.Message)"
    Write-Log "=========================================="
    exit 1
}
