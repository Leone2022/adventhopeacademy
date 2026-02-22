"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, ShieldCheck, FileCheck2, School } from "lucide-react"

export default function AddChildPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Child Linking Policy</h1>
          <p className="text-slate-600 mb-8">
            For privacy and safeguarding, student-to-parent linking is handled by school administration only.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 flex gap-3">
              <School className="h-5 w-5 text-blue-700 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Visit the school office</p>
                <p className="text-sm text-blue-800">Bring the student number and your identification documents.</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 flex gap-3">
              <FileCheck2 className="h-5 w-5 text-emerald-700 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-900">Provide proof of guardianship</p>
                <p className="text-sm text-emerald-800">Birth certificate, legal guardianship papers, or official school-approved documents.</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-purple-700 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">Secure admin verification</p>
                <p className="text-sm text-purple-800">A registrar or school admin will verify and link your child account securely.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700">
            Need help? Contact the school office on <a href="tel:+263773102003" className="font-semibold text-blue-700">+263 773 102 003</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
