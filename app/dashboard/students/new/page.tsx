'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import StudentApplicationForm from '@/components/StudentApplicationForm'

export default function NewStudentPage() {
  const [success, setSuccess] = useState<{ studentNumber: string } | null>(null)

  const handleSuccess = (result: { applicationNumber?: string; studentNumber?: string }) => {
    if (result.studentNumber) {
      setSuccess({ studentNumber: result.studentNumber })
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Student Enrolled Successfully!</h2>
            <p className="text-slate-600 mb-6">
              The student has been added to the system and automatically approved for enrollment.
            </p>

            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-slate-800 mb-4">Student Registration Number</h3>
              <p className="text-2xl font-mono font-bold text-blue-600 mb-2">{success.studentNumber}</p>
              <p className="text-sm text-slate-600">
                Use this number for all future reference and communications
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard/students"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                View All Students
              </Link>
              <Link
                href="/dashboard/students/new"
                className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
              >
                Add Another Student
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/students"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Link>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Enroll New Student</h1>
          <p className="text-slate-600">
            Add a new student to the system. The student will be automatically approved for enrollment.
          </p>
        </div>

        {/* Info Alert */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            ℹ️ <strong>Note:</strong> Students added by admin are automatically approved and can be assigned to classes, hostel, and other placements immediately.
          </p>
        </div>

        {/* Form */}
        <StudentApplicationForm mode="admin" onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
