import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-ZW", {
    style: "currency",
    currency: "USD", // Change to ZWL if needed
  }).format(numAmount)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-ZW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj)
}

export function generateStudentNumber(schoolId: string, year: number): string {
  // Format: SCHOOL-YEAR-XXXX
  const prefix = schoolId.substring(0, 3).toUpperCase()
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${year}-${random}`
}

export function generateApplicationNumber(schoolId: string): string {
  const prefix = schoolId.substring(0, 3).toUpperCase()
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `APP-${prefix}-${year}-${random}`
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  return `RCP-${year}-${random}`
}

export function generateParentApplicationNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  return `PAR${year}${random}`
}

