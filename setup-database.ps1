# Database Setup Script for Advent Hope Academy SMS
# This script helps set up the PostgreSQL database

Write-Host "Setting up PostgreSQL Database..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with the following variables:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DATABASE_URL=`"postgresql://username:password@localhost:5432/advent_hope_academy?schema=public`"" -ForegroundColor Cyan
    Write-Host "NEXTAUTH_SECRET=`"your-secret-key-here`"" -ForegroundColor Cyan
    Write-Host "NEXTAUTH_URL=`"http://localhost:3000`"" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Cyan
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Pushing database schema..." -ForegroundColor Cyan
Write-Host "This will create all tables in your PostgreSQL database." -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Continue? (y/n)"
if ($continue -ne "y") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to push database schema" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL is running" -ForegroundColor White
    Write-Host "  2. DATABASE_URL in .env is correct" -ForegroundColor White
    Write-Host "  3. Database 'advent_hope_academy' exists (or create it)" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Step 3: (Optional) Seeding database..." -ForegroundColor Cyan
$seed = Read-Host "Do you want to seed the database with sample data? (y/n)"
if ($seed -eq "y") {
    npm run db:seed
}

Write-Host ""
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "You can now start the development server with: npm run dev" -ForegroundColor Cyan

