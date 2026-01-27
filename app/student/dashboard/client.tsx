"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import {
  User,
  FileText,
  DollarSign,
  LogOut,
  Menu,
  X,
  Home,
  Mail,
  Bell,
  ChevronRight,
  Calendar,
  BookOpen,
  CreditCard,
  GraduationCap,
  Award
} from "lucide-react"

interface Student {
  id: string
  firstName: string
  lastName: string
  studentNumber: string
  photo?: string | null
  email?: string | null
  phone?: string | null
  currentClass?: {
    name: string
    level: string
  } | null
  account?: {
    balance: number
  } | null
  school: {
    name: string
  }
}

interface StudentDashboardClientProps {
  student: Student
}

export default function StudentDashboardClient({
  student,
}: StudentDashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/portal/login" })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-slate-600" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-600" />
                )}
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Student Portal
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {student.school.name}
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{student.studentNumber}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto py-6">
            <nav className="px-4 space-y-2">
              <Link
                href="/student/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-[#3b82f6] bg-blue-50 rounded-lg font-medium"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/student/results"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <FileText className="w-5 h-5" />
                <span>My Results</span>
              </Link>

              <Link
                href="/student/timetable"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Calendar className="w-5 h-5" />
                <span>Timetable</span>
              </Link>

              <Link
                href="/student/attendance"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <BookOpen className="w-5 h-5" />
                <span>Attendance</span>
              </Link>

              <Link
                href="/student/finances"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <DollarSign className="w-5 h-5" />
                <span>Finances</span>
              </Link>

              <Link
                href="/student/messages"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Mail className="w-5 h-5" />
                <span>Messages</span>
              </Link>

              <Link
                href="/student/profile"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <User className="w-5 h-5" />
                <span>My Profile</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Welcome back, {student.firstName}!
              </h2>
              <p className="text-slate-600">
                Here&apos;s an overview of your academic progress.
              </p>
            </div>

            {/* Student Info Card */}
            <div className="bg-gradient-to-br from-[#3b82f6] to-[#10b981] rounded-xl shadow-xl p-6 mb-8 text-white">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">
                  {student.firstName[0]}
                  {student.lastName[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-blue-100 mb-2">{student.studentNumber}</p>
                  {student.currentClass && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      <span className="font-medium">
                        {student.currentClass.name}
                      </span>
                    </div>
                  )}
                </div>
                {student.account && (
                  <div className="hidden sm:block text-right">
                    <p className="text-blue-100 text-sm mb-1">Account Balance</p>
                    <p
                      className={`text-2xl font-bold ${
                        student.account.balance < 0 ? "text-red-200" : "text-white"
                      }`}
                    >
                      ${Math.abs(student.account.balance).toFixed(2)}
                      {student.account.balance < 0 && (
                        <span className="text-sm ml-1">(Due)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link
                href="/student/results"
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#3b82f6] transition-colors">
                  <FileText className="w-6 h-6 text-[#3b82f6] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">My Results</h3>
                <p className="text-sm text-slate-500">
                  View academic performance
                </p>
                <ChevronRight className="w-5 h-5 text-slate-400 mt-4 group-hover:text-[#3b82f6]" />
              </Link>

              <Link
                href="/student/timetable"
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#10b981] transition-colors">
                  <Calendar className="w-6 h-6 text-[#10b981] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Timetable</h3>
                <p className="text-sm text-slate-500">View class schedule</p>
                <ChevronRight className="w-5 h-5 text-slate-400 mt-4 group-hover:text-[#10b981]" />
              </Link>

              <Link
                href="/student/finances"
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                  <CreditCard className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Finances</h3>
                <p className="text-sm text-slate-500">View fees & payments</p>
                <ChevronRight className="w-5 h-5 text-slate-400 mt-4 group-hover:text-purple-600" />
              </Link>

              <Link
                href="/student/profile"
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
                  <User className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">My Profile</h3>
                <p className="text-sm text-slate-500">View personal info</p>
                <ChevronRight className="w-5 h-5 text-slate-400 mt-4 group-hover:text-orange-600" />
              </Link>
            </div>

            {/* Recent Activity & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Updates */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Recent Updates
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">
                        Welcome to Student Portal
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        You can now access your academic results, timetable, and
                        financial statements.
                      </p>
                      <p className="text-xs text-slate-400">Just now</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8 text-[#3b82f6]" />
                      <div>
                        <p className="text-sm text-slate-600">Current Class</p>
                        <p className="font-semibold text-slate-800">
                          {student.currentClass?.name || "Not Assigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-[#10b981]" />
                      <div>
                        <p className="text-sm text-slate-600">Attendance Rate</p>
                        <p className="font-semibold text-slate-800">Coming Soon</p>
                      </div>
                    </div>
                  </div>

                  {student.account && (
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="text-sm text-slate-600">Account Balance</p>
                          <p
                            className={`font-semibold ${
                              student.account.balance < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            ${Math.abs(student.account.balance).toFixed(2)}
                            {student.account.balance < 0 && " (Due)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
