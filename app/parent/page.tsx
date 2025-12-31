"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Child {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  photo?: string
  currentClass?: {
    name: string
    level: string
  }
  attendance?: {
    present: number
    absent: number
    total: number
  }
}

export default function ParentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchChildren()
    }
  }, [session])

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/children")
      const data = await res.json()
      setChildren(data.children || [])
    } catch (error) {
      console.error("Error fetching children:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "PARENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">AH</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Parent Portal</h1>
                <p className="text-xs text-gray-500">Advent Hope Academy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.name}</span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome, {session.user.name?.split(' ')[0]}!</h2>
          <p className="text-green-100">Access your children's academic information and school activities.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/parent/children" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👨‍👩‍👧</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">My Children</p>
              <p className="text-sm text-gray-500">{children.length} student(s)</p>
            </div>
          </Link>
          <Link href="/parent/fees" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💵</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">School Fees</p>
              <p className="text-sm text-gray-500">View & Pay</p>
            </div>
          </Link>
          <Link href="/parent/attendance" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Attendance</p>
              <p className="text-sm text-gray-500">View Records</p>
            </div>
          </Link>
          <Link href="/parent/reports" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Reports</p>
              <p className="text-sm text-gray-500">Academic Results</p>
            </div>
          </Link>
        </div>

        {/* Children Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">My Children</h3>
          {children.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <span className="text-6xl mb-4 block">👨‍👩‍👧</span>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">No Children Linked</h4>
              <p className="text-gray-500 mb-4">
                Your account is not linked to any student yet. Please contact the school administration 
                to link your child's account.
              </p>
              <a
                href="tel:+263773102003"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
              >
                <span>📞</span> Contact School
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <div key={child.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                        👨‍🎓
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{child.firstName} {child.lastName}</h4>
                        <p className="text-blue-100 text-sm">{child.studentNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500 text-sm">Class</span>
                      <span className="font-semibold text-gray-800">
                        {child.currentClass?.name || "Not assigned"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/parent/children/${child.id}`}
                        className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-lg text-center text-sm font-medium hover:bg-blue-100 transition"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/parent/children/${child.id}/fees`}
                        className="flex-1 py-2 px-4 bg-green-50 text-green-600 rounded-lg text-center text-sm font-medium hover:bg-green-100 transition"
                      >
                        Fees
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">School Announcements</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-gray-800">Term 1 Fees Due</h4>
              <p className="text-gray-600 text-sm">Please ensure all fees are paid by January 15, 2025.</p>
              <span className="text-xs text-gray-400">2 days ago</span>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h4 className="font-semibold text-gray-800">School Resumes</h4>
              <p className="text-gray-600 text-sm">Term 1 begins on January 8, 2025. All students should report by 7:30 AM.</p>
              <span className="text-xs text-gray-400">1 week ago</span>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <h4 className="font-semibold text-gray-800">Parent Meeting</h4>
              <p className="text-gray-600 text-sm">Annual general meeting scheduled for January 20, 2025 at 2:00 PM.</p>
              <span className="text-xs text-gray-400">1 week ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
