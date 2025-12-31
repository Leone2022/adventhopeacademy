# Vercel Deployment Guide

## Prerequisites
✅ GitHub repository created and code pushed
✅ Vercel account (sign up at https://vercel.com)

## Step 1: Sign Up / Sign In to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

## Step 2: Import Project

1. In Vercel Dashboard, click **"Add New Project"**
2. Find and select: **`Leone2022/adventhopeacademy`**
3. Click **"Import"**

## Step 3: Configure Project

### Framework Settings (Auto-detected):
- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Environment Variables

Click "Environment Variables" and add:

```
DATABASE_URL
```
Value: Your production PostgreSQL connection string
Example: `postgresql://user:password@host:5432/database?schema=public`

```
NEXTAUTH_SECRET
```
Value: Generate a secure random string (32+ characters)
You can generate one at: https://generate-secret.vercel.app/32

```
NEXTAUTH_URL
```
Value: `https://adventhopeacademy.vercel.app` (update after custom domain)

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at: `https://adventhopeacademy.vercel.app`

## Step 5: Set Up Custom Domain

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Domains**
2. Enter your domain (e.g., `adventhope.ac.zw` or `www.adventhope.ac.zw`)
3. Click **"Add"**

### Configure DNS Records:

Vercel will show you DNS records to add. Example:

**For root domain (adventhope.ac.zw):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Steps:
1. Log in to your domain registrar (where you bought the domain)
2. Go to DNS Management
3. Add the records Vercel provides
4. Wait for DNS propagation (15 minutes to 48 hours)
5. Vercel will automatically provision SSL certificate

### Update Environment Variables:

After domain is active:
1. Go to **Settings** → **Environment Variables**
2. Update `NEXTAUTH_URL` to: `https://yourdomain.com`
3. Click **"Redeploy"** or wait for next deployment

## Step 6: Production Database Setup

### Recommended: Vercel Postgres

1. In Vercel Dashboard → **Storage** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose a region close to your users
5. Click **"Create"**
6. Copy the connection string
7. Update `DATABASE_URL` environment variable
8. Redeploy

### Alternative: External Database

Use one of these services:
- **Supabase** (https://supabase.com) - Free tier
- **Neon** (https://neon.tech) - Free tier
- **Railway** (https://railway.app) - Free tier

After creating database:
1. Copy connection string
2. Add to Vercel environment variables as `DATABASE_URL`
3. Redeploy

## Step 7: Run Database Migrations

After first deployment:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Or use Vercel CLI:
   ```bash
   npx vercel env pull .env.local
   npx prisma migrate deploy
   ```

Or add to `package.json` scripts:
```json
"postbuild": "prisma migrate deploy"
```

## Step 8: Verify Deployment

✅ Check all pages load
✅ Test login functionality
✅ Verify database connection
✅ Test all buttons and features
✅ Check mobile responsiveness

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are fixed

### Database Connection
- Verify `DATABASE_URL` is correct
- Check database allows external connections
- Ensure database is running

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cache

### Domain Not Working
- Wait for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Check domain registrar settings

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- Push to `main` branch → Production deployment
- Create pull request → Preview deployment

No manual deployment needed! 🚀

