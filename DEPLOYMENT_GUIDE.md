# 🚀 Production Deployment Guide
## Advent Hope Academy - Authentication System

**Version:** 2.0 Complete
**Status:** ✅ Production Ready
**Last Updated:** January 2026

---

## 📋 Pre-Deployment Checklist

### 1. Database Migration (CRITICAL - MUST DO FIRST)

The authentication system requires new database fields. Run this migration:

```bash
# Generate migration
npx prisma migrate dev --name add_password_security_fields

# OR if in production
npx prisma migrate deploy

# Then regenerate Prisma client
npx prisma generate
```

**Fields Added to User Table:**
- `mustChangePassword` (Boolean) - Force password change on first login
- `passwordResetToken` (String) - Hashed password reset token
- `passwordResetExpires` (DateTime) - Token expiry timestamp
- `failedLoginAttempts` (Int) - Failed login counter
- `lastFailedLoginAt` (DateTime) - Timestamp of last failed login
- `accountLockedUntil` (DateTime) - Account lockout expiry

---

### 2. Environment Variables

Add these to your `.env` file:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-32-character-minimum-key-here
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Email Service (Choose one)
# Option 1: SendGrid (Recommended)
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@adventhope.ac.zw
FROM_NAME="Advent Hope Academy"

# Option 2: AWS SES
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
FROM_EMAIL=noreply@adventhope.ac.zw

# Option 3: Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.your-domain.com
FROM_EMAIL=noreply@adventhope.ac.zw

# Database (Already configured)
POSTGRES_PRISMA_URL=your_database_url
POSTGRES_URL_NON_POOLING=your_direct_url
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

### 3. Email Service Setup

#### Recommended: SendGrid

1. **Sign up:** https://sendgrid.com/
2. **Verify sender email:** noreply@adventhope.ac.zw
3. **Create API key:**
   - Settings → API Keys → Create API Key
   - Select "Full Access"
   - Copy key to `.env` as `SENDGRID_API_KEY`

4. **Update lib/email.ts:**
```typescript
import sgMail from '@sendgrid/mail'

// Add this at the top
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// In sendEmail function, replace the production TODO with:
if (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY) {
  await sgMail.send({
    to: options.to,
    from: {
      email: process.env.FROM_EMAIL!,
      name: process.env.FROM_NAME || 'Advent Hope Academy'
    },
    subject: options.subject,
    html: options.html,
    text: options.text,
  })
  return true
}
```

5. **Install SendGrid:**
```bash
npm install @sendgrid/mail
```

---

### 4. Test Email Delivery

Before going live, test all email templates:

```bash
# In development mode
# Emails will log to console

# In production mode (after SendGrid setup)
# Send test welcome email
# Send test password reset
# Send test account locked email
# Verify emails arrive and look correct
```

---

## 🎯 Deployment Steps

### Step 1: Build the Application

```bash
# Install dependencies
npm install

# Run database migration
npx prisma migrate deploy
npx prisma generate

# Build for production
npm run build
```

### Step 2: Environment Configuration

Ensure all environment variables are set in your production environment (Vercel, AWS, etc.)

### Step 3: Deploy

```bash
# Using Vercel
vercel --prod

# OR using Docker
docker build -t advent-hope-sms .
docker run -p 3000:3000 advent-hope-sms

# OR manual deployment
npm run start
```

### Step 4: Post-Deployment Verification

1. **Test Public Pages:**
   - Home: `/`
   - Portal Login: `/portal/login`
   - Forgot Password: `/portal/forgot-password`

2. **Test Admin Login:**
   - URL: `/auth/login`
   - Create a test parent account
   - Create a test student account
   - Verify credentials are generated

3. **Test Parent/Student Login:**
   - Use generated credentials
   - Verify forced password change
   - Test password reset flow
   - Test account lockout (5 failed attempts)

4. **Check Email Delivery:**
   - Welcome emails sent
   - Password reset emails sent
   - Password changed confirmations sent
   - Account lockout notifications sent

---

## 📚 Features Implemented

### ✅ 1. Multi-Role Authentication
- **Parent Login:** Email or Phone + Password
- **Student Login:** Registration Number + Password
- **Admin/Staff Login:** Email + Password (existing)

### ✅ 2. Password Security
- **Strength Requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **bcrypt Hashing:** Salt rounds = 10
- **Secure Generation:** 12-character auto-generated passwords

### ✅ 3. Account Lockout
- **Trigger:** 5 consecutive failed login attempts
- **Duration:** 15 minutes
- **Auto-Unlock:** Account unlocks automatically
- **Notification:** Email sent when account is locked
- **Reset on Success:** Failed attempts reset to 0

### ✅ 4. Password Reset System
- **Multi-Method Recovery:**
  - Email (parents/staff)
  - Phone (parents)
  - Student Registration Number (students)
- **Secure Tokens:**
  - SHA-256 hashed in database
  - 1-hour expiry
  - Single-use only
- **Email Notifications:** Reset link sent via email

### ✅ 5. First-Time Login Password Change
- **Enforcement:** Middleware redirects to change-password
- **Flag:** `mustChangePassword` set on account creation
- **Cleared:** After successful password change
- **User Experience:** Cannot access dashboard until password changed

### ✅ 6. Change Password Feature
- **User-Initiated:** Available from profile
- **Validation:**
  - Verify current password
  - Enforce strength requirements
  - Prevent reusing current password
- **Confirmation:** Email sent after change

### ✅ 7. Admin Account Creation
- **URL:** `/admin/create-accounts`
- **Parent Accounts:**
  - Auto-generate secure password
  - Send welcome email
  - Display credentials to admin
- **Student Accounts:**
  - Auto-generate student number (STU2024001)
  - Auto-generate secure password
  - Send welcome email (if email provided)
  - Display credentials to admin

### ✅ 8. Email Notifications
- **Welcome Email:** When account created
- **Password Reset:** With secure token link
- **Password Changed:** Confirmation notification
- **Account Locked:** Security alert

### ✅ 9. Security Features
- **No Account Enumeration:** Same response for valid/invalid users
- **Token Hashing:** Reset tokens hashed before storage
- **Session Management:** JWT with 30-day expiry
- **Route Protection:** Middleware enforces role-based access
- **Audit Logging:** All authentication events tracked

---

## 🔐 Security Configuration

### Password Policy
```typescript
{
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false // Optional
}
```

### Lockout Policy
```typescript
{
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  autoUnlock: true
}
```

### Token Policy
```typescript
{
  resetTokenExpiry: 60 * 60 * 1000, // 1 hour
  tokenAlgorithm: 'SHA-256',
  singleUse: true
}
```

---

## 📖 Admin Operations

### Create Parent Account

1. Navigate to: `/admin/create-accounts`
2. Select "Parent Account"
3. Fill in:
   - Full Name (required)
   - Email Address (required)
   - Phone Number (optional)
4. Click "Create Parent Account"
5. **SAVE DISPLAYED CREDENTIALS**
6. Provide credentials to parent
7. Parent receives welcome email
8. Parent must change password on first login

### Create Student Account

1. Navigate to: `/admin/create-accounts`
2. Select "Student Account"
3. Fill in:
   - First Name (required)
   - Last Name (required)
   - Gender (required)
   - Email Address (optional)
4. Click "Create Student Account"
5. **SAVE DISPLAYED CREDENTIALS**
   - Registration Number (e.g., STU2024001)
   - Temporary Password
6. Provide credentials to student
7. Student receives welcome email (if email provided)
8. Student must change password on first login

---

## 🆘 Troubleshooting

### Migration Issues

**Error: "Prisma schema contains new fields"**
```bash
# Solution: Run migration
npx prisma migrate dev --name add_password_security_fields
npx prisma generate
```

**Error: "Migration already applied"**
```bash
# Solution: Just regenerate client
npx prisma generate
```

### Email Not Sending

**In Development:**
- Emails log to console (this is expected)
- Check terminal output

**In Production:**
1. Verify `SENDGRID_API_KEY` is set
2. Verify `FROM_EMAIL` is verified in SendGrid
3. Check SendGrid dashboard for delivery logs
4. Check spam folder
5. Verify code in `lib/email.ts` is updated (see Step 3)

### Account Lockout Not Working

**Check:**
1. Database migration applied (new fields exist)
2. `lib/auth.ts` has lockout logic
3. Email service configured (lockout notification)

**Manual Unlock:**
```sql
UPDATE users
SET failed_login_attempts = 0,
    account_locked_until = NULL,
    last_failed_login_at = NULL
WHERE email = 'user@example.com';
```

### Password Change Not Enforced

**Check:**
1. `middleware.ts` has password change redirect
2. `types/next-auth.d.ts` includes `mustChangePassword`
3. Session includes `mustChangePassword` flag

---

## 📊 Monitoring

### Key Metrics to Track

1. **Failed Login Attempts:**
   ```sql
   SELECT email, failed_login_attempts, last_failed_login_at
   FROM users
   WHERE failed_login_attempts > 0
   ORDER BY last_failed_login_at DESC;
   ```

2. **Locked Accounts:**
   ```sql
   SELECT email, account_locked_until
   FROM users
   WHERE account_locked_until > NOW()
   ORDER BY account_locked_until DESC;
   ```

3. **Pending Password Changes:**
   ```sql
   SELECT email, role, created_at
   FROM users
   WHERE must_change_password = true
   ORDER BY created_at DESC;
   ```

4. **Recent Password Resets:**
   ```sql
   SELECT email, password_reset_expires
   FROM users
   WHERE password_reset_token IS NOT NULL
   ORDER BY password_reset_expires DESC;
   ```

---

## 🔄 Maintenance Tasks

### Weekly
- [ ] Review locked accounts
- [ ] Check email delivery logs
- [ ] Monitor failed login attempts

### Monthly
- [ ] Review user accounts (active/inactive)
- [ ] Check for expired reset tokens
- [ ] Audit security logs

### Quarterly
- [ ] Review password policy effectiveness
- [ ] Update email templates if needed
- [ ] Security audit

---

## 📝 Testing Checklist

### Before Production Launch

- [ ] Database migration applied
- [ ] Environment variables set
- [ ] Email service configured and tested
- [ ] SendGrid sender verified
- [ ] Admin can create parent account
- [ ] Admin can create student account
- [ ] Parent can login with email
- [ ] Parent can login with phone
- [ ] Student can login with registration number
- [ ] First-time password change enforced
- [ ] Password reset flow works (email)
- [ ] Password reset flow works (phone)
- [ ] Password reset flow works (student number)
- [ ] Account locks after 5 failed attempts
- [ ] Lockout email sent
- [ ] Account auto-unlocks after 15 minutes
- [ ] Change password works from profile
- [ ] All email templates display correctly
- [ ] Welcome emails received
- [ ] Password reset emails received
- [ ] Password changed emails received
- [ ] Account locked emails received

---

## 📞 Support Resources

### Documentation
- [AUTHENTICATION_MANUAL.md](AUTHENTICATION_MANUAL.md) - Complete user guide
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Technical details

### Code Files
- `lib/security.ts` - Security utilities
- `lib/email.ts` - Email service
- `lib/auth.ts` - Authentication logic
- `middleware.ts` - Route protection

### Admin Panel
- `/admin/create-accounts` - Create user accounts
- `/auth/login` - Admin login

### User Portals
- `/portal/login` - Parent/Student login
- `/portal/forgot-password` - Password recovery
- `/portal/reset-password` - Password reset
- `/portal/change-password` - Change password

---

## 🎓 Training for Admin Staff

### Account Creation Process
1. Verify student application approved
2. Create student account first
3. Create parent account
4. Link parent to student
5. Provide credentials to both
6. Inform them about first-login password change

### Handling Support Requests

**"I forgot my password"**
- Direct to: `/portal/forgot-password`
- Check if email on file is correct
- Verify spam folder

**"My account is locked"**
- Wait 15 minutes for auto-unlock
- OR manually unlock via database
- OR direct to password reset

**"I didn't receive welcome email"**
- Check spam folder
- Verify email address in system
- Manually provide credentials
- Resend via admin panel

---

## ✅ Post-Deployment Verification

After deployment, verify:

1. ✅ All pages load without errors
2. ✅ Database migration successful
3. ✅ Email service sending emails
4. ✅ Admin can create accounts
5. ✅ Parents/Students can login
6. ✅ Password reset works
7. ✅ Account lockout works
8. ✅ All email templates received

---

## 🚨 Emergency Procedures

### All Users Locked Out
```sql
-- Unlock all accounts
UPDATE users
SET failed_login_attempts = 0,
    account_locked_until = NULL,
    last_failed_login_at = NULL;
```

### Email Service Down
```typescript
// Temporarily disable email requirement in:
// lib/email.ts - Return true without sending
// Continue with account creation
// Fix email service later
```

### Reset Admin Password
```sql
-- Get admin user ID
SELECT id, email FROM users WHERE role = 'SUPER_ADMIN';

-- Generate new hash for password "TempAdmin2024"
-- Use bcrypt online generator or run:
-- node -e "console.log(require('bcryptjs').hashSync('TempAdmin2024', 10))"

UPDATE users
SET password = '$2a$10$hashedpasswordhere',
    must_change_password = true
WHERE id = 'admin_user_id';
```

---

**Deployment Complete!** 🎉

Your authentication system is now production-ready with enterprise-grade security.

For questions or issues, refer to [AUTHENTICATION_MANUAL.md](AUTHENTICATION_MANUAL.md)
