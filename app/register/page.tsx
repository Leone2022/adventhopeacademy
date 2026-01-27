"use client"

import Link from "next/link"
import { UserPlus, GraduationCap, ArrowRight, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Advent Hope Academy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your registration type to get started. All registrations require admin approval.
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Parent Registration */}
          <Link 
            href="/register/parent"
            className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex flex-col h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Register as Parent
              </h2>
              
              <p className="text-gray-600 mb-6 flex-grow">
                Create a parent account to manage your children's education, view progress, make payments, and communicate with teachers.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Manage multiple children from one account</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Track academic progress and attendance</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Make fee payments online</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Receive important notifications</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm font-semibold text-blue-600">Get Started</span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Student Registration */}
          <Link 
            href="/register/student"
            className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex flex-col h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                Apply as Student
              </h2>
              
              <p className="text-gray-600 mb-6 flex-grow">
                Submit your student application to join Advent Hope Academy. Complete the application form with your academic and personal information.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Simple 3-step application process</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Submit academic records and information</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Track your application status</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Receive email confirmation</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm font-semibold text-emerald-600">Start Application</span>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Quick Process</h3>
            <p className="text-sm text-gray-600">
              Simple forms that take just 5-10 minutes to complete
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Admin Review</h3>
            <p className="text-sm text-gray-600">
              Your application will be reviewed within 24-48 hours
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Email Updates</h3>
            <p className="text-sm text-gray-600">
              Get instant notifications about your application status
            </p>
          </div>
        </div>

        {/* Already Registered */}
        <div className="text-center bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <p className="text-gray-700 mb-4">
            Already submitted your registration?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register/status"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
            >
              Check Application Status
            </Link>
            <Link
              href="/portal/login"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
