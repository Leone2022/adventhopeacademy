# 📧 Gmail SMTP Setup Guide

## ✅ What's Done

Your email service has been updated to use **Gmail SMTP** with `nodemailer`. Emails will now be sent in real-time instead of just logged to console.

---

## 🔧 Quick Setup (5 Minutes)

### **Step 1: Create/Use Gmail Account**

You have two options:

**Option A: Use Your Personal Gmail**
- Email: your-email@gmail.com
- Password: your-password

**Option B: Create School Email (RECOMMENDED)**
- Create: `noreply@gmail.com` or `academy@gmail.com`
- This looks more professional

For this guide, we'll use a Gmail account.

---

### **Step 2: Generate App Password**

Gmail requires an "App Password" for security. Follow these steps:

1. **Go to:** https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled)
   - Click "2-Step Verification"
   - Follow the prompts
   - Add your phone number

3. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: **Mail** and **Windows Computer** (or your OS)
   - Click **Generate**
   - Google will show a 16-character password
   - **Copy this password** (save it somewhere safe!)

Example: `abcd efgh ijkl mnop`

---

### **Step 3: Update Environment Variables**

Open `.env` file in your project root and add:

```env
# Gmail SMTP Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Advent Hope Academy <noreply@adventhope.ac.zw>
```

**Important:**
- Replace `your-email@gmail.com` with your actual Gmail
- Replace `abcd efgh ijkl mnop` with your 16-character app password
- The `<>` part can be your school name

---

### **Step 4: Restart Development Server**

```bash
npm run dev
```

---

## ✅ Test Your Setup

### **Test 1: Admin Creates Account**

1. Go to: http://localhost:3002/admin/create-accounts
2. Create a parent or student account
3. **Check Gmail inbox for "Welcome" email**
4. You should receive credentials within 10 seconds

### **Test 2: Password Reset**

1. Go to: http://localhost:3002/portal/forgot-password
2. Enter an email address
3. **Check for "Password Reset" email**
4. Click the link and change password

### **Test 3: Account Locked Notification**

1. Try logging in with wrong password 5 times
2. **Check email for "Account Locked" notification**

---

## 📊 Expected Behavior

### ✅ Emails Are Sending

You'll see in console:
```
✅ Email sent successfully: <message-id>
```

### ❌ Gmail Blocking Emails

If you see:
```
Error: Invalid login
```

**Solutions:**
1. Check you're using the **App Password** (not regular password)
2. Check the email/password are correct in `.env`
3. Make sure 2-Step Verification is enabled
4. Try generating a NEW app password

### ❌ Emails Going to Spam

Gmail sometimes sends to spam. **Check:**
1. Spam folder
2. Promotions tab
3. Updates tab

---

## 📋 Gmail SMTP Settings

```
Host:     smtp.gmail.com
Port:     587
Security: TLS
User:     your-email@gmail.com
Password: Your 16-char app password
```

---

## ⚠️ Important Notes

### **App Password vs Regular Password**

- ❌ **Don't use:** Your regular Gmail password
- ✅ **Do use:** Your 16-character App Password

### **Daily Email Limit**

Gmail allows:
- **500 emails/day** per account
- If you exceed this, emails won't send for 24 hours

For your school, this is plenty!

### **Email Verification**

Email headers should show:
```
From: Advent Hope Academy <your-email@gmail.com>
```

---

## 🔄 Switch to SendGrid Later

When you're ready for production, switch to SendGrid:

1. **Sign up:** https://sendgrid.com
2. **Get API Key**
3. **Update `.env`:**
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxx
   ```
4. **Uncomment code in `lib/email.ts`**

Cost: $19.95/month for 50,000 emails/month

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Email not sending** | Check `.env` has correct app password |
| **"Invalid login" error** | Use 16-char App Password, not regular password |
| **Emails in spam** | Add your domain to Gmail authentication |
| **Connection timeout** | Check internet connection, firewall not blocking port 587 |
| **"Too many emails"** | Wait 24 hours or reduce daily volume |

---

## 📞 Support

If emails still aren't working:

1. **Check `.env` file:**
   ```bash
   cat .env | grep EMAIL
   ```

2. **Check server logs:**
   - Look for error messages in terminal
   - Search for "Email sending failed"

3. **Try test command:**
   ```bash
   node -e "
   const nodemailer = require('nodemailer');
   const t = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: 'YOUR_EMAIL@gmail.com',
       pass: 'YOUR_APP_PASSWORD'
     }
   });
   t.sendMail({from: 'YOUR_EMAIL@gmail.com', to: 'test@example.com', subject: 'Test', html: 'Test'}, (e,i) => console.log(e || 'Sent: ' + i.messageId));
   "
   ```

---

## ✨ What's Next?

Once Gmail is working:

1. **Test all features:**
   - Admin account creation ✅
   - Password reset ✅
   - Account lockout emails ✅

2. **Next feature:**
   - Self-registration for parents
   - Admin approval workflow
   - Auto-credential generation

3. **Ready for production?**
   - Switch to SendGrid
   - Use your domain email
   - Add branding

---

## 📝 Reference

**Environment Variables Needed:**
```env
EMAIL_USER=your-email@gmail.com          # Your Gmail address
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx      # 16-char App Password
EMAIL_FROM=School Name <noreply@...>    # Display name in emails
```

**Files Modified:**
- `lib/email.ts` - Gmail SMTP integration

**Package Added:**
- `nodemailer` - SMTP email library

---

**Happy emailing! 🚀**
