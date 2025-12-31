# Setup script for Advent Hope Academy SMS
# Run this after installing Node.js

Write-Host "Setting up Advent Hope Academy SMS..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create a .env file with the following variables:" -ForegroundColor Yellow
    Write-Host "  - DATABASE_URL" -ForegroundColor Yellow
    Write-Host "  - NEXTAUTH_SECRET" -ForegroundColor Yellow
    Write-Host "  - NEXTAUTH_URL" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Generate Prisma Client
Write-Host "`nGenerating Prisma Client..." -ForegroundColor Cyan
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Failed to generate Prisma Client" -ForegroundColor Yellow
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Make sure your .env file is configured" -ForegroundColor White
Write-Host "  2. Run: npm run db:push (to set up database)" -ForegroundColor White
Write-Host "  3. Run: npm run db:seed (optional - to seed database)" -ForegroundColor White
Write-Host "  4. Run: npm run dev (to start development server)" -ForegroundColor White


