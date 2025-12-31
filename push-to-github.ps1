# PowerShell Script to Push Code to GitHub
# Run this after installing Git and creating the GitHub repository

Write-Host "=== GitHub Push Script ===" -ForegroundColor Green
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    Write-Host "Git repository initialized!" -ForegroundColor Green
} else {
    Write-Host "Git repository already initialized." -ForegroundColor Green
}

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Adding GitHub remote..." -ForegroundColor Cyan
    Write-Host "Repository: https://github.com/Leone2022/adventhopeacademy.git" -ForegroundColor Yellow
    git remote add origin https://github.com/Leone2022/adventhopeacademy.git
    Write-Host "Remote added!" -ForegroundColor Green
} else {
    Write-Host "Remote already configured: $remoteExists" -ForegroundColor Green
}

# Stage all files
Write-Host ""
Write-Host "Staging all files..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    Write-Host "Everything is up to date!" -ForegroundColor Green
} else {
    Write-Host "Files staged!" -ForegroundColor Green
    
    # Commit
    Write-Host ""
    Write-Host "Creating commit..." -ForegroundColor Cyan
    git commit -m "Initial commit: Advent Hope Academy SMS with professional UI and all features"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Commit created!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to create commit" -ForegroundColor Red
        exit 1
    }
}

# Set branch to main
Write-Host ""
Write-Host "Setting branch to main..." -ForegroundColor Cyan
git branch -M main

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "You may be prompted for GitHub credentials." -ForegroundColor Yellow
Write-Host "Use your GitHub username and Personal Access Token (not password)." -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Code pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/Leone2022/adventhopeacademy" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://vercel.com" -ForegroundColor White
    Write-Host "2. Import your GitHub repository" -ForegroundColor White
    Write-Host "3. Follow VERCEL_SETUP.md for deployment" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Repository doesn't exist on GitHub" -ForegroundColor White
    Write-Host "- Authentication failed (check username/token)" -ForegroundColor White
    Write-Host "- Network connection issues" -ForegroundColor White
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. Repository exists at: https://github.com/Leone2022/adventhopeacademy" -ForegroundColor White
    Write-Host "2. You have a Personal Access Token (not password)" -ForegroundColor White
    Write-Host "3. You have write access to the repository" -ForegroundColor White
}

