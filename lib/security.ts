import crypto from "crypto"
import bcrypt from "bcryptjs"

/**
 * Security utilities for authentication system
 */

// Password validation rules
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`)
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (PASSWORD_RULES.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate secure random password
 * Used when admin creates accounts
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const special = "!@#$%^&*"

  const allChars = uppercase + lowercase + numbers + special

  let password = ""

  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]

  // Fill rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

/**
 * Generate password reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Generate verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Hash token for storage (prevents token theft from DB)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

/**
 * Generate OTP (6 digits)
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Check if account is locked due to failed login attempts
 */
export function isAccountLocked(
  failedAttempts: number,
  lastFailedAt: Date | null,
  maxAttempts: number = 5,
  lockoutDuration: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  if (failedAttempts < maxAttempts) {
    return false
  }

  if (!lastFailedAt) {
    return false
  }

  const lockoutEnd = new Date(lastFailedAt.getTime() + lockoutDuration)
  return new Date() < lockoutEnd
}

/**
 * Calculate remaining lockout time in minutes
 */
export function getRemainingLockoutTime(
  lastFailedAt: Date,
  lockoutDuration: number = 15 * 60 * 1000
): number {
  const lockoutEnd = new Date(lastFailedAt.getTime() + lockoutDuration)
  const now = new Date()

  if (now >= lockoutEnd) {
    return 0
  }

  return Math.ceil((lockoutEnd.getTime() - now.getTime()) / 60000)
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Mask email for display (e.g., j***@example.com)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@")
  if (!domain) return email

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`
  }

  return `${localPart[0]}${"*".repeat(localPart.length - 1)}@${domain}`
}

/**
 * Mask phone number (e.g., +263 *** *** 003)
 */
export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone

  const last3 = phone.slice(-3)
  const first = phone.slice(0, 4)
  const masked = "*".repeat(phone.length - 7)

  return `${first} ${masked} ${last3}`
}
