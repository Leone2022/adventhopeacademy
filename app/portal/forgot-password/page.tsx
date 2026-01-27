"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  Hash
} from "lucide-react"

type RecoveryMethod = "email" | "phone" | "studentNumber"

export default function ForgotPasswordPage() {
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("email")
  const [identifier, setIdentifier] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!identifier) {
      setError("Please enter your " + getFieldLabel())
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          recoveryMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send reset instructions")
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const getFieldLabel = () => {
    switch (recoveryMethod) {
      case "email":
        return "email address"
      case "phone":
        return "phone number"
      case "studentNumber":
        return "student registration number"
    }
  }

  const getPlaceholder = () => {
    switch (recoveryMethod) {
      case "email":
        return "you@example.com"
      case "phone":
        return "+263 XXX XXX XXX"
      case "studentNumber":
        return "STU2024001"
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Check Your {recoveryMethod === "email" ? "Email" : "Phone"}
            </h2>

            <p className="text-slate-600 mb-6">
              If an account exists with that {getFieldLabel()}, we've sent password reset instructions to{" "}
              <span className="font-semibold">{identifier}</span>.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1 text-left">
                <li>1. Check your {recoveryMethod === "email" ? "email inbox" : "phone messages"}</li>
                <li>2. Click the reset link (valid for 1 hour)</li>
                <li>3. Create a new password</li>
              </ol>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              Didn't receive it? Check your spam folder or try again in a few minutes.
            </p>

            <Link
              href="/portal/login"
              className="inline-flex items-center gap-2 text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (40%) */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#10b981]"></div>

        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 py-16">
          <div className="mb-8">
            <div className="w-[150px] h-[150px] bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Advent Hope Academy"
                  width={120}
                  height={120}
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
                <div className="hidden absolute inset-0 items-center justify-center">
                  <span className="text-6xl font-bold text-white tracking-tight">AH</span>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-3 tracking-tight">
            Advent Hope Academy
          </h1>

          <p className="text-lg text-blue-100/80 text-center mb-12 font-medium">
            Password Recovery
          </p>

          <div className="w-full max-w-sm text-center text-white/90 space-y-4">
            <p className="text-sm">
              Enter your credentials to receive password reset instructions.
            </p>
            <p className="text-xs text-blue-100/70">
              Your account security is our priority. Reset links expire after 1 hour.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (60%) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#3b82f6] to-[#10b981] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white">AH</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Password Recovery</h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Forgot Password?
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">
                No worries, we'll send you reset instructions
              </p>
            </div>

            {/* Recovery Method Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Recovery Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryMethod("email")
                    setIdentifier("")
                    setError("")
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    recoveryMethod === "email"
                      ? "border-[#3b82f6] bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <Mail className={`w-5 h-5 mx-auto mb-1 ${
                    recoveryMethod === "email" ? "text-[#3b82f6]" : "text-slate-400"
                  }`} />
                  <span className={`text-xs font-medium ${
                    recoveryMethod === "email" ? "text-[#3b82f6]" : "text-slate-600"
                  }`}>
                    Email
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRecoveryMethod("phone")
                    setIdentifier("")
                    setError("")
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    recoveryMethod === "phone"
                      ? "border-[#3b82f6] bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <Phone className={`w-5 h-5 mx-auto mb-1 ${
                    recoveryMethod === "phone" ? "text-[#3b82f6]" : "text-slate-400"
                  }`} />
                  <span className={`text-xs font-medium ${
                    recoveryMethod === "phone" ? "text-[#3b82f6]" : "text-slate-600"
                  }`}>
                    Phone
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRecoveryMethod("studentNumber")
                    setIdentifier("")
                    setError("")
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    recoveryMethod === "studentNumber"
                      ? "border-[#3b82f6] bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <Hash className={`w-5 h-5 mx-auto mb-1 ${
                    recoveryMethod === "studentNumber" ? "text-[#3b82f6]" : "text-slate-400"
                  }`} />
                  <span className={`text-xs font-medium ${
                    recoveryMethod === "studentNumber" ? "text-[#3b82f6]" : "text-slate-600"
                  }`}>
                    Student #
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identifier Field */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                  {getFieldLabel()}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {recoveryMethod === "email" && <Mail className="h-5 w-5 text-slate-400" />}
                    {recoveryMethod === "phone" && <Phone className="h-5 w-5 text-slate-400" />}
                    {recoveryMethod === "studentNumber" && <Hash className="h-5 w-5 text-slate-400" />}
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-200 bg-white"
                    placeholder={getPlaceholder()}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Remember your password?</span>
              </div>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-2 text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Need help? Contact administration at{" "}
              <a href="tel:+263773102003" className="text-[#3b82f6] hover:underline">
                +263 773 102 003
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
