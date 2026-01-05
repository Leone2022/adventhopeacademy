# Vercel Project Setup Guide

## Step 1: Create Vercel Project

If you haven't created the project in Vercel yet, follow these steps:

### Option A: Import from GitHub (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign in with your GitHub account (Leone2022)

2. **Add New Project**
   - Click the **"Add New Project"** button (or "+ New Project")
   - You'll see a list of your GitHub repositories

3. **Select Repository**
   - Find and select: **`Leone2022/adventhopeacademy`**
   - Click **"Import"**

4. **Configure Project Settings**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (or leave default - it will use package.json)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Environment Variables** (Add these BEFORE deploying)
   - Click **"Environment Variables"** section
   - Add the following:
   
   ```
   NEXTAUTH_URL
   Value: https://adventhopeacademy-jvvy.vercel.app
   (Or your custom domain if you have one)
   
   NEXTAUTH_SECRET
   Value: I9JU23NF394R6HH
   ```

6. **Database Connection** (Neon)
   - If you connected Neon database in Vercel, these should be auto-added:
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
   - If not, add them manually from your Neon dashboard

7. **Deploy**
   - Click **"Deploy"** button
   - Wait for build to complete (2-5 minutes)

### Option B: Using Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link and deploy project
cd C:\adverthopeacademy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time)
# - Project name? adventhopeacademy
# - Directory? ./
# - Override settings? No
```

## Step 2: Verify Project Creation

After creating the project, verify:

1. **Project Dashboard**
   - You should see your project: `adventhopeacademy`
   - URL: `https://adventhopeacademy-jvvy.vercel.app` (or similar)

2. **Settings**
   - Go to **Settings** → **General**
   - Verify project name and framework

3. **Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Verify all required variables are added

## Step 3: First Deployment

After project creation:

1. **Automatic Deployment**
   - If you already pushed to GitHub, Vercel will auto-deploy
   - Check **Deployments** tab

2. **Manual Deployment** (if needed)
   - Go to **Deployments** tab
   - Click **"Redeploy"** on latest deployment
   - Or push a new commit to trigger deployment

## Step 4: Watch Build Process

In the **Deployments** tab, click on the deployment to see logs:

✅ **Expected Build Steps:**
1. Installing dependencies (`npm install`)
2. Running `prisma generate` (creates Prisma Client)
3. Running `prisma migrate deploy` (creates database tables)
4. Running `next build` (builds Next.js app)
5. Deployment complete

## Step 5: Verify Deployment

After successful deployment:

1. **Visit Your App**
   - Go to: `https://adventhopeacademy-jvvy.vercel.app`
   - Or your custom domain if configured

2. **Test Functionality**
   - Home page loads
   - Login page works
   - Database connection works
   - All features functional

## Troubleshooting

### Project Not Found
- Make sure repository is pushed to GitHub
- Check repository name: `Leone2022/adventhopeacademy`
- Verify GitHub account is connected to Vercel

### Build Fails
- Check build logs in Vercel
- Verify environment variables are set
- Check database connection strings
- Ensure all dependencies are in `package.json`

### Database Connection Issues
- Verify `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are set
- Check Neon database is running
- Verify database allows external connections

## Next Steps After Project Creation

1. ✅ Set up custom domain (optional)
2. ✅ Configure production database
3. ✅ Seed database (optional)
4. ✅ Set up monitoring and analytics
5. ✅ Configure CI/CD (already done - auto-deploys on push)

