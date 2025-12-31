# GitHub Setup Instructions

## Step 1: Install Git (if not installed)

1. Download Git from: https://git-scm.com/download/win
2. Install with default settings
3. Restart your terminal/PowerShell after installation

## Step 2: Create GitHub Repository

1. Go to https://github.com
2. Sign in to your account (Leone2022)
3. Click the "+" icon → "New repository"
4. Repository name: `adventhopeacademy`
5. Description: "Advent Hope Academy School Management System"
6. Set to **Private** (recommended for school data)
7. **DO NOT** initialize with README, .gitignore, or license
8. Click "Create repository"

## Step 3: Push Code to GitHub

Open PowerShell in the project directory and run:

```powershell
# Navigate to project
cd C:\adverthopeacademy

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Advent Hope Academy SMS with professional UI"

# Add remote repository
git remote add origin https://github.com/Leone2022/adventhopeacademy.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: You'll be prompted for your GitHub username and password (use a Personal Access Token, not your password).

### If you need a Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Vercel Deployment"
4. Select scopes: `repo` (full control)
5. Click "Generate token"
6. Copy the token and use it as your password when pushing

## Step 4: Verify Upload

1. Go to https://github.com/Leone2022/adventhopeacademy
2. Verify all files are uploaded
3. Check that `.env` is NOT in the repository (it should be ignored)

## Next Steps

After pushing to GitHub, proceed to Vercel deployment (see DEPLOYMENT.md)

