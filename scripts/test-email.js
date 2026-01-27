#!/usr/bin/env node

/**
 * Test Email Service
 * Run this script to verify Gmail SMTP is working
 * 
 * Usage: node scripts/test-email.js
 */

require('dotenv').config()
const nodemailer = require('nodemailer')

async function testEmail() {
  console.log('\n🧪 Testing Email Configuration...\n')

  // Check environment variables
  if (!process.env.EMAIL_USER) {
    console.error('❌ EMAIL_USER not found in .env')
    console.log('   Add this to .env: EMAIL_USER=your-email@gmail.com\n')
    process.exit(1)
  }

  if (!process.env.EMAIL_PASSWORD) {
    console.error('❌ EMAIL_PASSWORD not found in .env')
    console.log('   Add this to .env: EMAIL_PASSWORD=your-16-char-app-password\n')
    process.exit(1)
  }

  console.log('✅ Environment variables found:')
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`)
  console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD.substring(0, 4)}${'*'.repeat(process.env.EMAIL_PASSWORD.length - 4)}`)
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || '(using EMAIL_USER)'}`)

  // Create transporter
  console.log('\n🔌 Creating SMTP Transporter...')
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  // Verify connection
  console.log('📧 Verifying SMTP Connection...')
  try {
    await transporter.verify()
    console.log('✅ SMTP Connection Verified!')
  } catch (error) {
    console.error('❌ SMTP Connection Failed:')
    console.error(error.message)
    console.log('\n📝 Common Issues:')
    console.log('   1. Using regular Gmail password (use 16-char App Password instead)')
    console.log('   2. 2-Step Verification not enabled on Gmail account')
    console.log('   3. Email/password incorrect in .env file')
    console.log('   4. Firewall/VPN blocking Gmail SMTP (port 587)')
    process.exit(1)
  }

  // Send test email
  console.log('\n📨 Sending Test Email to:', process.env.EMAIL_USER)
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: '🧪 Test Email - Advent Hope Academy SMTP Configuration',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { background: #f8f9fa; padding: 30px; margin-top: 20px; border-radius: 8px; }
            .success { color: #10b981; font-weight: bold; }
            .timestamp { color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ SMTP Test Successful!</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>This is a test email from your <strong>Advent Hope Academy</strong> system.</p>
              
              <h3 style="color: #1e40af;">Configuration Status:</h3>
              <ul style="background: white; padding: 15px; border-radius: 6px;">
                <li><span class="success">✓</span> Gmail SMTP: Connected</li>
                <li><span class="success">✓</span> Email authentication: Working</li>
                <li><span class="success">✓</span> Email templates: Ready</li>
              </ul>

              <p style="margin-top: 20px;">Your email system is now operational!</p>
              
              <h3 style="color: #1e40af;">What's Working:</h3>
              <ul>
                <li>Welcome emails for new accounts</li>
                <li>Password reset emails</li>
                <li>Account locked notifications</li>
                <li>Password change confirmations</li>
              </ul>

              <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <strong>Next Steps:</strong>
              </p>
              <ol>
                <li>Admin creates a parent/student account at <code>/admin/create-accounts</code></li>
                <li>Check this email for the welcome message</li>
                <li>Test password reset at <code>/portal/forgot-password</code></li>
                <li>All systems operational!</li>
              </ol>

              <p class="timestamp">
                Sent at: ${new Date().toLocaleString()}<br>
                System: Advent Hope Academy Management System
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Test email from Advent Hope Academy. Your SMTP configuration is working correctly!',
    })

    console.log('✅ Email sent successfully!')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`\n📬 Check your inbox at: ${process.env.EMAIL_USER}`)
    console.log('   (May take a few seconds to arrive)')
    console.log('\n✨ Your email system is ready to use!\n')
  } catch (error) {
    console.error('❌ Failed to send email:')
    console.error(error.message)
    process.exit(1)
  }
}

testEmail().catch((error) => {
  console.error('💥 Unexpected error:')
  console.error(error)
  process.exit(1)
})
