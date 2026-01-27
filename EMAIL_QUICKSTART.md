# 📧 Email Setup - Quick Start Card

## 30 Second Summary

Your SMS has full email integration. **Just 4 simple steps to activate:**

---

## ⚡ Quick Setup (5 Minutes)

### Step 1️⃣: Get Gmail App Password
```
Visit: https://myaccount.google.com/apppasswords
Select: Mail + Windows Computer
Copy: 16-character password
```

### Step 2️⃣: Create .env File
Save this in your project root directory:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Advent Hope Academy <noreply@adventhope.ac.zw>
```

### Step 3️⃣: Test It Works
```bash
node scripts/test-email.js
```

### Step 4️⃣: Start Server
```bash
npm run dev
```

---

## ✅ What Now Works

| Feature | Where | Result |
|---------|-------|--------|
| **Account Creation** | `/admin/create-accounts` | Welcome email sent |
| **Password Reset** | `/portal/forgot-password` | Reset link emailed |
| **Account Locked** | 5 failed logins | Lockout notification emailed |
| **Password Changed** | `/portal/change-password` | Confirmation email sent |

---

## 🧪 Test Email Sending

```bash
# Test SMTP connection
node scripts/test-email.js

# Should show:
# ✅ SMTP Connection Verified!
# ✅ Email sent successfully!
```

Check your Gmail inbox for test email.

---

## 📚 Documentation

**Quick Start** (this file - 2 min read)
- Immediate setup instructions

**Setup Guide** - `GMAIL_SMTP_SETUP.md` (5 min read)
- Detailed Gmail configuration
- Troubleshooting tips
- Complete checklist

**Status Report** - `EMAIL_INTEGRATION_STATUS.md` (10 min read)
- Feature overview
- All email types explained
- Testing procedures

**Technical Ref** - `EMAIL_TECHNICAL_REFERENCE.md` (15 min read)
- Implementation details
- Code examples
- API integration guide

---

## 🚨 Common Issues

### ❌ "Invalid login"
- Are you using **16-char app password**? (Not regular Gmail password)
- Go to: https://myaccount.google.com/apppasswords

### ❌ "Email not sending"
- Check `.env` file has EMAIL_USER and EMAIL_PASSWORD
- Run `node scripts/test-email.js` to diagnose

### ❌ "Can't find reset email"
- Check **Spam folder**
- Check **Promotions tab**
- Try sending again

---

## 🎯 What's Happening Behind Scenes

```
Admin Creates Account
    ↓
Account saved to database
    ↓
sendWelcomeEmail() called
    ↓
Gmail SMTP sends email (5 seconds)
    ↓
User receives credentials in inbox
```

---

## 📊 Email Limits

- **Daily**: 500 emails/day (plenty for schools)
- **Time**: 2-5 seconds per email
- **Cost**: FREE (with Gmail)

---

## 🚀 After Setup Works

### Phase 2: Self-Registration (Next Week)
- Parents can self-register
- Students can self-register  
- Admin approves accounts
- Credentials emailed automatically

### Phase 3: Production (Month 2)
- Switch to SendGrid if needed ($19.95/month)
- Use custom domain email
- Production email verified

---

## 📋 Setup Checklist

```bash
# 1. Get Gmail app password
# Visit: https://myaccount.google.com/apppasswords
# ☐ Copied 16-character password

# 2. Create .env file
# ☐ EMAIL_USER = your Gmail
# ☐ EMAIL_PASSWORD = 16-char password
# ☐ EMAIL_FROM = School name

# 3. Test configuration
# ☐ Run: node scripts/test-email.js
# ☐ Check inbox for test email

# 4. Verify everything
# ☐ npm run dev
# ☐ Visit http://localhost:3002
# ☐ Create test account
# ☐ Check inbox for welcome email

# ✅ You're Done!
```

---

## 🔗 Quick Links

- **Gmail App Password**: https://myaccount.google.com/apppasswords
- **Gmail Security**: https://myaccount.google.com/security
- **Gmail SMTP Docs**: https://support.google.com/mail/answer/7126229
- **Nodemailer Docs**: https://nodemailer.com/

---

## 💡 Pro Tips

1. **Use school email**: Create dedicated Gmail for school (looks professional)
2. **Keep app password safe**: Store it in `.env`, never share it
3. **Test before production**: Always run `test-email.js` after changes
4. **Monitor deliverability**: Check spam folder if users aren't seeing emails
5. **Plan for scale**: At 500+ emails/day, switch to SendGrid

---

## ⚙️ Server Logs

When email sends, you'll see:
```
✅ Email sent successfully: <message-id@gmail.com>
To: user@example.com
Subject: Welcome to Advent Hope Academy
```

If email fails:
```
⚠️ Gmail credentials not configured. Using console logging.
(Emails will be logged to console instead of sent)

OR

❌ Email sending failed: [Error message]
(Check .env variables and troubleshooting section)
```

---

## 🎉 You're All Set!

Email integration is **complete and ready to use**.

**Next Action:**
1. Get Gmail app password (2 minutes)
2. Update .env file (1 minute)  
3. Run test script (30 seconds)
4. Start using it!

**Total time: 5 minutes** ⏱️

---

**System Status**: ✅ EMAIL READY
**Version**: 1.0
**Last Updated**: 2024
