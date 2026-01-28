"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Key, AlertCircle } from "lucide-react"

interface ParentData {
  id: string
  firstName?: string | null
  lastName?: string | null
  city?: string | null
  occupation?: string | null
  employer?: string | null
  workPhone?: string | null
  workAddress?: string | null
  address?: string | null
  alternatePhone?: string | null
  user: {
    id: string
    email: string
    name: string
    phone?: string | null
  }
  students: Array<{
    id: string
    student: {
      id: string
      studentNumber: string
      firstName: string
      lastName: string
      status: string
    }
  }>
}

export default function EditParentPage() {
  const params = useParams()
  const router = useRouter()
  const parentId = params.id as string

  const [parent, setParent] = useState<ParentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    city: "",
    occupation: "",
    employer: "",
    workPhone: "",
    workAddress: "",
    address: "",
    alternatePhone: "",
  })

  useEffect(() => {
    fetchParent()
  }, [])

  const fetchParent = async () => {
    try {
      const response = await fetch(`/api/admin/parents/${parentId}`)
      if (response.ok) {
        const data = await response.json()
        setParent(data)
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          city: data.city || "",
          occupation: data.occupation || "",
          employer: data.employer || "",
          workPhone: data.workPhone || "",
          workAddress: data.workAddress || "",
          address: data.address || "",
          alternatePhone: data.alternatePhone || "",
        })
      } else {
        setMessage("Failed to load parent details")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error fetching parent:", error)
      setMessage("Error loading parent details")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/parents/${parentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage("Parent details updated successfully")
        setMessageType("success")
        await fetchParent()
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to update parent")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error saving parent:", error)
      setMessage("Error updating parent details")
      setMessageType("error")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage("Password must be at least 6 characters")
      setMessageType("error")
      return
    }

    setResetLoading(true)
    try {
      const response = await fetch(`/api/admin/parents/${parentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          newPassword,
        }),
      })

      if (response.ok) {
        setMessage("Password reset successfully. Parent must change password on next login.")
        setMessageType("success")
        setNewPassword("")
        setShowPasswordReset(false)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to reset password")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      setMessage("Error resetting password")
      setMessageType("error")
    } finally {
      setResetLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-center text-slate-600">Parent not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Edit Parent Details</h1>
        <p className="text-slate-600 mb-6">Update parent information and manage credentials</p>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              messageType === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <AlertCircle className="h-5 w-5" />
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* Personal & Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Personal & Contact Information</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                name="alternatePhone"
                placeholder="Alternate Phone"
                value={formData.alternatePhone}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Work Information</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="occupation"
                placeholder="Occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="employer"
                placeholder="Employer"
                value={formData.employer}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="tel"
                name="workPhone"
                placeholder="Work Phone"
                value={formData.workPhone}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="workAddress"
                placeholder="Work Address"
                value={formData.workAddress}
                onChange={handleInputChange}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Linked Students */}
          {parent.students.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Linked Students</h2>
              <div className="space-y-2">
                {parent.students.map((ps) => (
                  <div
                    key={ps.id}
                    className="p-4 bg-slate-50 rounded-lg flex items-start justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {ps.student.firstName} {ps.student.lastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        Student #: {ps.student.studentNumber}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {ps.student.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Password Reset Section */}
          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Security</h2>

            {!showPasswordReset ? (
              <button
                onClick={() => setShowPasswordReset(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition font-medium"
              >
                <Key className="h-4 w-4" />
                Reset Password
              </button>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 space-y-4">
                <p className="text-sm text-orange-700">
                  Generate a new password for this parent. They will be required to change it on their next login.
                </p>
                <input
                  type="password"
                  placeholder="New Password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handlePasswordReset}
                    disabled={resetLoading || !newPassword}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-slate-300 transition font-medium"
                  >
                    {resetLoading ? "Resetting..." : "Confirm Reset"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordReset(false)
                      setNewPassword("")
                    }}
                    className="px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 border-t border-slate-200 pt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition font-medium"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
