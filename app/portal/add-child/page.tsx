"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Plus, AlertCircle, CheckCircle2 } from "lucide-react"

interface Student {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  currentClassId?: string | null
  currentClass?: {
    name: string
  } | null
  gender: string
  dateOfBirth: string
}

export default function AddChildPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [lastNameVerification, setLastNameVerification] = useState("")
  const [linking, setLinking] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.length < 2) {
      setMessage("Search query must be at least 2 characters")
      setMessageType("error")
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/parent/link-student?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        if (data.length === 0) {
          setMessage("No students found")
          setMessageType("error")
        }
      } else {
        setMessage("Search failed")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Search error:", error)
      setMessage("Error searching students")
      setMessageType("error")
    } finally {
      setSearching(false)
    }
  }

  const handleLinkStudent = async () => {
    if (!selectedStudent) return
    if (lastNameVerification.toLowerCase() !== selectedStudent.lastName.toLowerCase()) {
      setMessage("Last name does not match. Please verify correctly.")
      setMessageType("error")
      return
    }

    setLinking(true)
    try {
      const response = await fetch("/api/parent/link-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          lastNameVerification,
        }),
      })

      if (response.ok) {
        setMessage("Child linked successfully!")
        setMessageType("success")
        setShowSuccess(true)
        setSelectedStudent(null)
        setLastNameVerification("")
        setSearchQuery("")
        setResults([])

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/parent/dashboard")
        }, 2000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to link student")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Link error:", error)
      setMessage("Error linking student")
      setMessageType("error")
    } finally {
      setLinking(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Link Your Child</h1>
          <p className="text-slate-600 mb-8">
            Search for your child's student record and add them to your account
          </p>

          {/* Messages */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                messageType === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              {message}
            </div>
          )}

          {!selectedStudent ? (
            <>
              {/* Search Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Search by Student Number, First Name, or Last Name
                  </label>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g., STU2024001 or John Smith"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={searching}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition font-medium"
                    >
                      {searching ? "Searching..." : "Search"}
                    </button>
                  </form>
                </div>

                {/* Search Results */}
                {results.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Found {results.length} student(s)
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {results.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className="w-full text-left p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-slate-800">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-slate-600">
                                Student #{student.studentNumber}
                              </p>
                              {student.currentClass && (
                                <p className="text-sm text-slate-500">
                                  Class: {student.currentClass.name}
                                </p>
                              )}
                            </div>
                            <Plus className="h-5 w-5 text-blue-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Verification Form */}
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">Selected Student:</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                  <p className="text-sm text-slate-600">
                    Student #{selectedStudent.studentNumber}
                  </p>
                  {selectedStudent.currentClass && (
                    <p className="text-sm text-slate-600">
                      Class: {selectedStudent.currentClass.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Verify Student's Last Name
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    For security, please confirm this student's last name
                  </p>
                  <input
                    type="text"
                    placeholder="Enter their last name"
                    value={lastNameVerification}
                    onChange={(e) => setLastNameVerification(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleLinkStudent}
                    disabled={linking || !lastNameVerification}
                    className="flex-1 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 transition font-medium"
                  >
                    {linking ? "Linking..." : "Confirm & Link Child"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(null)
                      setLastNameVerification("")
                    }}
                    className="px-6 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
