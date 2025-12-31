"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { roleLabels } from "@/lib/roles"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  Wallet,
  ClipboardCheck,
  GraduationCap,
  Home,
  FileText,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User
} from "lucide-react"

// Icon mapping for menu items
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  dashboard: LayoutDashboard,
  students: Users,
  staff: Briefcase,
  classes: BookOpen,
  finances: Wallet,
  attendance: ClipboardCheck,
  grades: GraduationCap,
  hostels: Home,
  reports: FileText,
  settings: Settings,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = session.user.role
  const roleLabel = roleLabels[userRole] || userRole

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", iconKey: "dashboard", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT", "REGISTRAR", "TEACHER", "HOSTEL_MANAGER"] },
    { href: "/dashboard/students", label: "Students", iconKey: "students", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"] },
    { href: "/dashboard/staff", label: "Staff", iconKey: "staff", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"] },
    { href: "/dashboard/classes", label: "Classes", iconKey: "classes", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"] },
    { href: "/dashboard/finances", label: "Finances", iconKey: "finances", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"] },
    { href: "/dashboard/attendance", label: "Attendance", iconKey: "attendance", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"] },
    { href: "/dashboard/grades", label: "Grades", iconKey: "grades", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"] },
    { href: "/dashboard/hostels", label: "Hostels", iconKey: "hostels", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "HOSTEL_MANAGER"] },
    { href: "/dashboard/reports", label: "Reports", iconKey: "reports", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"] },
    { href: "/dashboard/settings", label: "Settings", iconKey: "settings", roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"] },
  ]

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole))

  // Check if current path is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => isActive(item.href))
    return currentItem?.label || "Dashboard"
  }

  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Advent Hope Academy Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <span className="hidden text-blue-600 font-bold text-lg">AH</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">
                Advent Hope Academy
              </h1>
              <p className="text-slate-500 text-xs">School Management</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const IconComponent = iconMap[item.iconKey]
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {IconComponent && (
                    <IconComponent className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                  {active && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {getUserInitials(session.user.name || "User")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {session.user.name}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Page Title */}
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {getCurrentPageTitle()}
                </h2>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {session.user.school?.name || "Advent Hope Academy"}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* User Info (Desktop) */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {roleLabel}
                  </p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {getUserInitials(session.user.name || "User")}
                  </span>
                </div>
              </div>

              {/* Mobile User Avatar */}
              <div className="sm:hidden w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getUserInitials(session.user.name || "User")}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-6 py-4 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-400 text-center">
            Advent Hope Academy School Management System
          </p>
        </footer>
      </div>
    </div>
  )
}

