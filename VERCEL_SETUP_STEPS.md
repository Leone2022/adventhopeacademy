# Vercel Project Setup - Step by Step

## Current Screen: Project Configuration

You're on the import screen. Here's what to do:

### Step 1: Project Settings (Top Section)

**Project Name:**
- Current: `adventhopeacademy2022`
- Recommended: `adventhopeacademy` (simpler)
- You can change this or leave it

**Framework Preset:**
- ✅ Should show: **Next.js** (auto-detected)
- Leave as is

**Root Directory:**
- ✅ Should show: `./`
- Leave as is

### Step 2: Environment Variables (IMPORTANT!)

You need to add **TWO** environment variables:

**Variable 1:**
- Click **"Add Another"** or the "+" button
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://adventhopeacademy2022.vercel.app`
  (Or use placeholder: `https://your-app.vercel.app` - you'll update after deployment)

**Variable 2:**
- You already have one variable shown
- **Key**: `NEXTAUTH_SECRET`
- **Value**: `I9JU23NF394R6HH`
- Make sure this is set correctly

**Variable 3 & 4 (Database - if Neon is connected):**
- `POSTGRES_PRISMA_URL` (should auto-add from Neon)
- `POSTGRES_URL_NON_POOLING` (should auto-add from Neon)

If these don't appear automatically, you'll need to add them manually from your Neon dashboard.

### Step 3: Environment Selection

For each variable, make sure:
- ✅ **Production** is selected (checked)
- ✅ **Preview** can be checked too (optional)
- ✅ **Development** can be checked too (optional)

### Step 4: Deploy

1. Scroll down to the **"Deployment"** section
2. Review all settings
3. Click **"Deploy"** button
4. Watch the build progress

### Step 5: After Deployment

Once deployment completes:
1. You'll see: **"Congratulations! Your project has been deployed"**
2. Your actual URL will be shown (e.g., `https://adventhopeacademy2022-xxxxx.vercel.app`)
3. **Update NEXTAUTH_URL** in Settings → Environment Variables to match your actual URL
4. Click **"Redeploy"** to apply the change

## Quick Checklist

Before clicking "Deploy", verify:
- [ ] Project name is set (adventhopeacademy2022 or adventhopeacademy)
- [ ] Framework: Next.js
- [ ] Root Directory: ./
- [ ] NEXTAUTH_URL is added (can use placeholder)
- [ ] NEXTAUTH_SECRET = I9JU23NF394R6HH
- [ ] Database variables are added (if Neon connected)
- [ ] All variables have "Production" selected

## What Happens During Build

1. Installing dependencies
2. Running `prisma generate`
3. Running `prisma migrate deploy` (creates database tables)
4. Running `next build`
5. Deploying to production

## Troubleshooting

### Build Fails
- Check build logs
- Verify environment variables are correct
- Ensure database connection strings are valid

### Missing Database Variables
- Go to Vercel → Storage → Your Neon database
- Copy connection strings
- Add manually to Environment Variables

