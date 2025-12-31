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
  middleName?: string
  dateOfBirth: string
  gender: string
  photo?: string
  curriculum: string
  currentClass?: {
    id: string
    name: string
    level: string
  }
  email?: string
  phone?: string
  address?: string
  admissionDate: string
}

export default function ParentChildrenPage() {
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
              <Link href="/parent" className="text-gray-400 hover:text-gray-600">
                ← Back
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">AH</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">My Children</h1>
                <p className="text-xs text-gray-500">View student details</p>
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Children</h2>
          <p className="text-gray-500">View and manage your children's information</p>
        </div>

        {children.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <span className="text-7xl mb-4 block">👨‍👩‍👧</span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Children Linked</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Your account is not linked to any student yet. Please contact the school administration 
              with your child's student number to link their account.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="tel:+263773102003"
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
              >
                📞 Call School
              </a>
              <a
                href="mailto:info@adventhope.ac.zw"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                ✉️ Email School
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {children.map((child) => (
              <div key={child.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-5xl">
                      {child.gender === "MALE" ? "👦" : "👧"}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {child.firstName} {child.middleName} {child.lastName}
                      </h3>
                      <p className="text-blue-200">Student Number: {child.studentNumber}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {child.currentClass?.name || "No Class"}
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {child.curriculum}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>👤</span> Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-500 text-sm">Date of Birth</span>
                          <p className="font-medium">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Gender</span>
                          <p className="font-medium">{child.gender}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Admission Date</span>
                          <p className="font-medium">{new Date(child.admissionDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📞</span> Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-500 text-sm">Email</span>
                          <p className="font-medium">{child.email || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Phone</span>
                          <p className="font-medium">{child.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Address</span>
                          <p className="font-medium">{child.address || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📚</span> Academic Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-500 text-sm">Current Class</span>
                          <p className="font-medium">{child.currentClass?.name || "Not assigned"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Level</span>
                          <p className="font-medium">{child.currentClass?.level || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Curriculum</span>
                          <p className="font-medium">{child.curriculum}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                    <Link
                      href={`/parent/children/${child.id}/grades`}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition flex items-center gap-2"
                    >
                      <span>📊</span> View Grades
                    </Link>
                    <Link
                      href={`/parent/children/${child.id}/attendance`}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition flex items-center gap-2"
                    >
                      <span>📅</span> Attendance
                    </Link>
                    <Link
                      href={`/parent/children/${child.id}/fees`}
                      className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg font-medium hover:bg-yellow-100 transition flex items-center gap-2"
                    >
                      <span>💵</span> School Fees
                    </Link>
                    <Link
                      href={`/parent/children/${child.id}/timetable`}
                      className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition flex items-center gap-2"
                    >
                      <span>🗓️</span> Timetable
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
