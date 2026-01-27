/**
 * Email service for authentication system
 * 
 * Uses Gmail SMTP for sending emails
 * For production, can be switched to SendGrid or AWS SES
 */

import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Create SMTP transporter for Gmail
 */
const createTransporter = () => {
  // Check if Gmail credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("⚠️ Gmail credentials not configured. Using console logging.")
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

/**
 * Base email sender - Uses Gmail SMTP
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter()

    if (!transporter) {
      // Fallback to console logging if credentials not configured
      console.log("📧 EMAIL (Console Fallback):")
      console.log("To:", options.to)
      console.log("Subject:", options.subject)
      console.log("Body:", options.text || options.html)
      console.log("---")
      return true
    }

    // Send email via Gmail SMTP
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log("✅ Email sent successfully:", info.messageId)
    return true
  } catch (error) {
    console.error("❌ Email sending failed:", error)
    return false
  }
}

/**
 * Send welcome email with initial credentials
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: "PARENT" | "STUDENT",
  credentials: {
    username: string
    password: string
    loginUrl: string
  }
): Promise<boolean> {
  const subject = `Welcome to Advent Hope Academy - Your ${role === "PARENT" ? "Parent" : "Student"} Portal Access`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af; }
        .credential-row { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #1e40af; }
        .credential-value { font-family: monospace; background: #e5e7eb; padding: 8px 12px; border-radius: 4px; display: inline-block; }
        .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Advent Hope Academy</h1>
          <p>${role === "PARENT" ? "Parent Portal" : "Student Portal"}</p>
        </div>
        <div class="content">
          <p>Dear ${name},</p>

          <p>Your ${role === "PARENT" ? "parent" : "student"} account has been created successfully. You can now access the portal to view academic information, financial statements, and more.</p>

          <div class="credentials">
            <h3 style="margin-top: 0;">Your Login Credentials</h3>
            <div class="credential-row">
              <span class="credential-label">Username:</span><br/>
              <span class="credential-value">${credentials.username}</span>
            </div>
            <div class="credential-row">
              <span class="credential-label">Temporary Password:</span><br/>
              <span class="credential-value">${credentials.password}</span>
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong><br/>
            For your security, you will be required to change this password on your first login. Please keep your credentials confidential and do not share them with anyone.
          </div>

          <div style="text-align: center;">
            <a href="${credentials.loginUrl}" class="button">Login to Portal</a>
          </div>

          <h3>What You Can Do:</h3>
          <ul>
            ${role === "PARENT" ? `
              <li>View your children's academic results</li>
              <li>Check attendance records</li>
              <li>View financial statements and make payments</li>
              <li>Communicate with teachers</li>
              <li>Access student biodata</li>
            ` : `
              <li>View your academic results and report cards</li>
              <li>Check your class timetable</li>
              <li>View attendance records</li>
              <li>Access financial information</li>
              <li>View your personal biodata</li>
            `}
          </ul>

          <p>If you have any questions or need assistance, please contact the school administration.</p>

          <p>Best regards,<br/>
          <strong>Advent Hope Academy</strong><br/>
          Administration Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>Advent Hope Academy | Excellence in Christian Education</p>
          <p>Phone: +263 773 102 003 | Email: info@adventhope.ac.zw</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Welcome to Advent Hope Academy ${role === "PARENT" ? "Parent Portal" : "Student Portal"}

Dear ${name},

Your ${role === "PARENT" ? "parent" : "student"} account has been created successfully.

Login Credentials:
Username: ${credentials.username}
Temporary Password: ${credentials.password}

IMPORTANT: You will be required to change this password on your first login.

Login at: ${credentials.loginUrl}

If you have any questions, please contact the school administration.

Best regards,
Advent Hope Academy Administration Team
  `

  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  const subject = "Reset Your Password - Advent Hope Academy"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>

          <p>We received a request to reset your password for your Advent Hope Academy portal account.</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-size: 12px;">${resetUrl}</p>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br/>
            This link will expire in 1 hour for security reasons. If you did not request this password reset, please ignore this email and your password will remain unchanged.
          </div>

          <p>If you have any concerns, please contact the school administration immediately.</p>

          <p>Best regards,<br/>
          <strong>Advent Hope Academy</strong><br/>
          Administration Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>Advent Hope Academy | Excellence in Christian Education</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Password Reset Request

Dear ${name},

We received a request to reset your password for your Advent Hope Academy portal account.

Reset your password here: ${resetUrl}

This link will expire in 1 hour. If you did not request this password reset, please ignore this email.

Best regards,
Advent Hope Academy Administration Team
  `

  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send password changed confirmation
 */
export async function sendPasswordChangedEmail(
  email: string,
  name: string
): Promise<boolean> {
  const subject = "Your Password Has Been Changed - Advent Hope Academy"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Password Changed Successfully</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>

          <p>This is to confirm that your password was successfully changed on ${new Date().toLocaleString()}.</p>

          <div class="warning">
            <strong>⚠️ Didn't change your password?</strong><br/>
            If you did not make this change, please contact the school administration immediately at info@adventhope.ac.zw or +263 773 102 003.
          </div>

          <p>Best regards,<br/>
          <strong>Advent Hope Academy</strong><br/>
          Administration Team</p>
        </div>
        <div class="footer">
          <p>This is an automated security notification.</p>
          <p>Advent Hope Academy | Excellence in Christian Education</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Password Changed Successfully

Dear ${name},

This is to confirm that your password was successfully changed on ${new Date().toLocaleString()}.

If you did not make this change, please contact the school administration immediately.

Best regards,
Advent Hope Academy Administration Team
  `

  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send account locked notification
 */
export async function sendAccountLockedEmail(
  email: string,
  name: string,
  unlockTime: number
): Promise<boolean> {
  const subject = "Account Temporarily Locked - Advent Hope Academy"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Account Temporarily Locked</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>

          <p>Your account has been temporarily locked due to multiple failed login attempts.</p>

          <div class="warning">
            <strong>Your account will automatically unlock in ${unlockTime} minutes.</strong><br/>
            This is a security measure to protect your account from unauthorized access.
          </div>

          <p>If you forgot your password, you can use the "Forgot Password" link on the login page to reset it.</p>

          <p>If you did not attempt to log in, please contact the school administration immediately.</p>

          <p>Best regards,<br/>
          <strong>Advent Hope Academy</strong><br/>
          Administration Team</p>
        </div>
        <div class="footer">
          <p>This is an automated security notification.</p>
          <p>Advent Hope Academy | Excellence in Christian Education</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Account Temporarily Locked

Dear ${name},

Your account has been temporarily locked due to multiple failed login attempts.

Your account will automatically unlock in ${unlockTime} minutes.

If you forgot your password, use the "Forgot Password" link to reset it.

Best regards,
Advent Hope Academy Administration Team
  `

  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send registration confirmation email (pending approval)
 */
export async function sendRegistrationConfirmation(
  email: string,
  name: string,
  role: "PARENT" | "STUDENT",
  customMessage?: string
): Promise<boolean> {
  const subject = `Registration Received - Advent Hope Academy`
  const html = `<!DOCTYPE html><html><body style="font-family: Arial;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 30px; text-align: center;">
        <h1> Registration Received!</h1>
      </div>
      <div style="padding: 30px; background: #f8f9fa;">
        <p>Dear ${name},</p>
        <p>${customMessage || `Thank you for ${role === "PARENT" ? "registering as a parent" : "applying as a student"} at Advent Hope Academy.`}</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="background: #fbbf24; color: #92400e; padding: 8px 16px; border-radius: 20px; font-weight: bold;"> PENDING ADMIN APPROVAL</span>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #3b82f6;">What Happens Next?</h3>
          <ul>
            <li>Our admin team will review your ${role === "STUDENT" ? "application" : "registration"}</li>
            <li>Decision typically within 24-48 hours</li>
            <li>Once approved, you'll receive login credentials</li>
          </ul>
        </div>
      </div>
    </div>
  </body></html>`
  const text = `Dear ${name}, Thank you for ${role === "PARENT" ? "registering" : "applying"}. Status: PENDING APPROVAL. Best regards, Advent Hope Academy`
  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send approval email with secure password reset link
 */
export async function sendApprovalEmailWithResetLink(
  email: string,
  name: string,
  role: "PARENT" | "STUDENT",
  resetUrl: string,
  info?: { studentNumber?: string; applicationNumber?: string }
): Promise<boolean> {
  const subject = `🎉 Account Approved - Set Your Password | Advent Hope Academy`
  const html = `<!DOCTYPE html><html><body style="font-family: Arial;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center;">
        <h1>🎉 Congratulations!</h1>
        <p style="font-size: 18px; margin: 0;">Your Account Has Been Approved</p>
      </div>
      <div style="padding: 30px; background: #f8f9fa;">
        <p>Dear ${name},</p>
        <p>Great news! Your ${role === "PARENT" ? "parent account" : "student application"} has been <strong>approved</strong>!</p>
        ${role === "PARENT" && info?.applicationNumber ? `<div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;"><p style="margin: 0;"><strong>Application Number:</strong> ${info.applicationNumber}</p></div>` : ""}
        ${role === "STUDENT" && info?.studentNumber ? `<div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;"><p style="margin: 0;"><strong>Student Number:</strong> ${info.studentNumber}</p></div>` : ""}
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
          <h3 style="color: #10b981; margin-top: 0;">Next Step: Set Your Password</h3>
          <p style="margin-bottom: 20px;">Click the button below to create your secure password and access your account:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Set My Password</a>
          </div>
        </div>
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>⚠️ Important:</strong> This link is valid for 24 hours and can only be used once.</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <p style="font-size: 14px; color: #666; margin: 0;">If the button doesn't work, copy and paste this link:</p>
          <p style="background: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #333; margin-top: 10px;">${resetUrl}</p>
        </div>
        <p style="margin-top: 30px;">Welcome to Advent Hope Academy!</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please contact us immediately.</p>
      </div>
    </div>
  </body></html>`
  const text = `Dear ${name}, CONGRATULATIONS! Your ${role === "PARENT" ? "parent account" : "student application"} has been approved. ${role === "STUDENT" && info?.studentNumber ? `Student Number: ${info.studentNumber}` : ""} ${role === "PARENT" && info?.applicationNumber ? `Application: ${info.applicationNumber}` : ""} Set your password: ${resetUrl} (Valid for 24 hours)`
  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send approval email with credentials (legacy - kept for admin-created accounts)
 */
export async function sendApprovalEmail(
  email: string,
  name: string,
  role: "PARENT" | "STUDENT",
  credentials: { username: string; password: string; studentNumber?: string }
): Promise<boolean> {
  const subject = ` Account Approved - Welcome to Advent Hope Academy!`
  const html = `<!DOCTYPE html><html><body style="font-family: Arial;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center;">
        <h1> Congratulations!</h1>
        <p>Your Account Has Been Approved</p>
      </div>
      <div style="padding: 30px; background: #f8f9fa;">
        <p>Dear ${name},</p>
        <p>Your ${role === "PARENT" ? "parent account" : "student application"} has been <strong>approved</strong>!</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <h3 style="color: #10b981;">Your Login Credentials</h3>
          <p><strong>Login URL:</strong> ${process.env.NEXTAUTH_URL}/portal/login</p>
          ${role === "STUDENT" ? `<p><strong>Student Number:</strong> ${credentials.studentNumber}</p>` : `<p><strong>Email:</strong> ${credentials.username}</p>`}
          <p><strong>Password:</strong> ${credentials.password}</p>
        </div>
        <div style="text-align: center; margin: 20px;">
          <a href="${process.env.NEXTAUTH_URL}/portal/login" style="background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px;">Login Now</a>
        </div>
      </div>
    </div>
  </body></html>`
  const text = `Dear ${name}, CONGRATULATIONS! Your account has been approved. Login: ${process.env.NEXTAUTH_URL}/portal/login, ${role === "STUDENT" ? `Student Number: ${credentials.studentNumber}` : `Email: ${credentials.username}`}, Password: ${credentials.password}`
  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send rejection email
 */
export async function sendRejectionEmail(
  email: string,
  name: string,
  role: "PARENT" | "STUDENT",
  reason?: string
): Promise<boolean> {
  const subject = `Application Status Update - Advent Hope Academy`
  const html = `<!DOCTYPE html><html><body style="font-family: Arial;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6b7280, #9ca3af); color: white; padding: 30px; text-align: center;">
        <h1>Application Status Update</h1>
      </div>
      <div style="padding: 30px; background: #f8f9fa;">
        <p>Dear ${name},</p>
        <p>Thank you for your interest in Advent Hope Academy.</p>
        <p>After careful review, we are unable to proceed with your ${role === "PARENT" ? "registration" : "application"} at this time.</p>
        ${reason ? `<div style="background: white; padding: 20px; border-radius: 8px;"><h3>Reason</h3><p>${reason}</p></div>` : ""}
        <p>You are welcome to contact our admissions office or reapply in the future.</p>
        <p><strong>Contact:</strong> admissions@adventhope.ac.zw</p>
      </div>
    </div>
  </body></html>`
  const text = `Dear ${name}, After review, we are unable to proceed with your ${role === "PARENT" ? "registration" : "application"}. ${reason || ""} Contact: admissions@adventhope.ac.zw`
  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send email verification link
 */
export async function sendEmailVerification(
  email: string,
  name: string,
  verificationUrl: string
): Promise<boolean> {
  const subject = `Verify Your Email - Advent Hope Academy`
  const html = `<!DOCTYPE html><html><body style="font-family: Arial;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 30px; text-align: center;">
        <h1>Verify Your Email</h1>
      </div>
      <div style="padding: 30px; background: #f8f9fa;">
        <p>Hello ${name},</p>
        <p>Welcome to Advent Hope Academy! To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>Or copy this link into your browser:</p>
        <p style="background: white; padding: 15px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #666;">
          ${verificationUrl}
        </p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
      </div>
    </div>
  </body></html>`
  const text = `Hello ${name}, Verify your email: ${verificationUrl} This link expires in 24 hours.`
  return sendEmail({ to: email, subject, html, text })
}
