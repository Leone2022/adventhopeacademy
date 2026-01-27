"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { roleLabels } from "@/lib/roles"
import {
  Users,
  Briefcase,
  BookOpen,
  TrendingUp,
  Wallet,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  Bell,
  UserPlus,
  DollarSign,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect parents to parent portal
    if (session?.user?.role === "PARENT") {
      router.push("/parent")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // If parent, show nothing while redirecting
  if (session.user.role === "PARENT") {
    return null
  }

  const roleLabel = roleLabels[session.user.role] || session.user.role

  // Stats data
  const statsCards = [
    {
      label: "Pending Approvals",
      value: "New",
      icon: UserPlus,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: "Review",
      trendUp: true,
      trendLabel: "registrations waiting",
      link: "/admin/pending-registrations"
    },
    {
      label: "Total Students",
      value: "500+",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+12%",
      trendUp: true,
      trendLabel: "from last term"
    },
    {
      label: "Total Staff",
      value: "50+",
      icon: Briefcase,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "+3",
      trendUp: true,
      trendLabel: "new this month"
    },
    {
      label: "Active Classes",
      value: "24",
      icon: BookOpen,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: "Full",
      trendUp: true,
      trendLabel: "capacity"
    },
    {
      label: "Fee Collection",
      value: "85%",
      icon: TrendingUp,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      trend: "+5%",
      trendUp: true,
      trendLabel: "from last month"
    }
  ]

  // Quick actions data
  const quickActions = [
    {
      href: "/dashboard/students",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Manage Students",
      description: "Register, view, and manage student records",
      roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"]
    },
    {
      href: "/dashboard/finances",
      icon: Wallet,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Financial Management",
      description: "View fees, payments, and financial reports",
      roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"]
    },
    {
      href: "/dashboard/staff",
      icon: Briefcase,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Staff Management",
      description: "Manage teachers and staff records",
      roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"]
    },
    {
      href: "/dashboard/classes",
      icon: BookOpen,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      title: "Classes",
      description: "Manage classes and timetables",
      roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"]
    },
    {
      href: "/dashboard/attendance",
      icon: ClipboardCheck,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      title: "Attendance",
      description: "Track and manage student attendance",
      roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]
    },
    {
      href: "/dashboard/grades",
      icon: GraduationCap,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      title: "Grades",
      description: "Record and view student grades",
      roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]
    }
  ]

  // Recent activity data
  const recentActivity = [
    {
      icon: UserPlus,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "New student registered",
      description: "John Doe was added to Form 1A",
      time: "2 hours ago"
    },
    {
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Payment received",
      description: "$500 fee payment from Jane Smith",
      time: "5 hours ago"
    },
    {
      icon: Megaphone,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Announcement posted",
      description: "Term 1 fees reminder sent to all parents",
      time: "1 day ago"
    }
  ]

  // Upcoming events
  const upcomingEvents = [
    {
      title: "Staff Meeting",
      date: "Jan 2, 2025",
      time: "09:00 AM"
    },
    {
      title: "Term 1 Opens",
      date: "Jan 6, 2025",
      time: "08:00 AM"
    },
    {
      title: "Parent-Teacher Conference",
      date: "Jan 15, 2025",
      time: "02:00 PM"
    }
  ]

  const filteredQuickActions = quickActions.filter(action => 
    action.roles.includes(session.user.role)
  )

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                Welcome back, {session.user.name?.split(' ')[0]}
              </h1>
              <p className="text-slate-300 text-sm lg:text-base">
                {roleLabel} {session.user.school && `at ${session.user.school.name}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                <p className="text-slate-300 text-xs">Today</p>
                <p className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {(session.user.role === "SUPER_ADMIN" || session.user.role === "SCHOOL_ADMIN") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon
            const content = (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{stat.trendLabel}</p>
                </div>
              </>
            )
            
            if (stat.link) {
              return (
                <Link 
                  key={index} 
                  href={stat.link}
                  className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-200 cursor-pointer group"
                >
                  {content}
                </Link>
              )
            }
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {content}
              </div>
            )
          })}
        </div>
      )}

      {/* Pending Registrations Widget */}
      {(session.user.role === "SUPER_ADMIN" || session.user.role === "SCHOOL_ADMIN") && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Pending Registrations</h3>
                <p className="text-slate-600 text-sm mt-0.5">Students and parents awaiting approval</p>
              </div>
            </div>
            <Link 
              href="/admin/pending-registrations"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition"
            >
              Review
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
          <Link href="/dashboard/settings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            Customize
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Link
                key={index}
                href={action.href}
                className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                    <IconComponent className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-0.5 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
            <Link href="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity, index) => {
              const IconComponent = activity.icon
              return (
                <div key={index} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium">{activity.title}</p>
                    <p className="text-slate-500 text-sm truncate">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Events</h2>
            <Link href="/dashboard/calendar" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Calendar
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-medium text-sm">{event.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{event.date}</p>
                  <p className="text-slate-400 text-xs">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section - Placeholder */}
      {(session.user.role === "SUPER_ADMIN" || session.user.role === "SCHOOL_ADMIN") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Chart Placeholder */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Student Enrollment</h3>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <div className="text-center">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Chart will appear here</p>
                <p className="text-slate-300 text-xs">Enrollment trends over time</p>
              </div>
            </div>
          </div>

          {/* Fee Collection Chart Placeholder */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Fee Collection</h3>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <div className="text-center">
                <PieChart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Chart will appear here</p>
                <p className="text-slate-300 text-xs">Collection breakdown by class</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

