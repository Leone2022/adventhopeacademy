# 🚀 Supabase Database Migration Guide
## Advent Hope Academy SMS - Database Cloud Migration

This guide will walk you through migrating your local PostgreSQL database to Supabase.

---

## 📋 Pre-Migration Checklist

- [x] Local database working
- [x] Prisma schema ready
- [ ] Supabase account created
- [ ] Local database backed up
- [ ] Connection tested
- [ ] Data migrated

---

## Step 1: Backup Your Local Database 🔒

**CRITICAL: Do this first before any migration!**

### Option A: Using pgAdmin4 (Recommended for you)
1. Open pgAdmin4
2. Right-click on your database `adventhope_sms`
3. Select **Backup...**
4. Choose these settings:
   - Format: **Plain** (for SQL file) or **Custom** (for pg_restore)
   - Filename: `adventhope_sms_backup_2026-01-05.sql`
   - Encoding: UTF8
5. Click **Backup**

### Option B: Using Command Line
```bash
# Run in terminal (adjust path to your pg_dump)
pg_dump -U postgres -h localhost -d adventhope_sms -f C:\backups\adventhope_sms_backup.sql
```

---

## Step 2: Create Supabase Account & Project 🌐

### 2.1 Sign Up for Supabase
1. Go to: https://supabase.com
2. Click **Start your project**
3. Sign up with GitHub (recommended) or Email
4. Verify your email if needed

### 2.2 Create New Project
1. Click **New Project**
2. Fill in the details:
   - **Organization**: Create new or select existing
   - **Project name**: `advent-hope-academy-sms`
   - **Database Password**: Create a STRONG password (save this!)
   - **Region**: Choose closest to Uganda → **Frankfurt (eu-central-1)** or **Mumbai (ap-south-1)**
3. Click **Create new project**
4. **Wait 2-3 minutes** for the database to provision

### 2.3 Get Your Connection Strings
1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Click **Database** in the sidebar
3. Scroll to **Connection string** section
4. You'll see different connection modes:

**For Prisma, you need TWO URLs:**

#### Transaction Mode (for Prisma queries via connection pooler):
```
postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Session Mode (for Prisma migrations):
```
postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

> ⚠️ **IMPORTANT**: Copy both URLs and save them securely!

---

## Step 3: Update Environment Variables 🔐

### 3.1 Update your `.env` file for Development

Replace your current DATABASE_URL with the Supabase URLs:

```env
# ===========================================
# DATABASE - SUPABASE CONFIGURATION
# ===========================================

# For Prisma Client (pooled connection - port 6543)
POSTGRES_PRISMA_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# For Prisma Migrations (direct connection - port 5432)  
POSTGRES_URL_NON_POOLING="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Keep old DATABASE_URL as fallback (optional)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/adventhope_sms"
```

### 3.2 Your Current Schema Already Supports This! ✅

Your `prisma/schema.prisma` is already configured correctly:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

---

## Step 4: Migrate Schema to Supabase 📊

### 4.1 Generate Prisma Client
```bash
npx prisma generate
```

### 4.2 Push Schema to Supabase
```bash
# This creates all tables in Supabase (for development)
npx prisma db push
```

OR if you want to use migrations:
```bash
# This applies all existing migrations to Supabase
npx prisma migrate deploy
```

### 4.3 Verify Tables Created
1. Go to Supabase Dashboard
2. Click **Table Editor** in sidebar
3. You should see all your tables (schools, users, students, etc.)

---

## Step 5: Migrate Your Data 📦

### Option A: Using Prisma Seed (If you have seed script)
```bash
npx prisma db seed
```

### Option B: Manual Data Export/Import

#### Export from Local:
```sql
-- In pgAdmin, run these queries and export results
SELECT * FROM schools;
SELECT * FROM users;
SELECT * FROM students;
-- ... etc
```

#### Import to Supabase:
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Paste your INSERT statements
4. Click **Run**

### Option C: Using pg_dump and psql (Advanced)

```bash
# Export data only from local
pg_dump -U postgres -h localhost -d adventhope_sms --data-only -f data_export.sql

# Import to Supabase (replace with your connection string)
psql "postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" -f data_export.sql
```

---

## Step 6: Test the Connection 🧪

### 6.1 Test with Prisma Studio
```bash
npx prisma studio
```
- This opens a GUI at http://localhost:5555
- Browse your tables to verify data

### 6.2 Test Your Application
```bash
npm run dev
```
- Open http://localhost:3000
- Try logging in
- Test creating/reading/updating data

### 6.3 Test All CRUD Operations
- [ ] Login works
- [ ] Can view students list
- [ ] Can add new student
- [ ] Can edit student
- [ ] Can delete student
- [ ] Finance features work
- [ ] Staff features work

---

## Step 7: Configure for Vercel Deployment 🚀

### 7.1 Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `POSTGRES_PRISMA_URL` | Your pooled URL (port 6543) | Production, Preview |
| `POSTGRES_URL_NON_POOLING` | Your direct URL (port 5432) | Production, Preview |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_SECRET` | Generate new one for production | Production |

### 7.2 Generate Production NEXTAUTH_SECRET
```bash
# In terminal
openssl rand -base64 32
```
Use a DIFFERENT secret for production than development!

### 7.3 Update vercel.json (if needed)
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "framework": "nextjs"
}
```

---

## Step 8: Rollback Strategy 🔄

### If Something Goes Wrong:

1. **Revert to local database:**
   ```env
   # Comment out Supabase URLs
   # POSTGRES_PRISMA_URL="..."
   # POSTGRES_URL_NON_POOLING="..."
   
   # Uncomment local URL
   DATABASE_URL="postgresql://postgres:password@localhost:5432/adventhope_sms"
   ```

2. **Update schema.prisma temporarily:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     // directUrl = env("POSTGRES_URL_NON_POOLING")
   }
   ```

3. **Restart your app:**
   ```bash
   npm run dev
   ```

---

## 🎯 Quick Command Reference

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (no migration history)
npx prisma db push

# Create and apply migrations
npx prisma migrate dev --name init

# Apply existing migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git** (already in .gitignore ✅)
2. **Use different secrets for dev/production**
3. **Use strong database passwords** (16+ characters, mixed)
4. **Enable Row Level Security (RLS)** in Supabase for production
5. **Set up database backups** in Supabase dashboard
6. **Limit connection pool size** in production

---

## 📞 Troubleshooting

### Error: "Connection refused"
- Check if Supabase project is fully provisioned
- Verify password doesn't have special characters that need encoding
- Check if using correct port (6543 for pooled, 5432 for direct)

### Error: "Password authentication failed"
- Reset password in Supabase: Settings → Database → Reset password
- URL-encode special characters in password

### Error: "Prepared statement already exists"
- Add `?pgbouncer=true` to your pooled connection URL
- Use `directUrl` for migrations

### Error: "Too many connections"
- Add `&connection_limit=1` to your connection URL
- Use connection pooling (port 6543)

---

## ✅ Migration Complete Checklist

- [ ] Local database backed up
- [ ] Supabase project created
- [ ] Connection strings saved securely
- [ ] `.env` file updated
- [ ] Schema pushed to Supabase
- [ ] Data migrated
- [ ] Application tested locally with cloud DB
- [ ] Vercel environment variables configured
- [ ] Application deployed to Vercel
- [ ] Production fully tested

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Vercel + Supabase](https://vercel.com/integrations/supabase)
- [NextAuth.js Docs](https://next-auth.js.org/)

---

*Guide created: January 5, 2026*
*For: Advent Hope Academy SMS*
*By: LeeTec Graphics Software Solutions*
