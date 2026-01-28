"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Users, Mail, Phone, Filter, Download, CheckCircle2, Edit, Key } from "lucide-react"

interface ParentStudent {
  id: string
  studentNumber: string
  name: string
  status: string
  relationship: string
  isPrimary: boolean
}

interface ParentItem {
  id: string
  applicationNumber: string
  name: string
  email: string
  phone?: string | null
  status: string
  isActive: boolean
  createdAt: string
  city?: string | null
  occupation?: string | null
  employer?: string | null
  students: ParentStudent[]
}

interface ParentsListClientProps {
  parents: ParentItem[]
}

export default function ParentsListClient({ parents }: ParentsListClientProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE")

  const filtered = useMemo(() => {
    return parents.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        (p.phone || "").toLowerCase().includes(search.toLowerCase()) ||
        p.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.students.some((s) =>
          `${s.studentNumber} ${s.name}`.toLowerCase().includes(search.toLowerCase())
        )

      const matchesStatus = statusFilter === "" || p.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, parents])

  const stats = useMemo(() => {
    return {
      total: parents.length,
      listed: filtered.length,
      withEmail: parents.filter((p) => p.email).length,
    }
  }, [parents, filtered])

  const exportToCSV = () => {
    const csv = [
      ["Name", "Email", "Phone", "Status", "Application #", "Students", "Created"],
      ...filtered.map((p) => [
        p.name,
        p.email,
        p.phone || "-",
        p.status,
        p.applicationNumber,
        p.students.map((s) => `${s.studentNumber} (${s.name})`).join("; "),
        new Date(p.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `parents-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Approved Parents</h1>
          <p className="text-slate-600 mt-1">Manage and view approved parent accounts</p>
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm hover:shadow"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Approved</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Listed</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.listed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">With Email</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.withEmail}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Mail className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Parents Grid */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No parents found</p>
          </div>
        ) : (
          filtered.map((parent) => (
            <div key={parent.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">{parent.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {parent.email}
                    </div>
                    {parent.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {parent.phone}
                      </div>
                    )}
                  </div>

                  {/* Students */}
                  {parent.students.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">Linked Students:</p>
                      <div className="space-y-2">
                        {parent.students.map((student) => (
                          <div key={student.id} className="text-sm text-slate-600 flex items-center gap-2">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                              {student.studentNumber}
                            </span>
                            <span>{student.name}</span>
                            {student.isPrimary && <span className="text-xs font-semibold text-blue-600">(Primary)</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {parent.status}
                  </span>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Link
                      href={`/dashboard/parents/${parent.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                  </div>
                  <Link
                    href={`/dashboard/students?parent=${parent.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Students →
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
