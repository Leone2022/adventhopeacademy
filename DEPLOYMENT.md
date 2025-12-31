# Deployment Guide - Advent Hope Academy SMS

## GitHub Setup

### Prerequisites
- Git installed on your system
- GitHub account (Leone2022)
- Repository created at: `Leone2022/adventhopeacademy`

### Steps to Push to GitHub

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   ```

2. **Add Remote Repository**:
   ```bash
   git remote add origin https://github.com/Leone2022/adventhopeacademy.git
   ```

3. **Stage All Files**:
   ```bash
   git add .
   ```

4. **Commit Changes**:
   ```bash
   git commit -m "Initial commit: Advent Hope Academy SMS"
   ```

5. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Vercel Deployment

### Prerequisites
- GitHub repository pushed successfully
- Vercel account (sign up at https://vercel.com)

### Steps to Deploy on Vercel

1. **Go to Vercel Dashboard**:
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**:
   - Click "Add New Project"
   - Select the repository: `Leone2022/adventhopeacademy`
   - Click "Import"

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**:
   Add the following environment variables in Vercel:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_SECRET=your_secret_key_here
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```
   
   **Important**: 
   - Use your production database URL (not localhost)
   - Generate a new NEXTAUTH_SECRET for production
   - Update NEXTAUTH_URL after deployment

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://adventhopeacademy.vercel.app` (or custom domain)

## Custom Domain Setup

### In Vercel Dashboard:

1. **Go to Project Settings**:
   - Select your project
   - Go to "Settings" → "Domains"

2. **Add Domain**:
   - Enter your domain name (e.g., `adventhope.ac.zw`)
   - Click "Add"

3. **Configure DNS**:
   Vercel will provide DNS records to add:
   - **A Record**: Point to Vercel's IP
   - **CNAME Record**: Point to Vercel's domain
   
   Follow Vercel's instructions to update your domain's DNS settings.

4. **SSL Certificate**:
   - Vercel automatically provisions SSL certificates
   - Wait for DNS propagation (can take up to 48 hours)

5. **Update Environment Variables**:
   - Update `NEXTAUTH_URL` to your custom domain
   - Redeploy if necessary

## Database Setup for Production

### Option 1: Vercel Postgres (Recommended)
1. In Vercel Dashboard, go to "Storage"
2. Create a new Postgres database
3. Copy the connection string
4. Add it as `DATABASE_URL` environment variable

### Option 2: External PostgreSQL
Use a managed PostgreSQL service:
- **Supabase** (Free tier available)
- **Neon** (Free tier available)
- **Railway** (Free tier available)
- **AWS RDS** (Paid)

Update `DATABASE_URL` with your production database connection string.

## Post-Deployment Steps

1. **Run Database Migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   Or use Vercel's build command to auto-migrate.

2. **Seed Database** (Optional):
   ```bash
   npm run db:seed
   ```

3. **Verify Deployment**:
   - Check all pages load correctly
   - Test authentication
   - Verify database connections
   - Test all buttons and functionality

## Important Notes

- **Never commit `.env` file** - It's in `.gitignore`
- **Use environment variables** in Vercel for all secrets
- **Update NEXTAUTH_URL** after getting your domain
- **Database migrations** should run automatically on deploy
- **Build logs** are available in Vercel dashboard

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Ensure database is accessible from internet

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

