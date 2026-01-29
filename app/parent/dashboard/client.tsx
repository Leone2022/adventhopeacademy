"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import {
  User,
  GraduationCap,
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
  AlertCircle
} from "lucide-react"

interface Child {
  id: string
  firstName: string
  lastName: string
  studentNumber: string
  photo?: string | null
  currentClass?: {
    name: string
    level: string
  } | null
  account?: {
    balance: number
  } | null
}

interface ParentDashboardClientProps {
  parent: any
  children: Child[]
}

export default function ParentDashboardClient({
  parent,
  children,
}: ParentDashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(
    children[0] || null
  )

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
                  Parent Portal
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Advent Hope Academy
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
                    {parent.user.name}
                  </p>
                  <p className="text-xs text-slate-500">Parent</p>
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
                href="/parent/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-[#3b82f6] bg-blue-50 rounded-lg font-medium"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/parent/children"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <GraduationCap className="w-5 h-5" />
                <span>My Children</span>
              </Link>

              <Link
                href="/parent/results"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <FileText className="w-5 h-5" />
                <span>Academic Results</span>
              </Link>

              <Link
                href="/parent/finances"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <DollarSign className="w-5 h-5" />
                <span>Finances</span>
              </Link>

              <Link
                href="/parent/attendance"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Calendar className="w-5 h-5" />
                <span>Attendance</span>
              </Link>

              <Link
                href="/parent/messages"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Mail className="w-5 h-5" />
                <span>Messages</span>
              </Link>

              <Link
                href="/parent/profile"
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
                Welcome back, {parent.user.name.split(" ")[0]}!
              </h2>
              <p className="text-slate-600">
                Here&apos;s an overview of your children&apos;s progress.
              </p>
            </div>

            {/* Children Cards */}
            {children.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    No Children Linked Yet
                  </h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    You don&apos;t have any children linked to your account yet.
                  </p>
                  <Link
                    href="/portal/add-child"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Add Your Child
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Your Children</h3>
                  <Link
                    href="/portal/add-child"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Add Child
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/parent/children/${child.id}`}
                      className={`block bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
                        selectedChild?.id === child.id
                          ? "border-[#3b82f6] shadow-lg"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedChild(child)
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#10b981] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {child.firstName[0]}
                          {child.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">
                            {child.firstName} {child.lastName}
                          </h3>
                          <p className="text-sm text-slate-500 mb-2">
                            {child.studentNumber}
                          </p>
                          {child.currentClass && (
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="w-4 h-4 text-[#3b82f6]" />
                              <span className="text-slate-600">
                                {child.currentClass.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {child.account && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                              Account Balance
                            </span>
                            <span
                              className={`font-semibold ${
                                child.account.balance < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              ${Math.abs(child.account.balance).toFixed(2)}
                              {child.account.balance < 0 ? " (Due)" : ""}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-end text-blue-600">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Quick Actions */}
                {selectedChild && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">
                      Quick Actions for {selectedChild.firstName}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Link
                        href={`/parent/results?student=${selectedChild.id}`}
                        className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 mb-1">
                            View Results
                          </h4>
                          <p className="text-xs text-slate-500">
                            Academic performance
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#3b82f6]" />
                      </Link>

                      <Link
                        href={`/parent/biodata?student=${selectedChild.id}`}
                        className="flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-[#10b981] rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 mb-1">
                            Biodata
                          </h4>
                          <p className="text-xs text-slate-500">
                            Student information
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#10b981]" />
                      </Link>

                      <Link
                        href={`/parent/finances?student=${selectedChild.id}`}
                        className="flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 mb-1">
                            Finances
                          </h4>
                          <p className="text-xs text-slate-500">
                            Fees & payments
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
                      </Link>

                      <Link
                        href={`/parent/attendance?student=${selectedChild.id}`}
                        className="flex items-center gap-4 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 mb-1">
                            Attendance
                          </h4>
                          <p className="text-xs text-slate-500">
                            Daily records
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
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
                          Welcome to Parent Portal
                        </h4>
                        <p className="text-sm text-slate-600 mb-2">
                          You can now access your children&apos;s academic results,
                          biodata, and financial statements.
                        </p>
                        <p className="text-xs text-slate-400">Just now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
