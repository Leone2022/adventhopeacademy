# 📋 Admin Quick Reference Card
## Advent Hope Academy - Authentication System

**Print this page and keep at your desk for quick reference**

---

## 🔑 Access URLs

| Purpose | URL |
|---------|-----|
| Admin Login | https://your-domain.com/auth/login |
| Create Accounts | https://your-domain.com/admin/create-accounts |
| Parent/Student Login | https://your-domain.com/portal/login |

---

## 👥 Creating Parent Accounts

1. Go to: `/admin/create-accounts`
2. Click "Parent Account" tab
3. Fill in:
   - **Full Name** (Required)
   - **Email** (Required) - Will be their username
   - **Phone** (Optional) - Can also be used to login
4. Click "Create Parent Account"
5. **SAVE THE DISPLAYED CREDENTIALS**
   - Email: [shown on screen]
   - Password: [12-character password]
6. Give credentials to parent
7. Welcome email sent automatically
8. Parent must change password on first login

**Important:** Copy credentials before closing the success screen!

---

## 🎓 Creating Student Accounts

1. Go to: `/admin/create-accounts`
2. Click "Student Account" tab
3. Fill in:
   - **First Name** (Required)
   - **Last Name** (Required)
   - **Gender** (Required)
   - **Email** (Optional) - For receiving credentials
4. Click "Create Student Account"
5. **SAVE THE DISPLAYED CREDENTIALS**
   - Registration Number: STU2024XXX
   - Password: [12-character password]
6. Give credentials to student
7. Welcome email sent (if email provided)
8. Student must change password on first login

**Important:** Record the Student Registration Number!

---

## 🆘 Common Support Issues

### "I forgot my password"
**Solution:**
1. Direct user to: `/portal/forgot-password`
2. Parent can use:
   - Email address
   - Phone number
3. Student can use:
   - Registration Number
4. Check spam folder if email not received
5. Reset link expires in 1 hour

### "My account is locked"
**Cause:** 5 failed login attempts

**Solutions:**
- **Wait 15 minutes** (auto-unlocks)
- **OR** Use "Forgot Password" to reset
- **OR** Admin can manually unlock:
  ```sql
  UPDATE users
  SET failed_login_attempts = 0,
      account_locked_until = NULL
  WHERE email = 'user@example.com';
  ```

### "I didn't receive the welcome email"
**Solutions:**
1. Check spam/junk folder
2. Verify email address in system
3. Manually provide saved credentials
4. Check email service status
5. Resend via admin panel (if available)

### "Account not approved by admin"
**For Parents:**
- Child's application must be APPROVED
- At least one child must be ACTIVE status
- Check student status in admin panel

---

## 📧 Email Templates Sent

| Event | To | When |
|-------|----|----|
| Welcome Email | Parent/Student | Account created |
| Password Reset | User | Forgot password requested |
| Password Changed | User | Password updated |
| Account Locked | User | 5 failed login attempts |

---

## 🔐 Security Rules

### Password Requirements
✅ Minimum 8 characters
✅ At least one uppercase letter (A-Z)
✅ At least one lowercase letter (a-z)
✅ At least one number (0-9)

**Example:** `MySchool2024`

### Account Lockout
- **Trigger:** 5 failed login attempts
- **Duration:** 15 minutes
- **Auto-Unlock:** Yes
- **Email Sent:** Yes

### First-Time Login
- **All new users** must change password
- **Cannot skip** this step
- **Cannot access** portal until changed

---

## 📱 Login Methods

### Parents Can Login With:
- ✅ Email + Password
- ✅ Phone Number + Password

### Students Can Login With:
- ✅ Registration Number + Password

### Admin/Staff Can Login With:
- ✅ Email + Password (at /auth/login)

---

## 🔢 Student Number Format

**Format:** `STU` + `Year` + `Sequence`

**Examples:**
- First student of 2024: `STU2024001`
- Second student of 2024: `STU2024002`
- 100th student of 2024: `STU2024100`

**Auto-generated** - Don't manually create

---

## ⚠️ Important Reminders

### When Creating Accounts:
1. ✅ Always save displayed credentials
2. ✅ Copy before closing success screen
3. ✅ Use "Print" button if needed
4. ✅ Provide credentials to user
5. ✅ Inform them about password change

### Security Best Practices:
1. ✅ Never email plain-text passwords
2. ✅ Don't write passwords on paper (unless giving to user)
3. ✅ Verify user identity before resetting password
4. ✅ Check if user received welcome email
5. ✅ Remind users to change password on first login

---

## 🗃️ Database Queries (If Needed)

### Check Account Status
```sql
SELECT email, role, is_active, must_change_password
FROM users
WHERE email = 'user@example.com';
```

### Find Locked Accounts
```sql
SELECT email, account_locked_until
FROM users
WHERE account_locked_until > NOW();
```

### Find Student by Number
```sql
SELECT s.student_number, u.email, u.is_active
FROM students s
JOIN users u ON s.user_id = u.id
WHERE s.student_number = 'STU2024001';
```

### Reset Password Attempts
```sql
UPDATE users
SET failed_login_attempts = 0,
    last_failed_login_at = NULL
WHERE email = 'user@example.com';
```

---

## 📞 Emergency Contacts

### For Technical Issues:
- IT Support: [contact info]
- Developer: [contact info]

### For Email Issues:
- Check SendGrid dashboard
- Verify sender email verified
- Check spam folder first

---

## 📊 Quick Stats

### Check Active Users
```sql
SELECT role, COUNT(*) as count
FROM users
WHERE is_active = true
GROUP BY role;
```

### Check Pending Password Changes
```sql
SELECT role, COUNT(*) as count
FROM users
WHERE must_change_password = true
GROUP BY role;
```

---

## 🎓 Training Resources

**Full Documentation:**
- [AUTHENTICATION_MANUAL.md](AUTHENTICATION_MANUAL.md) - Complete guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Technical setup
- [COMPLETED_FEATURES.md](COMPLETED_FEATURES.md) - Features list

**Video Tutorials:**
- [Record these after deployment]
- Creating parent accounts
- Creating student accounts
- Password reset process

---

## ✅ Daily Checklist

### Morning:
- [ ] Check for locked accounts
- [ ] Review failed login attempts
- [ ] Check email delivery logs

### When Creating Accounts:
- [ ] Save credentials before closing
- [ ] Verify welcome email sent
- [ ] Provide credentials to user
- [ ] Remind about password change

### End of Day:
- [ ] Review accounts created today
- [ ] Check for support tickets
- [ ] Clear temporary notes

---

**Quick Help:** For detailed instructions, see [AUTHENTICATION_MANUAL.md](AUTHENTICATION_MANUAL.md)

**Print Date:** _______________
**Updated By:** _______________

---

*Advent Hope Academy | School Management System v2.0*
