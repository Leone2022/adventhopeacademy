# Vercel Environment Variables Setup

## Required Environment Variables

Go to your Vercel project → **Settings** → **Environment Variables** and add:

### 1. NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://adventhopeacademy-jvvy.vercel.app
```

### 2. NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: I9JU23NF394R6HH
```

### 3. Database Connection (from Neon)
Vercel will automatically add these when you connect Neon database:
- `POSTGRES_PRISMA_URL` - Connection pooling URL
- `POSTGRES_URL_NON_POOLING` - Direct connection URL

## Important Notes

✅ **After adding variables, Vercel will automatically redeploy**
✅ **Make sure to add variables for Production environment**
✅ **You can also add for Preview and Development if needed**

## Verification

After deployment, check:
1. Build logs show "prisma generate" succeeded
2. Build logs show "prisma migrate deploy" succeeded  
3. Build logs show "next build" succeeded
4. Application loads without database errors

