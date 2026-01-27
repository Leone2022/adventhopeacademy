# 🔧 Email System Technical Reference

## Current Implementation

### Email Service Architecture

```
User Action (Create Account / Reset Password / etc)
    ↓
API Route (app/api/...)
    ↓
sendWelcomeEmail() / sendPasswordResetEmail() / etc
    ↓
lib/email.ts → sendEmail()
    ↓
nodemailer createTransporter()
    ↓
Gmail SMTP (smtp.gmail.com:587)
    ↓
Gmail Outbox → User Inbox
```

---

## Email Functions Available

### 1. sendWelcomeEmail()

**Used by:**
- Admin creating parent account (`app/api/admin/create-parent/route.ts`)
- Admin creating student account (`app/api/admin/create-student/route.ts`)

**Sends:**
- Welcome email with temporary credentials
- Login URL and first-time password change requirement

**Template:**
```html
Subject: Welcome to Advent Hope Academy
Body: Welcome greeting + credentials + login link + security info
```

---

### 2. sendPasswordResetEmail()

**Used by:**
- Forgot password request (`app/api/auth/forgot-password/route.ts`)

**Sends:**
- Password reset link (expires 1 hour)
- Security notice: "If you didn't request this, ignore this email"

**Template:**
```html
Subject: Password Reset Request - Advent Hope Academy
Body: Reset link + expiry notice + security info
```

---

### 3. sendPasswordResetConfirmation()

**Used by:**
- Password reset completion (`app/api/auth/reset-password/route.ts`)

**Sends:**
- Confirmation that password was successfully changed
- Timestamp and security warning

**Template:**
```html
Subject: Your Password Has Been Changed
Body: Confirmation + timestamp + security actions
```

---

### 4. sendPasswordChangeEmail()

**Used by:**
- User changes password (`app/api/auth/change-password/route.ts`)

**Sends:**
- Notification of password change
- Current session info and security recommendations

**Template:**
```html
Subject: Your Password Has Been Changed
Body: Confirmation + timestamp + 2FA recommendation
```

---

### 5. sendAccountLockedEmail()

**Used by:**
- Automatic lockout after 5 failed login attempts

**Sends:**
- Account locked notification (15-minute lock)
- Instructions to reset password via forgot-password page

**Template:**
```html
Subject: Your Account Has Been Locked
Body: Lockout notice + unlock time + password reset instructions
```

---

## Implementation Details

### sendEmail() Function

Located in: `lib/email.ts`

```typescript
async function sendEmail(options: EmailOptions): Promise<boolean>
```

**Logic:**
1. Creates nodemailer transporter with Gmail SMTP
2. Checks if EMAIL_USER and EMAIL_PASSWORD are set
3. If credentials exist:
   - Sends real email via Gmail SMTP
   - Logs success with message ID
   - Catches errors and logs them
4. If credentials missing:
   - Falls back to console logging
   - Useful for development without real credentials

**Error Handling:**
```typescript
try {
  const info = await transporter.sendMail({...})
  console.log("✅ Email sent successfully:", info.messageId)
  return true
} catch (error) {
  console.error("❌ Email sending failed:", error)
  return false
}
```

---

## Configuration

### Environment Variables

```env
# Required
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# Optional (defaults to EMAIL_USER if not set)
EMAIL_FROM=Advent Hope Academy <noreply@adventhope.ac.zw>
```

### SMTP Details

```javascript
{
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
}
```

---

## Calling Email Functions

### From API Routes

```typescript
import { sendWelcomeEmail } from "@/lib/email"

// In API route handler
const success = await sendWelcomeEmail(
  email: "parent@example.com",
  name: "John Doe",
  role: "PARENT",
  credentials: {
    username: "parent123",
    password: "TempPass123!",
    loginUrl: "https://yoursite.com/portal/login"
  }
)

if (success) {
  // Email sent successfully
} else {
  // Email failed - still continue (don't block account creation)
}
```

### Error Handling Pattern

```typescript
// Always continue even if email fails
// The account is created, just email isn't sent
try {
  await sendWelcomeEmail(...)
} catch (error) {
  console.error("Email failed but account created:", error)
  // Continue processing
}

// Return success regardless of email status
return NextResponse.json({ success: true }, { status: 201 })
```

---

## Email Templates

All templates are in `lib/email.ts` as HTML strings.

### Template Structure

```typescript
const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); }
      .content { background: #f8f9fa; padding: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><!-- header content --></div>
      <div class="content"><!-- email content --></div>
    </div>
  </body>
  </html>
`
```

### Color Scheme

- Primary: `#1e40af` (Dark Blue)
- Secondary: `#0d9488` (Emerald)
- Background: `#f8f9fa` (Light Gray)
- Gradient: `linear-gradient(135deg, #1e40af 0%, #0d9488 100%)`

---

## Testing Email System

### Automated Test Script

Run: `node scripts/test-email.js`

**What it does:**
1. Checks environment variables are set
2. Verifies Gmail SMTP connection
3. Sends test email to EMAIL_USER
4. Confirms successful sending

**Output examples:**

Success:
```
✅ SMTP Connection Verified!
✅ Email sent successfully!
   Message ID: <abc123@gmail.com>

📬 Check your inbox at: your-email@gmail.com
```

Failure:
```
❌ SMTP Connection Failed:
Error: Invalid login

📝 Common Issues:
   1. Using regular Gmail password (use 16-char App Password instead)
   2. 2-Step Verification not enabled on Gmail account
   3. Email/password incorrect in .env file
```

### Manual Testing

#### Test 1: Create Account Email
```
1. Go to /admin/create-accounts
2. Fill parent details
3. Click "Create Account"
4. Watch server logs for "✅ Email sent successfully"
5. Check inbox for welcome email
```

#### Test 2: Password Reset Email
```
1. Go to /portal/forgot-password
2. Enter email address
3. Click "Send Reset Link"
4. Watch server logs
5. Check inbox for reset email
6. Click reset link and change password
7. Check inbox for confirmation email
```

#### Test 3: Account Lockout Email
```
1. Go to /portal/login
2. Try wrong password 5 times
3. 5th attempt triggers lockout
4. Check inbox for lockout notification
5. Wait 15 minutes or reset password
```

---

## Debugging

### Check Server Logs

When email is sent, you'll see:

**Success:**
```
✅ Email sent successfully: <message-id@gmail.com>
To: user@example.com
Subject: Your Email Subject
```

**Fallback (no credentials):**
```
⚠️ Gmail credentials not configured. Using console logging.
📧 EMAIL (Console Fallback):
To: user@example.com
Subject: Your Email Subject
Body: [email content]
```

**Error:**
```
❌ Email sending failed: [Error details]
Error: Invalid login (use 16-char app password, not regular password)
```

### Enable Debug Mode

Add to `lib/email.ts`:

```typescript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true,  // Enable logging
  debug: true    // Enable debug output
})
```

This will show detailed SMTP communication in console.

---

## Future Enhancements

### SendGrid Integration

When ready for production, replace nodemailer with SendGrid:

```typescript
import sgMail from "@sendgrid/mail"

const sendEmail = async (options) => {
  const msg = {
    to: options.to,
    from: process.env.EMAIL_FROM,
    subject: options.subject,
    html: options.html,
  }
  await sgMail.send(msg)
}
```

### AWS SES Integration

For large-scale deployments:

```typescript
const sesClient = new SESClient()
const sendEmailCommand = new SendEmailCommand({
  Source: process.env.EMAIL_FROM,
  Destination: { ToAddresses: [options.to] },
  Message: {...}
})
await sesClient.send(sendEmailCommand)
```

### Email Queue System

For reliability and retry logic:

```typescript
import Queue from "bull"
const emailQueue = new Queue("emails", process.env.REDIS_URL)

emailQueue.add({ to, subject, html })
emailQueue.process(async (job) => {
  await sendEmail(job.data)
})
```

### Email Template Engine

For more complex templates:

```typescript
import handlebars from "handlebars"

const template = handlebars.compile(htmlString)
const html = template({ name, resetLink, expiryTime })
```

---

## Security Considerations

### 1. Never Commit Credentials
```bash
# ✅ Good
.env (add to .gitignore)

# ❌ Bad
Hardcoding EMAIL_PASSWORD in code
Committing .env to Git
```

### 2. Use App Passwords
```
✅ Gmail App Password (16 chars)
❌ Regular Gmail password
```

### 3. Verify Email Authenticity
Add SPF, DKIM, DMARC records for custom domain:
```
SPF: v=spf1 include:sendgrid.net ~all
DKIM: Custom signing
DMARC: Policy enforcement
```

### 4. Email Validation
Before sending, validate:
```typescript
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
```

### 5. Rate Limiting
Gmail limits: 500 emails/day
Implement rate limiting:
```typescript
const emailCount = await db.count({ where: { createdAt: today } })
if (emailCount > 400) {
  // Warn admin
}
```

---

## Monitoring & Alerts

### Check Email Delivery

```bash
# Check if emails were sent successfully
grep "✅ Email sent successfully" server.log

# Count failed emails
grep "❌ Email sending failed" server.log | wc -l
```

### Log Retention

Store in database:

```prisma
model EmailLog {
  id        Int     @id @default(autoincrement())
  to        String
  subject   String
  status    String  // "sent" | "failed"
  messageId String?
  error     String?
  createdAt DateTime @default(now())
}
```

### Dashboard

Create `/admin/email-logs` page to monitor:
- Emails sent today
- Failed emails
- Delivery errors
- Rate limit status

---

## Performance

### Email Sending Time
- Average: 2-5 seconds
- Maximum: 30 seconds (timeout)

### Optimization

Send emails asynchronously:
```typescript
// Don't await - send in background
sendWelcomeEmail(...).catch(err => {
  console.error("Email failed:", err)
})

// Return response immediately
return NextResponse.json({ success: true })
```

### Batch Sending

For bulk operations:
```typescript
const users = await db.user.findMany()
const results = await Promise.allSettled(
  users.map(u => sendWelcomeEmail(...))
)
```

---

## Files Summary

| File | Purpose | Function Count |
|------|---------|-----------------|
| `lib/email.ts` | Email service | 6 functions |
| `scripts/test-email.js` | Testing script | Test utility |
| `app/api/admin/create-parent/route.ts` | Parent creation | Uses sendWelcomeEmail |
| `app/api/admin/create-student/route.ts` | Student creation | Uses sendWelcomeEmail |
| `app/api/auth/forgot-password/route.ts` | Password reset | Uses sendPasswordResetEmail |
| `app/api/auth/reset-password/route.ts` | Password change | Uses sendPasswordResetConfirmation |
| `app/api/auth/change-password/route.ts` | Password change | Uses sendPasswordChangeEmail |

---

**Technical Reference Complete**

Last Updated: 2024
System: Advent Hope Academy Management System - Email Service v1.0
