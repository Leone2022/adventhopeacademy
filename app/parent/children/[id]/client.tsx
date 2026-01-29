"use client"

import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

interface StudentDetailsProps {
  student: any
}

export default function StudentDetailsClient({ student }: StudentDetailsProps) {
  const router = useRouter()
  const age = student.dateOfBirth
    ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()
    : null

  // Calculate attendance percentage
  const presentDays = student.attendance?.filter((a: any) => a.status === "PRESENT").length || 0
  const totalDays = student.attendance?.length || 0
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  // Calculate average grade
  const grades = student.grades || []
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum: number, g: any) => sum + (parseFloat(g.score) || 0), 0) / grades.length).toFixed(1)
    : "N/A"

  const feesOwed = student.account?.balance || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Student Header Card */}
        <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {student.photo ? (
              <img
                src={student.photo}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {student.firstName[0]}
                {student.lastName[0]}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800">
                {student.firstName} {student.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3 text-slate-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Student #{student.studentNumber}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {age} years old
                </div>
                {student.currentClass && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {student.currentClass.name}
                  </div>
                )}
              </div>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                student.status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {student.status}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          {/* Attendance */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Attendance</p>
                <p className="text-2xl font-bold text-slate-800">{attendancePercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Average Grade */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Grade</p>
                <p className="text-2xl font-bold text-slate-800">{averageGrade}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Fees Status */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Fees Owed</p>
                <p className="text-2xl font-bold text-slate-800">
                  {feesOwed > 0 ? `$${feesOwed.toFixed(2)}` : "Paid"}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                feesOwed === 0 
                  ? "bg-emerald-100" 
                  : "bg-orange-100"
              }`}>
                <DollarSign className={`h-6 w-6 ${
                  feesOwed === 0 
                    ? "text-emerald-600" 
                    : "text-orange-600"
                }`} />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Subjects</p>
                <p className="text-2xl font-bold text-slate-800">{grades.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Personal Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Personal Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Gender</p>
                  <p className="text-sm text-slate-800">{student.gender}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Date of Birth</p>
                  <p className="text-sm text-slate-800">
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                {student.bloodGroup && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Blood Group
                    </p>
                    <p className="text-sm text-slate-800">{student.bloodGroup}</p>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </p>
                    <p className="text-sm text-slate-800">{student.phone}</p>
                  </div>
                )}
                {student.email && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="text-sm text-slate-800 break-all">{student.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic & Attendance Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Information */}
            {student.currentClass && (
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Class Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Class</p>
                    <p className="text-sm text-slate-800 font-medium">
                      {student.currentClass.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Level</p>
                    <p className="text-sm text-slate-800">{student.currentClass.level}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Curriculum</p>
                    <p className="text-sm text-slate-800">{student.currentClass.curriculum}</p>
                  </div>
                  {student.currentClass.stream && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-1">Stream</p>
                      <p className="text-sm text-slate-800">{student.currentClass.stream}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Grades */}
            {grades.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Grades</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {grades.slice(0, 10).map((grade: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{grade.subject}</p>
                        <p className="text-xs text-slate-500">
                          {grade.academicYear} - {grade.term}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {grade.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance Details */}
            {student.attendance && student.attendance.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Attendance</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {student.attendance.slice(0, 8).map((record: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <p className="text-sm text-slate-800">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      <span
                        className={`flex items-center gap-1 text-sm font-medium ${
                          record.status === "PRESENT"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {record.status === "PRESENT" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
