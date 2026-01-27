# Login Credentials - Working Accounts

## ✅ Test Accounts Available

### 1. Admin Account
- **URL**: http://localhost:3001/auth/login
- **Email**: `admin@adventhope.ac.zw`
- **Password**: `admin123`
- **Role**: SCHOOL_ADMIN
- **Status**: Active, no password change required

### 2. Parent Account
- **URL**: http://localhost:3001/portal/login (or use auth/login)
- **Email**: `testparent@adventhope.ac.zw`
- **Password**: `parent123`
- **Phone**: `+263773102001` (can also login with this)
- **Role**: PARENT
- **Status**: Active, no password change required

### 3. Student Account
- **URL**: http://localhost:3001/portal/login (or use auth/login)
- **Registration Number**: `STU2024999`
- **Password**: `student123`
- **Email**: `teststudent@adventhope.ac.zw`
- **Role**: STUDENT
- **Status**: Active, no password change required

## 🔐 Login Instructions

### For Admin/Staff:
1. Go to: http://localhost:3001/auth/login
2. Enter email: `admin@adventhope.ac.zw`
3. Enter password: `admin123`
4. Click "Sign In"

### For Parents:
1. Go to: http://localhost:3001/portal/login
2. Enter email or phone: `testparent@adventhope.ac.zw` OR `+263773102001`
3. Enter password: `parent123`
4. Select role: Parent
5. Click "Sign In"

### For Students:
1. Go to: http://localhost:3001/portal/login
2. Enter registration number: `STU2024999`
3. Enter password: `student123`
4. Select role: Student
5. Click "Sign In"

## 🛠️ Troubleshooting

If login still fails:

### 1. Check Server Status
```powershell
# Check if dev server is running
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# If not running, start it:
npm run dev
```

### 2. Verify Database Connection
```powershell
# Open Prisma Studio to check accounts
npx prisma studio
# Then navigate to http://localhost:5555
```

### 3. Recreate Accounts
```powershell
# Recreate admin account
node scripts/create-admin.js

# Recreate test accounts
node scripts/create-test-accounts.js
```

### 4. Check Console for Errors
- Open browser DevTools (F12)
- Go to Console tab
- Try logging in and check for error messages

### 5. Clear Browser Cache
- Press Ctrl+Shift+Delete
- Clear cookies and cached data
- Try logging in again

## 📝 Notes

- All accounts have `mustChangePassword = false` so you won't be prompted to change password
- All accounts are marked as `isActive = true`
- The database is using Supabase cloud PostgreSQL
- Environment variables are correctly configured in .env file
- NEXTAUTH_URL is set to http://localhost:3000

## 🔄 Reset Password (If Needed)

If you need to reset a password manually:

```powershell
node scripts/set-reset-token.js <email>
```

Then visit the reset link provided in the console output.
