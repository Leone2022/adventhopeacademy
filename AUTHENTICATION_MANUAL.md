# 🔐 Authentication System Manual
## Advent Hope Academy School Management System

**Version:** 2.0
**Last Updated:** January 2026
**Document Type:** Technical & Operational Manual

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Security Architecture](#security-architecture)
3. [User Roles & Access Levels](#user-roles--access-levels)
4. [Account Creation Workflow](#account-creation-workflow)
5. [Login Workflows](#login-workflows)
6. [Password Management](#password-management)
7. [Security Features](#security-features)
8. [Admin Operations](#admin-operations)
9. [Email Notifications](#email-notifications)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Database Schema](#database-schema)
12. [API Reference](#api-reference)

---

## System Overview

### Purpose
This authentication system provides **secure, role-based access** to the Advent Hope Academy portal for:
- **Parents**: View children's academic progress, fees, and biodata
- **Students**: Access personal academic records and information
- **Staff**: Manage school operations (existing admin system)

### Key Features
✅ Multi-role authentication (Parent, Student, Staff/Admin)
✅ Secure password management with encryption
✅ Password reset via email
✅ Account lockout after failed attempts
✅ First-time login password change enforcement
✅ Email notifications for security events
✅ Admin-controlled account creation
✅ Audit logging for all authentication events

---

## Security Architecture

### Password Security

#### Password Requirements
All passwords must meet these criteria:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ⚠️ Special characters optional but recommended

#### Encryption
- **Algorithm**: bcrypt with salt rounds = 10
- **Token Hashing**: SHA-256 for password reset tokens
- **Storage**: All passwords hashed before database storage
- **No Plain Text**: Passwords never stored or transmitted in plain text

### Account Lockout Protection

#### Lockout Rules
- **Max Failed Attempts**: 5 consecutive failures
- **Lockout Duration**: 15 minutes
- **Auto-Unlock**: Account automatically unlocks after duration
- **Manual Unlock**: Admin can unlock via admin panel

#### Lockout Workflow
```
1. User enters wrong password → failedLoginAttempts++
2. Correct password → failedLoginAttempts reset to 0
3. After 5 failures → accountLockedUntil = now + 15 minutes
4. During lockout → Login blocked, email sent
5. After 15 minutes → Account auto-unlocks
```

### Token-Based Password Reset

#### Reset Token Lifecycle
```
1. User requests reset → Generate random 32-byte token
2. Hash token (SHA-256) → Store hashed version in DB
3. Send unhashed token via email → User clicks link
4. Validate token hash → Check expiry (1 hour)
5. User sets new password → Token cleared from DB
```

#### Token Security
- **Generation**: Cryptographically secure random bytes
- **Storage**: Only hashed version stored in database
- **Expiry**: 1 hour from generation
- **Single Use**: Token deleted after successful reset
- **No Enumeration**: Same response whether user exists or not

---

## User Roles & Access Levels

### Role Hierarchy

| Role | Access Level | Portal URL | Authentication Method |
|------|-------------|------------|----------------------|
| **PARENT** | View children's data only | `/parent/*` | Email or Phone + Password |
| **STUDENT** | View own data only | `/student/*` | Registration Number + Password |
| **TEACHER** | Manage classes & grades | `/teacher/*` | Email + Password |
| **ACCOUNTANT** | Finance management | `/accountant/*` | Email + Password |
| **REGISTRAR** | Student enrollment | `/registrar/*` | Email + Password |
| **SCHOOL_ADMIN** | Full school access | `/admin/*` | Email + Password |
| **SUPER_ADMIN** | System-wide access | `/super-admin/*` | Email + Password |

### Permission Matrix

| Feature | Parent | Student | Teacher | Admin |
|---------|--------|---------|---------|-------|
| View Results | ✅ (Children only) | ✅ (Self only) | ✅ (Assigned classes) | ✅ (All) |
| View Finances | ✅ (Children only) | ✅ (Self only) | ❌ | ✅ (All) |
| View Biodata | ✅ (Children only) | ✅ (Self only) | ✅ (Assigned students) | ✅ (All) |
| Edit Biodata | ❌ | ❌ | ❌ | ✅ |
| Create Accounts | ❌ | ❌ | ❌ | ✅ |
| Manage Fees | ❌ | ❌ | ❌ | ✅ |

---

## Account Creation Workflow

### Who Creates Accounts?

**Admin/Registrar creates all Parent and Student accounts** after:
1. Student application is approved
2. Student is enrolled in the school
3. Parent information is verified

### Step-by-Step Process

#### 1. Student Application Approval
```
Application Status Flow:
DRAFT → PENDING → UNDER_REVIEW → APPROVED → ENROLLED
                                 ↓
                            STUDENT ACCOUNT CREATED
```

#### 2. Admin Creates Student Account

**Via Admin Panel:**
```
1. Navigate to: /admin/students/create
2. Select approved application OR manual entry
3. System auto-generates:
   - Student Registration Number (e.g., STU2024001)
   - Temporary Password (12 characters, secure random)
   - User account (userId linked to student)
4. Admin reviews and confirms
5. System sends welcome email to student (if email provided)
```

**What Happens:**
- Creates `Student` record in database
- Creates linked `User` record with:
  - `role`: STUDENT
  - `mustChangePassword`: true (enforced on first login)
  - `password`: Hashed temporary password
  - `isActive`: true

#### 3. Admin Creates Parent Account

**Via Admin Panel:**
```
1. Navigate to: /admin/parents/create
2. Enter parent information:
   - Full Name
   - Email (required)
   - Phone Number
   - Relationship to student
3. Link to student(s)
4. System auto-generates:
   - Temporary Password
   - User account
5. System sends welcome email with credentials
```

**What Happens:**
- Creates `Parent` record in database
- Creates linked `User` record with:
  - `role`: PARENT
  - `mustChangePassword`: true
  - `password`: Hashed temporary password
  - `isActive`: true
- Creates `ParentStudent` link records

### Credential Delivery

#### Welcome Email Contains:
```
Subject: Welcome to Advent Hope Academy - Your Portal Access

Dear [Name],

Your [Parent/Student] account has been created.

Login Credentials:
Username: [email/phone/student number]
Temporary Password: [12-character secure password]

IMPORTANT: You must change this password on first login.

Login at: https://your-school.com/portal/login

Best regards,
Advent Hope Academy
```

#### SMS Alternative (Future Enhancement)
For parents without email:
```
Advent Hope Academy
Your parent portal password: [password]
Login: https://your-school.com/portal/login
Change password on first login.
```

---

## Login Workflows

### Parent Login Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Parent visits /portal/login                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Selects "Login as Parent"                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Enters Email/Phone + Password                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. System Validates:                                    │
│    - User exists                                        │
│    - isActive = true                                    │
│    - role = PARENT                                      │
│    - Has at least 1 ACTIVE child                        │
│    - Account not locked                                 │
│    - Password matches hash                              │
└─────────────────────────────────────────────────────────┘
                        ↓
                    ┌───┴───┐
                    │ Valid? │
                    └───┬───┘
            ┌───────────┴───────────┐
           YES                      NO
            ↓                        ↓
┌─────────────────────┐   ┌──────────────────────┐
│ 5a. Check           │   │ 5b. failedAttempts++ │
│ mustChangePassword  │   │ If >= 5: Lock        │
└─────────────────────┘   │ account              │
            ↓              └──────────────────────┘
        ┌───┴───┐                    ↓
        │ True? │          ┌──────────────────────┐
        └───┬───┘          │ Show error message   │
    ┌───────┴───────┐      └──────────────────────┘
   YES             NO
    ↓               ↓
┌──────────────┐  ┌──────────────────┐
│ Redirect to  │  │ Login successful │
│ /portal/     │  │ → /parent/       │
│ change-      │  │   dashboard      │
│ password     │  └──────────────────┘
└──────────────┘
```

### Student Login Flow

```
1. Student visits /portal/login
2. Selects "Login as Student"
3. Enters Registration Number + Password
4. System validates:
   - Student record exists
   - Student has linked user account
   - student.status = ACTIVE
   - Account not locked
   - Password matches hash
5. If mustChangePassword = true → /portal/change-password
6. Else → /student/dashboard
```

### Staff/Admin Login Flow
Uses existing `/auth/login` route:
```
1. Staff visits /auth/login
2. Enters Email + Password
3. Role-based redirect:
   - TEACHER → /teacher/dashboard
   - ACCOUNTANT → /accountant/dashboard
   - SCHOOL_ADMIN → /admin/dashboard
   - SUPER_ADMIN → /super-admin/dashboard
```

---

## Password Management

### First-Time Login (Forced Password Change)

#### When Triggered
- `mustChangePassword = true` (set during account creation)
- User successfully authenticates
- Before accessing any portal features

#### Workflow
```
1. User logs in successfully
2. System checks mustChangePassword flag
3. If true:
   - Redirect to /portal/change-password
   - Show: "For security, please change your temporary password"
   - Block all other routes until password changed
4. User enters:
   - Current password (the temporary one)
   - New password (must meet requirements)
   - Confirm new password
5. System validates and updates:
   - Sets mustChangePassword = false
   - Updates password hash
   - Sends "Password Changed" email
6. Redirect to appropriate dashboard
```

### Forgot Password Flow

#### Step 1: Request Reset
```
User Journey:
1. Click "Forgot Password" on login page
2. Select recovery method:
   - Email (for parents/staff)
   - Phone (for parents)
   - Student Number (for students)
3. Enter identifier
4. Submit request
```

#### Step 2: Email Sent
```
System Process:
1. Find user by identifier
2. Generate 32-byte random token
3. Hash token with SHA-256
4. Store hashed token in DB with 1-hour expiry
5. Send email with unhashed token in URL
6. Return success (even if user not found - security)
```

#### Step 3: User Resets Password
```
User Journey:
1. Click link in email
2. System validates token:
   - Token exists in DB (hashed)
   - Token not expired (< 1 hour old)
3. If valid:
   - Show password reset form
   - User enters new password (2x for confirmation)
   - System validates password strength
   - Updates password, clears token
   - Sends "Password Changed" email
4. If invalid:
   - Show "Token expired or invalid"
   - Offer to request new reset link
```

### Change Password (User-Initiated)

#### When Available
- After successful login
- From user profile settings
- At any time (not forced)

#### Workflow
```
1. User navigates to /portal/change-password
2. User must be authenticated
3. Form requires:
   - Current password (verify identity)
   - New password (must meet requirements)
   - Confirm new password
4. System validates:
   - Current password is correct
   - New password meets strength requirements
   - Passwords match
5. Update password and send confirmation email
```

---

## Security Features

### 1. Account Lockout

**Purpose**: Prevent brute-force password attacks

**Configuration**:
```typescript
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION = 15 minutes (900,000 ms)
```

**Implementation**:
```
On each login attempt:
1. Check if accountLockedUntil > now
   - If yes: Block login, show remaining time
   - If no: Proceed with authentication

2. If password wrong:
   - failedLoginAttempts++
   - lastFailedLoginAt = now
   - If failedLoginAttempts >= 5:
     - accountLockedUntil = now + 15 minutes
     - Send "Account Locked" email

3. If password correct:
   - Reset: failedLoginAttempts = 0
   - Clear: lastFailedLoginAt = null
   - Clear: accountLockedUntil = null
```

**User Experience**:
```
After 5 failed attempts:

"Account Temporarily Locked

Your account has been locked due to multiple failed login
attempts. For security, please wait 12 minutes before
trying again.

If you forgot your password, use the 'Forgot Password'
link to reset it.

If you didn't attempt to log in, please contact
administration immediately."
```

### 2. Password Strength Validation

**Server-Side Validation** (Always enforced):
```typescript
function validatePassword(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  }
}
```

**Client-Side Feedback** (Real-time indicators):
- Visual checkmarks/crosses for each requirement
- Color-coded: Green (pass), Red (fail)
- Shows as user types

### 3. Token Security

**Reset Token Generation**:
```typescript
// 1. Generate secure random token
const token = crypto.randomBytes(32).toString('hex')
// Result: "a1b2c3...64-character hex string"

// 2. Hash for database storage
const hashedToken = crypto
  .createHash('sha256')
  .update(token)
  .digest('hex')

// 3. Store hashed version
user.passwordResetToken = hashedToken
user.passwordResetExpires = Date.now() + 3600000 // 1 hour

// 4. Send unhashed token via email
// Only user has unhashed version!
```

**Why Hash Tokens?**
- Database breach → Attacker can't use hashed tokens
- Tokens never stored in plain text
- Same principle as password hashing

### 4. Session Management

**Technology**: NextAuth.js with JWT

**Session Configuration**:
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

**Token Contents**:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "PARENT",
  "schoolId": "school_id",
  "iat": 1234567890,
  "exp": 1237246290
}
```

### 5. Route Protection

**Middleware** (`middleware.ts`):
```typescript
// Public routes (no auth required)
["/", "/auth/login", "/auth/register", "/apply",
 "/portal/login", "/portal/forgot-password"]

// Protected routes (auth required)
Parent routes: /parent/* → Requires role = PARENT
Student routes: /student/* → Requires role = STUDENT
Admin routes: /admin/* → Requires role = SCHOOL_ADMIN

// Unauthorized access → Redirect to login
```

---

## Admin Operations

### 1. Create Parent Account

**Location**: `/admin/parents/create`

**Process**:
```typescript
1. Admin fills form:
   - Full Name *
   - Email * (unique)
   - Phone Number
   - Relationship to student
   - Select linked student(s)

2. System validation:
   - Email not already registered
   - At least one student selected
   - Student must be ACTIVE status

3. Account creation:
   const tempPassword = generateSecurePassword(12)
   const hashedPassword = await hashPassword(tempPassword)

   await prisma.user.create({
     data: {
       email: sanitizeEmail(email),
       password: hashedPassword,
       name: fullName,
       phone: phone,
       role: "PARENT",
       isActive: true,
       mustChangePassword: true,
       schoolId: adminSchoolId,
       createdBy: adminUserId,
     }
   })

   await prisma.parent.create({
     data: {
       userId: user.id,
       occupation, employer, address...
     }
   })

   // Link to students
   await prisma.parentStudent.createMany({
     data: selectedStudents.map(studentId => ({
       parentId: parent.id,
       studentId: studentId,
       relationship: "Parent",
       isPrimary: true,
     }))
   })

4. Send welcome email:
   await sendWelcomeEmail(
     email,
     fullName,
     "PARENT",
     {
       username: email,
       password: tempPassword, // Plain text in email
       loginUrl: `${APP_URL}/portal/login`
     }
   )

5. Show success:
   "Parent account created successfully.
   Welcome email sent to: [email]
   Temporary password: [tempPassword] (save this)"
```

### 2. Create Student Account

**Location**: `/admin/students/create`

**Process**:
```typescript
1. Admin selects:
   - Approved Application (auto-fill data)
   OR
   - Manual Entry

2. System generates:
   - Student Number: "STU" + year + sequence
     Example: STU2024001
   - Temporary Password: 12-character secure

3. Account creation:
   await prisma.student.create({
     data: {
       studentNumber: generatedNumber,
       firstName, lastName, dateOfBirth,
       gender, curriculum, admissionDate,
       currentClassId, schoolId,
       status: "ACTIVE",
       user: {
         create: {
           email: studentEmail,
           password: await hashPassword(tempPassword),
           name: `${firstName} ${lastName}`,
           phone: studentPhone,
           role: "STUDENT",
           isActive: true,
           mustChangePassword: true,
           schoolId: adminSchoolId,
         }
       }
     }
   })

4. Send credentials (if email provided):
   await sendWelcomeEmail(
     studentEmail,
     studentName,
     "STUDENT",
     {
       username: studentNumber,
       password: tempPassword,
       loginUrl: `${APP_URL}/portal/login`
     }
   )

5. Success message:
   "Student account created successfully.
   Registration Number: STU2024001
   Temporary Password: [password]

   Give these credentials to the student."
```

### 3. Manage Account Status

**Deactivate Account**:
```sql
UPDATE users
SET isActive = false
WHERE id = 'user_id';
```
- User cannot log in
- Session immediately invalid
- Can be reactivated by admin

**Reactivate Account**:
```sql
UPDATE users
SET isActive = true,
    failedLoginAttempts = 0,
    accountLockedUntil = NULL
WHERE id = 'user_id';
```

### 4. Reset User Password (Admin)

**Process**:
```typescript
1. Admin navigates to user profile
2. Clicks "Reset Password"
3. System generates new temporary password
4. Updates database:
   - New password hash
   - mustChangePassword = true
5. Admin options:
   a) Send email to user
   b) Display password to give user in person
6. User must change on next login
```

### 5. Unlock Locked Account

**Manual Unlock**:
```typescript
await prisma.user.update({
  where: { id: userId },
  data: {
    failedLoginAttempts: 0,
    accountLockedUntil: null,
    lastFailedLoginAt: null,
  }
})
```

---

## Email Notifications

### 1. Welcome Email (Account Created)

**Sent When**: Admin creates new parent/student account

**Template**:
```
Subject: Welcome to Advent Hope Academy - Your [Parent/Student] Portal Access

Dear [Name],

Your [parent/student] account has been created successfully.
You can now access the portal.

Login Credentials:
Username: [email/phone/studentNumber]
Temporary Password: [12-char password]

⚠️ IMPORTANT: You will be required to change this password
on your first login.

Login at: [URL]

What You Can Do:
[Parent features OR Student features list]

If you have questions, contact administration.

Best regards,
Advent Hope Academy Administration Team

---
This is an automated message. Please do not reply.
Phone: +263 773 102 003 | Email: info@adventhope.ac.zw
```

### 2. Password Reset Email

**Sent When**: User requests password reset

**Template**:
```
Subject: Reset Your Password - Advent Hope Academy

Dear [Name],

We received a request to reset your password.

[Reset Password Button] → Link expires in 1 hour

Or copy this link: [reset-url-with-token]

⚠️ Security Notice:
- This link expires in 1 hour
- If you didn't request this, ignore this email
- Your password won't change unless you click the link

Best regards,
Advent Hope Academy Administration
```

### 3. Password Changed Confirmation

**Sent When**: Password successfully changed

**Template**:
```
Subject: Your Password Has Been Changed - Advent Hope Academy

Dear [Name],

This confirms your password was successfully changed on:
[Date & Time]

⚠️ Didn't change your password?
If you didn't make this change, contact administration
IMMEDIATELY at:
- Email: info@adventhope.ac.zw
- Phone: +263 773 102 003

Best regards,
Advent Hope Academy Administration
```

### 4. Account Locked Notification

**Sent When**: Account locked after 5 failed attempts

**Template**:
```
Subject: Account Temporarily Locked - Advent Hope Academy

Dear [Name],

🔒 Your account has been temporarily locked due to multiple
failed login attempts.

Your account will automatically unlock in [X] minutes.

This is a security measure to protect your account.

What you can do:
1. Wait [X] minutes for automatic unlock
2. Use "Forgot Password" to reset your password
3. Contact administration if you didn't attempt to log in

Best regards,
Advent Hope Academy Administration
```

---

## Troubleshooting Guide

### Common Issues

#### 1. "Invalid credentials" Error

**Possible Causes**:
- Wrong password
- Wrong username/email/student number
- Account not yet created by admin
- Account deactivated

**Solutions**:
1. Check spelling and capitalization
2. For parents: Try both email AND phone
3. For students: Verify registration number format (STU2024001)
4. Use "Forgot Password" if unsure
5. Contact admin to verify account exists and is active

#### 2. "Account not yet approved by admin"

**Cause**: Parent trying to log in but child's application not approved or child not ACTIVE status

**Solution**:
1. Admin must approve student application
2. Student status must be "ACTIVE"
3. ParentStudent link must exist in database
4. If all met, contact technical support

#### 3. "Account temporarily locked"

**Cause**: 5 failed login attempts

**Solutions**:
1. **Wait 15 minutes** for automatic unlock
2. Use "Forgot Password" to reset immediately
3. Admin can manually unlock via admin panel

#### 4. Password reset email not received

**Possible Causes**:
- Email in spam folder
- Wrong email address entered
- Email service delay
- Email not registered in system

**Solutions**:
1. Check spam/junk folder
2. Wait 5 minutes and check again
3. Verify correct email address
4. Try "Forgot Password" again
5. Contact admin to verify email on file

#### 5. Reset link says "expired or invalid"

**Causes**:
- Link older than 1 hour
- Link already used
- Token tampered with

**Solution**:
- Request new password reset
- Links are single-use and expire after 1 hour

#### 6. Can't change password - "Password doesn't meet requirements"

**Solution**:
Ensure new password has:
- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)

Example good password: `MySchool2024`

---

## Database Schema

### User Table (Extended)

```sql
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String    -- bcrypt hashed
  name                  String
  phone                 String?
  role                  UserRole  -- PARENT | STUDENT | etc.
  schoolId              String?
  isActive              Boolean   @default(true)

  -- Security fields
  emailVerified         DateTime?
  mustChangePassword    Boolean   @default(true)
  passwordResetToken    String?   -- SHA-256 hashed
  passwordResetExpires  DateTime?

  -- Account lockout
  failedLoginAttempts   Int       @default(0)
  lastFailedLoginAt     DateTime?
  accountLockedUntil    DateTime?

  -- Audit
  lastLogin             DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  createdBy             String?

  -- Relations
  parentProfile         Parent?
  studentProfile        Student?
  staffProfile          Staff?
  school                School?
}
```

### Key Fields Explained

| Field | Purpose | Values |
|-------|---------|--------|
| `isActive` | Master account switch | true = can login, false = blocked |
| `mustChangePassword` | Force password change on next login | true = redirect to change-password |
| `passwordResetToken` | Hashed token for password reset | 64-char SHA-256 hash |
| `passwordResetExpires` | Token expiry timestamp | null or future DateTime |
| `failedLoginAttempts` | Count of consecutive failures | 0-5 (locks at 5) |
| `lastFailedLoginAt` | Timestamp of last failure | Used for lockout duration |
| `accountLockedUntil` | Lockout expiry | null or future DateTime |

---

## API Reference

### Authentication Endpoints

#### POST `/api/auth/forgot-password`
Request password reset

**Request**:
```json
{
  "identifier": "user@example.com",
  "recoveryMethod": "email"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If an account exists, reset instructions have been sent"
}
```

#### POST `/api/auth/validate-reset-token`
Validate password reset token

**Request**:
```json
{
  "token": "64-character-hex-string"
}
```

**Response**:
```json
{
  "valid": true
}
```

#### POST `/api/auth/reset-password`
Reset password with token

**Request**:
```json
{
  "token": "64-character-hex-string",
  "password": "NewSecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

#### POST `/api/auth/change-password`
Change password (authenticated)

**Request**:
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Implementation Checklist

### Before Going Live

- [ ] Run database migration to add security fields
- [ ] Configure email service (SendGrid/AWS SES)
- [ ] Set environment variables:
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] Email service credentials
- [ ] Test all authentication flows
- [ ] Create admin accounts
- [ ] Document password reset process for support team
- [ ] Set up monitoring for failed login attempts
- [ ] Configure backup email service
- [ ] Test email deliverability
- [ ] Review and approve email templates
- [ ] Train admin staff on account creation process

### Security Review

- [ ] Password hashing using bcrypt ✅
- [ ] Reset tokens hashed before storage ✅
- [ ] Account lockout after 5 failures ✅
- [ ] Reset links expire after 1 hour ✅
- [ ] No password enumeration attacks ✅
- [ ] All routes protected by middleware ✅
- [ ] Role-based access control enforced ✅
- [ ] Passwords never logged or displayed ✅
- [ ] Security email notifications sent ✅
- [ ] Session tokens expire after 30 days ✅

---

## Support & Contact

### For Users
- **Email**: info@adventhope.ac.zw
- **Phone**: +263 773 102 003
- **Office Hours**: Monday-Friday, 7:30am-4:30pm

### For Administrators
- **Technical Documentation**: This manual
- **Admin Training**: Contact IT department
- **Emergency Lockout**: Manual override via database

---

**Document End**

*Advent Hope Academy | Excellence in Christian Education*
*School Management System v2.0*
