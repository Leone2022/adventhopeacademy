"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Check, CheckCircle, Clock, Filter, Loader, Mail, Phone, Search, UserCheck, Users, XCircle } from "lucide-react"

interface PendingRegistration {
  id: string
  email: string
  name: string
  phone: string
  role: "PARENT" | "STUDENT"
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  emailVerified: boolean
  studentInfo?: {
    firstName: string
    lastName: string
    gradeApplying: string
  }
  parentInfo?: {
    firstName: string
    lastName: string
    address: string
    applicationNumber?: string
  }
}

export default function PendingRegistrationsClient() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([])
  const [approvedParents, setApprovedParents] = useState<PendingRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<"ALL" | "PARENT" | "STUDENT">("ALL")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkApproving, setBulkApproving] = useState(false)
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending")

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/pending-registrations")
        const data: PendingRegistration[] = await response.json()
        const pending = data.filter((r) => r.status === "PENDING")
        const approved = data.filter((r) => r.status === "APPROVED")
        setRegistrations(pending)
        setApprovedParents(approved.filter((r) => r.role === "PARENT"))
      } catch (error) {
        console.error("Failed to fetch registrations", error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filteredRegistrations = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return registrations.filter((reg) => {
      const matchesSearch =
        reg.name.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        reg.phone.toLowerCase().includes(query)
      const matchesRole = filterRole === "ALL" || reg.role === filterRole
      return matchesSearch && matchesRole
    })
  }, [registrations, searchQuery, filterRole])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    const ids = filteredRegistrations.map((r) => r.id)
    setSelectedIds((prev) => {
      if (prev.size === ids.length) return new Set()
      return new Set(ids)
    })
  }

  const handleApprove = async (userId: string) => {
    setApproving(userId)
    try {
      const response = await fetch("/api/admin/approve-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setRegistrations((prev) => prev.filter((r) => r.id !== userId))
        const approved = registrations.find((r) => r.id === userId)
        if (approved && approved.role === "PARENT") {
          setApprovedParents((prev) => [...prev, { ...approved, status: "APPROVED" as const }])
        }
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }
    } catch (error) {
      console.error("Failed to approve", error)
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (userId: string) => {
    if (!rejectReason.trim()) return
    setRejecting(userId)
    try {
      const response = await fetch("/api/admin/reject-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reason: rejectReason.trim() }),
      })

      if (response.ok) {
        setRegistrations((prev) => prev.filter((r) => r.id !== userId))
        setShowRejectModal(null)
        setRejectReason("")
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }
    } catch (error) {
      console.error("Failed to reject", error)
    } finally {
      setRejecting(null)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return
    setBulkApproving(true)
    try {
      const response = await fetch("/api/admin/bulk-approve-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedIds) }),
      })

      if (response.ok) {
        const ids = new Set(selectedIds)
        setRegistrations((prev) => prev.filter((r) => !ids.has(r.id)))
        const newApprovedParents = registrations.filter((r) => ids.has(r.id) && r.role === "PARENT")
        if (newApprovedParents.length > 0) {
          setApprovedParents((prev) => [
            ...prev,
            ...newApprovedParents.map((r) => ({ ...r, status: "APPROVED" as const })),
          ])
        }
        setSelectedIds(new Set())
      }
    } catch (error) {
      console.error("Failed to bulk approve", error)
    } finally {
      setBulkApproving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold">Loading registrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-500">Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Pending registrations</h1>
          <p className="text-slate-600 text-sm">Review new parent and student accounts, approve in bulk, or reject with a reason.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard label="Pending" value={registrations.length} icon={<Users className="w-5 h-5" />} color="from-amber-500 to-orange-600" />
          <StatCard label="Approved parents" value={approvedParents.length} icon={<UserCheck className="w-5 h-5" />} color="from-emerald-500 to-teal-600" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              className="bg-transparent focus:outline-none text-sm flex-1 text-slate-900 placeholder-slate-500"
              placeholder="Search by name, email, phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              className="bg-transparent focus:outline-none text-sm text-slate-900"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as "ALL" | "PARENT" | "STUDENT")}
            >
              <option value="ALL">All roles</option>
              <option value="PARENT">Parents</option>
              <option value="STUDENT">Students</option>
            </select>
          </div>

          <button
            onClick={toggleSelectAll}
            className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-900"
          >
            {selectedIds.size === filteredRegistrations.length ? "Clear selection" : "Select all"}
          </button>

          <button
            onClick={handleBulkApprove}
            disabled={selectedIds.size === 0 || bulkApproving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-900/40 disabled:opacity-50"
          >
            {bulkApproving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Bulk approve ({selectedIds.size})
          </button>
        </div>

        <div className="flex gap-2">
          <TabButton label="Pending" active={activeTab === "pending"} onClick={() => setActiveTab("pending")} />
          <TabButton label="Approved parents" active={activeTab === "approved"} onClick={() => setActiveTab("approved")} />
        </div>

        {activeTab === "pending" && (
          <div className="space-y-3">
            {filteredRegistrations.length === 0 ? (
              <EmptyState />
            ) : (
              filteredRegistrations.map((registration) => (
                <div key={registration.id} className="border border-slate-200 bg-slate-50 rounded-2xl p-4 space-y-3 shadow-lg shadow-slate-100">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 bg-white"
                      checked={selectedIds.has(registration.id)}
                      onChange={() => toggleSelect(registration.id)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-slate-900">{registration.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span>{new Date(registration.createdAt).toLocaleString()}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-xs ${
                              registration.emailVerified
                                ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                : "border-amber-300 text-amber-700 bg-amber-50"
                            }`}>
                              {registration.emailVerified ? "Email verified" : "Email pending"}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          registration.role === "PARENT"
                            ? "bg-sky-100 text-sky-700 border border-sky-300"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        }`}>
                          {registration.role}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4" /> {registration.email}</span>
                        <span className="inline-flex items-center gap-2"><Phone className="w-4 h-4" /> {registration.phone}</span>
                      </div>

                      {registration.role === "STUDENT" && registration.studentInfo && (
                        <p className="text-sm text-slate-700">📚 Applying for {registration.studentInfo.gradeApplying}</p>
                      )}
                      {registration.role === "PARENT" && registration.parentInfo?.applicationNumber && (
                        <p className="text-sm text-slate-700">🆔 Application {registration.parentInfo.applicationNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => handleApprove(registration.id)}
                      disabled={approving === registration.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-900/40 disabled:opacity-50"
                    >
                      {approving === registration.id ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectModal(registration.id)
                        setRejectReason("")
                      }}
                      disabled={rejecting === registration.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-lg shadow-rose-900/40 disabled:opacity-50"
                    >
                      {rejecting === registration.id ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>

                  {showRejectModal === registration.id && (
                    <div className="border border-rose-300 bg-rose-50 rounded-xl p-3 space-y-3">
                      <p className="text-sm text-rose-700 font-semibold">Add a rejection reason</p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30"
                        placeholder="Reason..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowRejectModal(null)}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(registration.id)}
                          disabled={rejecting === registration.id || rejectReason.trim().length === 0}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-lg shadow-rose-900/40 disabled:opacity-50"
                        >
                          Submit rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "approved" && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xl shadow-slate-100">
            <div className="flex items-center gap-2 text-slate-700">
              <UserCheck className="w-5 h-5" />
              <p className="font-semibold">Approved parents ({approvedParents.length})</p>
            </div>

            {approvedParents.length === 0 ? (
              <p className="text-slate-500 text-sm">No approved parents yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {approvedParents.map((parent) => (
                  <div key={parent.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <p className="font-semibold truncate text-slate-900">{parent.name}</p>
                    </div>
                    <p className="text-sm text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4" /> {parent.email}</p>
                    <p className="text-sm text-slate-700 flex items-center gap-2"><Phone className="w-4 h-4" /> {parent.phone}</p>
                    {parent.parentInfo?.applicationNumber && (
                      <p className="text-sm text-emerald-600">App #{parent.parentInfo.applicationNumber}</p>
                    )}
                    <p className="text-xs text-slate-500">Approved</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: ReactNode; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between shadow-lg shadow-slate-100">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl text-white bg-gradient-to-br ${color} shadow-lg shadow-black/30`}>{icon}</div>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-semibold transition border ${
        active
          ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-100"
          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  )
}

function EmptyState() {
  return (
    <div className="border border-slate-200 bg-slate-50 rounded-2xl p-8 text-center space-y-3">
      <Clock className="w-10 h-10 text-slate-400 mx-auto" />
      <p className="text-lg font-semibold text-slate-900">No pending registrations</p>
      <p className="text-slate-600 text-sm">All registrations have been reviewed.</p>
    </div>
  )
}
