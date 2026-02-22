"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Users, Mail, Phone, Filter, Download, CheckCircle2, Edit, Plus, Trash2, Loader2, X } from "lucide-react"

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
  const [parentList, setParentList] = useState<ParentItem[]>(parents)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE")
  const [showAddModal, setShowAddModal] = useState(false)
  const [creatingParent, setCreatingParent] = useState(false)
  const [deletingParentId, setDeletingParentId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationalId: "",
    address: "",
    city: "",
    password: "",
    confirmPassword: "",
  })

  const filtered = useMemo(() => {
    return parentList.filter((p) => {
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
  }, [search, statusFilter, parentList])

  const stats = useMemo(() => {
    return {
      total: parentList.length,
      listed: filtered.length,
      withEmail: parentList.filter((p) => p.email).length,
    }
  }, [parentList, filtered])

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.nationalId.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setNotice({ type: "error", message: "Please complete all required fields." })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setNotice({ type: "error", message: "Passwords do not match." })
      return
    }

    if (formData.password.length < 8) {
      setNotice({ type: "error", message: "Password must be at least 8 characters." })
      return
    }

    setCreatingParent(true)
    try {
      const response = await fetch("/api/admin/create-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          nationalId: formData.nationalId.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setNotice({ type: "error", message: data.error || "Failed to create parent account." })
        return
      }

      setParentList((prev) => [
        {
          id: data.parentId,
          applicationNumber: data.applicationNumber || "-",
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          status: "ACTIVE",
          isActive: true,
          createdAt: new Date().toISOString(),
          city: null,
          occupation: null,
          employer: null,
          students: [],
        },
        ...prev,
      ])

      setNotice({
        type: "success",
        message: `Parent created successfully. Application number: ${data.applicationNumber || "N/A"}`,
      })
      setShowAddModal(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nationalId: "",
        address: "",
        city: "",
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      setNotice({ type: "error", message: "Failed to create parent account." })
    } finally {
      setCreatingParent(false)
    }
  }

  const handleDeleteParent = async (parent: ParentItem) => {
    const confirmed = window.confirm(`Delete parent ${parent.name}? This action cannot be undone.`)
    if (!confirmed) return

    setNotice(null)
    setDeletingParentId(parent.id)
    try {
      const response = await fetch(`/api/admin/parents/${parent.id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (!response.ok) {
        setNotice({ type: "error", message: data.error || "Failed to delete parent." })
        return
      }

      setParentList((prev) => prev.filter((p) => p.id !== parent.id))
      setNotice({ type: "success", message: `${parent.name} deleted successfully.` })
    } catch (error) {
      setNotice({ type: "error", message: "Failed to delete parent." })
    } finally {
      setDeletingParentId(null)
    }
  }

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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Parent
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm hover:shadow"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {notice.message}
        </div>
      )}

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
                    <button
                      onClick={() => handleDeleteParent(parent)}
                      disabled={deletingParentId === parent.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition text-sm font-medium disabled:opacity-60"
                    >
                      {deletingParentId === parent.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </button>
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
            <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Add Parent</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParent} className="space-y-4 pb-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="parent@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+263..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">National ID</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nationalId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="63-123456A12"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Harare"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingParent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {creatingParent ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create Parent
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
