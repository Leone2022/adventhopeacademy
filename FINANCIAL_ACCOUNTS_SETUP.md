# Financial Account Initialization

This guide explains how financial accounts are automatically created for students and how to initialize accounts for existing students.

## Automatic Account Creation

Financial accounts are **automatically created** when:

1. **New student registration** via `/api/students` (POST) - Admin creates student
2. **Student self-registration** via `/api/register/student` (POST) - Public registration form
3. **Any charge/payment operation** - If account doesn't exist, it's created on-the-fly

All new students get a financial account with `$0.00` balance automatically.

## Initializing Accounts for Existing Students

If you have existing students without financial accounts, you can initialize them in **3 ways**:

### Method 1: Via Finance Dashboard (Recommended) 🖱️

1. Go to **Dashboard → Finances**
2. Click the **"Initialize Accounts"** button (purple button)
3. Confirm the action
4. All students without accounts will get one instantly

### Method 2: Via Command Line 💻

Run this command in your terminal:

```bash
npm run init:accounts
```

Or directly:

```bash
npx tsx scripts/initialize-student-accounts.ts
```

This will:
- Find all students without financial accounts
- Display the list
- Create accounts for all of them
- Show confirmation

### Method 3: Via API Endpoint 🚀

Make a POST request to:

```
POST /api/finances/initialize-accounts
```

**Authentication Required:** Super Admin or School Admin

**Response:**
```json
{
  "success": true,
  "message": "Successfully created 180 financial accounts",
  "created": 180,
  "students": [
    {
      "id": "...",
      "studentNumber": "AHA20260001",
      "name": "John Doe"
    }
  ]
}
```

## How It Works

- **Student without account** → Shows `$0.00` balance in finance dashboard
- **First charge/payment** → Account is created automatically
- **No manual intervention needed** → System handles everything

## Verifying Accounts

Check if all students have accounts:

1. Go to **Dashboard → Finances → Student Accounts**
2. View all students - they should all be listed with balances
3. Students without prior charges show `$0.00`

## Important Notes

✅ **Safe to run multiple times** - Uses `skipDuplicates: true`  
✅ **No data loss** - Only creates missing accounts  
✅ **Fast operation** - Uses batch creation  
✅ **Zero initial balance** - All accounts start at $0.00  

## Files Modified

- `app/api/students/route.ts` - Auto-create on student creation
- `app/api/register/student/route.ts` - Auto-create on registration
- `app/api/finances/charge/route.ts` - Auto-create on charge
- `app/api/finances/bulk-charge/route.ts` - Auto-create in bulk
- `app/api/finances/initialize-accounts/route.ts` - Bulk initialization endpoint
- `scripts/initialize-student-accounts.ts` - CLI script
- `app/dashboard/finances/page.tsx` - UI button

## Support

If accounts are not being created automatically, check:
1. Database connection
2. Prisma schema is up to date: `npm run db:generate`
3. User permissions (must be Admin)
