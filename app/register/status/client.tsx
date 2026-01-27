"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, CheckCircle, AlertCircle, Clock, XCircle, Loader } from "lucide-react"

interface RegistrationStatus {
  email: string
  status: "PENDING" | "ACTIVE" | "REJECTED"
  name: string
  role: "PARENT" | "STUDENT"
  rejectionReason?: string
  createdAt: string
}

export default function StatusCheckClient() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<RegistrationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError("")
    setStatus(null)

    try {
      const response = await fetch("/api/register/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus(data)
      } else {
        setError(data.error || "No registration found for this email")
      }
    } catch (err) {
      setError("Failed to check status. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Search className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Check Application Status</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Enter your email address to check your registration status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Checking Status...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Check Status
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Not Found</h3>
                <p className="text-red-800">{error}</p>
                <p className="text-red-700 text-sm mt-2">
                  If you believe this is an error, please{" "}
                  <a href="mailto:admissions@adventhope.ac.zw" className="font-semibold underline">
                    contact admissions
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Results */}
        {status && (
          <div className="space-y-6">
            {/* Status Card */}
            {status.status === "PENDING" && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-8 h-8 text-amber-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900 mb-2">
                      ⏳ Application Under Review
                    </h3>
                    <p className="text-amber-800 mb-3">
                      Your registration is pending approval from the admissions team. We review applications
                      within 24-48 hours and will notify you via email once a decision has been made.
                    </p>
                    <div className="bg-white rounded p-3 mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Submitted:</strong> {new Date(status.createdAt).toLocaleDateString()} at{" "}
                        {new Date(status.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status.status === "ACTIVE" && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">
                      🎉 Congratulations! Your Account is Approved
                    </h3>
                    <p className="text-emerald-800 mb-4">
                      Your registration has been approved and your account is now active. You can log in with the
                      credentials sent to your email.
                    </p>
                    <Link
                      href="/portal/login"
                      className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                    >
                      Go to Login
                    </Link>
                    <div className="bg-white rounded p-3 mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Approved:</strong> {new Date(status.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status.status === "REJECTED" && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-900 mb-2">
                      Registration Not Approved
                    </h3>
                    <p className="text-red-800 mb-3">
                      Unfortunately, your application was not approved at this time.
                    </p>
                    {status.rejectionReason && (
                      <div className="bg-white border border-red-200 rounded p-3 mb-3">
                        <p className="text-sm font-semibold text-red-900">Reason:</p>
                        <p className="text-red-800">{status.rejectionReason}</p>
                      </div>
                    )}
                    <p className="text-red-800">
                      Please contact{" "}
                      <a href="mailto:admissions@adventhope.ac.zw" className="font-semibold underline">
                        admissions@adventhope.ac.zw
                      </a>{" "}
                      for more information or to discuss your options.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Applicant Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium text-gray-900">{status.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-lg font-medium text-gray-900">
                    {status.role === "PARENT" ? "👨‍👩‍👧 Parent" : "👨‍🎓 Student"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-medium text-gray-900">{status.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <span className="inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {status.status === "PENDING" && "⏳ Pending"}
                    {status.status === "ACTIVE" && "✅ Approved"}
                    {status.status === "REJECTED" && "❌ Rejected"}
                  </span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800 mb-3">
                If you have questions about your application, please reach out to our admissions team:
              </p>
              <div className="space-y-1">
                <p className="text-blue-800">
                  📧 <a href="mailto:admissions@adventhope.ac.zw" className="font-semibold underline">admissions@adventhope.ac.zw</a>
                </p>
                <p className="text-blue-800">
                  📞 +263 242 737 999
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Initial State - Tips */}
        {!status && !error && (
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Enter Your Email</p>
                  <p className="text-gray-600">
                    Use the same email address you used when registering
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Get Instant Status</p>
                  <p className="text-gray-600">
                    See if your application is pending, approved, or rejected
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Take Next Steps</p>
                  <p className="text-gray-600">
                    If approved, log in. If rejected, contact admissions for details
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
