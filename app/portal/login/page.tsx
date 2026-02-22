"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
  GraduationCap,
  Users,
  Phone,
  Hash
} from "lucide-react"

type LoginRole = "parent" | "student"

export default function PortalLoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<LoginRole>("parent")
  const [identifier, setIdentifier] = useState("") // Email/Phone or Student Number
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Basic validation
    if (!identifier || !password) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        role,
        redirect: false,
      })

      if (result?.error) {
        // Parse error message
        if (result.error === "pending_approval") {
          setError("Your account is still pending admin approval. Please contact the school.")
        } else if (result.error === "no_linked_student") {
          setError("Your parent account is approved, but no active student is linked yet. Please contact the school office for linking.")
        } else if (result.error === "inactive_account") {
          setError("Your account is inactive. Please contact the school.")
        } else if (result.error === "invalid_credentials") {
          setError("Invalid credentials. Please check and try again.")
        } else if (result.error.startsWith("account_locked:")) {
          const minutes = result.error.split(":")[1]
          setError(`Your account has been temporarily locked due to multiple failed login attempts. Please try again in ${minutes} minutes or use 'Forgot Password' to reset your password.`)
        } else {
          setError("Login failed. Please check your credentials and try again.")
        }
        setLoading(false)
      } else {
        // Success - redirect based on role
        if (role === "parent") {
          router.push("/parent/dashboard")
        } else {
          router.push("/student/dashboard")
        }
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (40%) */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600"></div>

        {/* Subtle Pattern Overlay */}
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

        {/* Decorative Circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 py-16">
          {/* Logo */}
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

          {/* School Name */}
          <h1 className="text-3xl font-bold text-white text-center mb-3 tracking-tight">
            Advent Hope Academy
          </h1>

          {/* Tagline */}
          <p className="text-lg text-blue-100/80 text-center mb-12 font-medium">
            Student & Parent Portal
          </p>

          {/* Feature Cards */}
          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all hover:bg-white/15">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Academic Results</h3>
                <p className="text-blue-100/70 text-sm">View grades and report cards</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all hover:bg-white/15">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Student Information</h3>
                <p className="text-blue-100/70 text-sm">Access biodata and records</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all hover:bg-white/15">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Financial Statements</h3>
                <p className="text-blue-100/70 text-sm">View fees and payments</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 text-center">
            <p className="text-blue-100/50 text-sm">
              Secure Student & Parent Access
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form (60%) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white">AH</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Advent Hope Academy</h1>
            <p className="text-slate-500 text-sm mt-1">Student & Parent Portal</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Student / Parent Login
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">
                Select your role and enter your credentials
              </p>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Login As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRole("parent")
                    setIdentifier("")
                    setError("")
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    role === "parent"
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <Users className={`w-6 h-6 mx-auto mb-2 ${
                    role === "parent" ? "text-emerald-600" : "text-slate-400"
                  }`} />
                  <span className={`text-sm font-semibold ${
                    role === "parent" ? "text-emerald-600" : "text-slate-600"
                  }`}>
                    Parent
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole("student")
                    setIdentifier("")
                    setError("")
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    role === "student"
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <GraduationCap className={`w-6 h-6 mx-auto mb-2 ${
                    role === "student" ? "text-blue-600" : "text-slate-400"
                  }`} />
                  <span className={`text-sm font-semibold ${
                    role === "student" ? "text-blue-600" : "text-slate-600"
                  }`}>
                    Student
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
              {/* Identifier Field (Email/Phone or Student Number) */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-2">
                  {role === "parent" ? "Email or Phone Number" : "Student Registration Number"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {role === "parent" ? (
                      <Mail className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Hash className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all duration-200 bg-white"
                    placeholder={
                      role === "parent"
                        ? "parent@example.com or +263..."
                        : "STU2024001"
                    }
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <Link
                  href="/register"
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  📝 Create Account
                </Link>
                <Link
                  href={{
                    pathname: "/portal/forgot-password",
                    query: {
                      ...(identifier ? { identifier } : {}),
                      method: role === "student" ? "studentNumber" : "email",
                    },
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Need help?</span>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-3">
                {role === "parent" ? (
                  <>
                    New parent? <Link href="/register/parent" className="text-orange-600 hover:text-orange-700 font-semibold underline">Register here</Link> to create your account and await admin approval.
                  </>
                ) : (
                  <>
                    New student? <Link href="/register/student" className="text-orange-600 hover:text-orange-700 font-semibold underline">Apply here</Link> to submit your admission application.
                  </>
                )}
              </p>
              <p className="text-slate-500 text-xs">
                Your account will be activated once approved by school administration.
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Admin Link */}
          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Admin Login
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-xs">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
