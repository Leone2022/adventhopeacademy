"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, RefreshCw, Settings } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorDetails: Record<string, { title: string; message: string; suggestion: string }> = {
    Configuration: {
      title: "Configuration Error",
      message: "There is a problem with the server configuration.",
      suggestion: "Please ensure the NEXTAUTH_SECRET and NEXTAUTH_URL environment variables are properly set in your .env file.",
    },
    AccessDenied: {
      title: "Access Denied",
      message: "You do not have permission to sign in.",
      suggestion: "Please contact the administrator if you believe this is an error.",
    },
    Verification: {
      title: "Verification Failed",
      message: "The verification token has expired or has already been used.",
      suggestion: "Please request a new verification link.",
    },
    CredentialsSignin: {
      title: "Sign In Failed",
      message: "Invalid email or password.",
      suggestion: "Please check your credentials and try again.",
    },
    Default: {
      title: "Authentication Error",
      message: "An unexpected error occurred during authentication.",
      suggestion: "Please try again or contact support if the problem persists.",
    },
  }

  const errorInfo = errorDetails[error || "Default"] || errorDetails.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{errorInfo.title}</h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-4">{errorInfo.message}</p>

          {/* Error Code */}
          {error && (
            <div className="bg-gray-50 rounded-lg px-4 py-2 mb-6 inline-block">
              <code className="text-sm text-gray-500">Error: {error}</code>
            </div>
          )}

          {/* Suggestion */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Suggestion</p>
                <p className="text-sm text-amber-700 mt-1">{errorInfo.suggestion}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Link>
            
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-xs text-gray-400">
            If the problem persists, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

