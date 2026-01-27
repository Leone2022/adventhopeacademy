'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, CheckCircle, HelpCircle, Home } from 'lucide-react'
import StudentApplicationForm from '@/components/StudentApplicationForm'

export default function ApplyPage() {
  const router = useRouter()
  const [success, setSuccess] = useState<{ applicationNumber: string } | null>(null)

  const handleSuccess = (result: { applicationNumber?: string; studentNumber?: string }) => {
    if (result.applicationNumber) {
      setSuccess({ applicationNumber: result.applicationNumber })
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Application Submitted!</h1>
            <p className="text-slate-600 mb-6">
              Thank you for applying to Advent Hope Academy. Your application has been received and is being reviewed.
            </p>
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <p className="text-sm text-slate-500 mb-2">Your Application Number</p>
              <p className="text-2xl font-mono font-bold text-blue-600">{success.applicationNumber}</p>
              <p className="text-sm text-slate-500 mt-4">
                Please save this number. You will need it to check your application status.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600">
                A confirmation email has been sent to your registered email address
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Return Home
                </Link>
                <Link
                  href="/apply/status"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  Check Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Advent Hope Academy</h1>
                <p className="text-xs text-slate-500">Online Application</p>
              </div>
            </Link>
            <Link
              href="/apply/status"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Check Status
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <StudentApplicationForm mode="apply" onSuccess={handleSuccess} />
      </main>
    </div>
  )
}
