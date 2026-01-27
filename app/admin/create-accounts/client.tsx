"use client"

import { useState } from "react"
import { Users, GraduationCap, Loader2, CheckCircle, AlertCircle, Copy, Mail, Phone, Upload, FileText, X } from "lucide-react"

interface CreateAccountsClientProps {
  session: any
}

type AccountType = "parent" | "student"

interface UploadedDocument {
  url: string
  filename: string
  originalName: string
  type: string
  size: number
}

export default function CreateAccountsClient({ session }: CreateAccountsClientProps) {
  const [accountType, setAccountType] = useState<AccountType>("parent")
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [credentials, setCredentials] = useState<{
    username: string
    password: string
    role: string
  } | null>(null)

  // Parent form fields
  const [parentName, setParentName] = useState("")
  const [parentEmail, setParentEmail] = useState("")
  const [parentPhone, setParentPhone] = useState("")

  // Student form fields
  const [studentFirstName, setStudentFirstName] = useState("")
  const [studentLastName, setStudentLastName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentGender, setStudentGender] = useState("MALE")
  const [studentDateOfBirth, setStudentDateOfBirth] = useState("")

  // Document uploads
  const [birthCertificate, setBirthCertificate] = useState<UploadedDocument | null>(null)
  const [academicRecords, setAcademicRecords] = useState<UploadedDocument[]>([])
  const [otherDocuments, setOtherDocuments] = useState<UploadedDocument[]>([])

  const resetForm = () => {
    setParentName("")
    setParentEmail("")
    setParentPhone("")
    setStudentFirstName("")
    setStudentLastName("")
    setStudentEmail("")
    setStudentGender("MALE")
    setStudentDateOfBirth("")
    setBirthCertificate(null)
    setAcademicRecords([])
    setOtherDocuments([])
    setError("")
    setSuccess(false)
    setCredentials(null)
  }

  const handleFileUpload = async (
    file: File,
    type: "document" | "result",
    documentName: string
  ): Promise<UploadedDocument | null> => {
    try {
      setUploadingFile(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      formData.append("documentName", documentName)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to upload file")
        setUploadingFile(false)
        return null
      }

      const data = await response.json()
      setUploadingFile(false)
      return data
    } catch (err) {
      setError("Failed to upload file")
      setUploadingFile(false)
      return null
    }
  }

  const handleBirthCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploaded = await handleFileUpload(file, "document", "Birth Certificate")
    if (uploaded) {
      setBirthCertificate(uploaded)
    }
  }

  const handleAcademicRecordsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const uploadedFiles: UploadedDocument[] = []
    for (let i = 0; i < files.length; i++) {
      const uploaded = await handleFileUpload(files[i], "result", `Academic Record ${i + 1}`)
      if (uploaded) {
        uploadedFiles.push(uploaded)
      }
    }
    setAcademicRecords([...academicRecords, ...uploadedFiles])
  }

  const handleOtherDocumentsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const uploadedFiles: UploadedDocument[] = []
    for (let i = 0; i < files.length; i++) {
      const uploaded = await handleFileUpload(files[i], "document", `Document ${i + 1}`)
      if (uploaded) {
        uploadedFiles.push(uploaded)
      }
    }
    setOtherDocuments([...otherDocuments, ...uploadedFiles])
  }

  const removeDocument = (type: "birth" | "academic" | "other", index?: number) => {
    if (type === "birth") {
      setBirthCertificate(null)
    } else if (type === "academic" && index !== undefined) {
      setAcademicRecords(academicRecords.filter((_, i) => i !== index))
    } else if (type === "other" && index !== undefined) {
      setOtherDocuments(otherDocuments.filter((_, i) => i !== index))
    }
  }

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/create-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parentName,
          email: parentEmail,
          phone: parentPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create parent account")
        setLoading(false)
        return
      }

      setCredentials({
        username: data.email,
        password: data.tempPassword,
        role: "Parent",
      })
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Prepare documents object
      const documents: any = {}

      if (birthCertificate) {
        documents.birthCertificate = {
          url: birthCertificate.url,
          filename: birthCertificate.filename,
          originalName: birthCertificate.originalName,
          uploadedAt: new Date().toISOString(),
        }
      }

      if (academicRecords.length > 0) {
        documents.academicRecords = academicRecords.map(doc => ({
          url: doc.url,
          filename: doc.filename,
          originalName: doc.originalName,
          uploadedAt: new Date().toISOString(),
        }))
      }

      if (otherDocuments.length > 0) {
        documents.otherDocuments = otherDocuments.map(doc => ({
          url: doc.url,
          filename: doc.filename,
          originalName: doc.originalName,
          uploadedAt: new Date().toISOString(),
        }))
      }

      const response = await fetch("/api/admin/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: studentFirstName,
          lastName: studentLastName,
          email: studentEmail,
          gender: studentGender,
          dateOfBirth: studentDateOfBirth || undefined,
          documents: Object.keys(documents).length > 0 ? documents : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create student account")
        setLoading(false)
        return
      }

      setCredentials({
        username: data.studentNumber,
        password: data.tempPassword,
        role: "Student",
      })
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (success && credentials) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {credentials.role} Account Created Successfully!
              </h2>
              <p className="text-slate-600">
                Account credentials generated. Please save these and provide them to the {credentials.role.toLowerCase()}.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-slate-800 mb-4">Login Credentials:</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    {credentials.role === "Student" ? "Registration Number" : "Email"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={credentials.username}
                      className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(credentials.username)}
                      className="px-4 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Temporary Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={credentials.password}
                      className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(credentials.password)}
                      className="px-4 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Save these credentials in a secure location</li>
                    <li>The {credentials.role.toLowerCase()} will be required to change this password on first login</li>
                    <li>A welcome email has been sent to the {credentials.role.toLowerCase()}'s email address</li>
                    <li>Login URL: {window.location.origin}/portal/login</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3 px-4 bg-slate-200 text-slate-800 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
              >
                Create Another Account
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] transition-colors"
              >
                Print Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Create User Accounts</h1>
          <p className="text-slate-600">
            Create parent and student accounts with auto-generated secure credentials
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-4">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setAccountType("parent")
                resetForm()
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                accountType === "parent"
                  ? "border-[#3b82f6] bg-blue-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <Users className={`w-8 h-8 mx-auto mb-3 ${
                accountType === "parent" ? "text-[#3b82f6]" : "text-slate-400"
              }`} />
              <h3 className={`font-semibold text-lg ${
                accountType === "parent" ? "text-[#3b82f6]" : "text-slate-600"
              }`}>
                Parent Account
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Create account for a parent/guardian
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType("student")
                resetForm()
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                accountType === "student"
                  ? "border-[#3b82f6] bg-blue-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <GraduationCap className={`w-8 h-8 mx-auto mb-3 ${
                accountType === "student" ? "text-[#3b82f6]" : "text-slate-400"
              }`} />
              <h3 className={`font-semibold text-lg ${
                accountType === "student" ? "text-[#3b82f6]" : "text-slate-600"
              }`}>
                Student Account
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Create account for a student
              </p>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {accountType === "parent" ? (
            <form onSubmit={handleCreateParent} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Create Parent Account
              </h2>

              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="parentName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                  placeholder="John Doe"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="parentEmail" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="parentEmail"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    placeholder="parent@example.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="parentPhone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="parentPhone"
                    type="tel"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    placeholder="+263 XXX XXX XXX"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> A temporary password will be auto-generated and sent to the parent's email. They will be required to change it on first login.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    <span>Create Parent Account</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateStudent} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Create Student Account
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studentFirstName" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="studentFirstName"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    placeholder="John"
                    value={studentFirstName}
                    onChange={(e) => setStudentFirstName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="studentLastName" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="studentLastName"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    placeholder="Doe"
                    value={studentLastName}
                    onChange={(e) => setStudentLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="studentGender" className="block text-sm font-medium text-slate-700 mb-2">
                  Gender *
                </label>
                <select
                  id="studentGender"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                  value={studentGender}
                  onChange={(e) => setStudentGender(e.target.value)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studentDateOfBirth" className="block text-sm font-medium text-slate-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    id="studentDateOfBirth"
                    type="date"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    value={studentDateOfBirth}
                    onChange={(e) => setStudentDateOfBirth(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="studentEmail" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="studentEmail"
                      type="email"
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                      placeholder="student@example.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads Section */}
              <div className="bg-slate-50 rounded-xl p-6 space-y-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Documents</h3>

                {/* Birth Certificate */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Birth Certificate
                  </label>
                  {!birthCertificate ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#3b82f6] hover:bg-blue-50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (MAX. 20MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleBirthCertificateUpload}
                        disabled={uploadingFile}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-white border border-slate-300 rounded-xl">
                      <FileText className="w-8 h-8 text-[#3b82f6]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{birthCertificate.originalName}</p>
                        <p className="text-xs text-slate-500">{(birthCertificate.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument("birth")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Academic Records/Grades */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Academic Records & Grades (Previous School)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#3b82f6] hover:bg-blue-50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (MAX. 20MB each, multiple files)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleAcademicRecordsUpload}
                      disabled={uploadingFile}
                    />
                  </label>
                  {academicRecords.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {academicRecords.map((doc, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-lg">
                          <FileText className="w-6 h-6 text-[#3b82f6]" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{doc.originalName}</p>
                            <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument("academic", index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Documents */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Other Documents (Medical Records, ID, etc.)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#3b82f6] hover:bg-blue-50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, DOCX (MAX. 20MB each, multiple files)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      multiple
                      onChange={handleOtherDocumentsUpload}
                      disabled={uploadingFile}
                    />
                  </label>
                  {otherDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {otherDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-lg">
                          <FileText className="w-6 h-6 text-[#3b82f6]" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{doc.originalName}</p>
                            <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument("other", index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {uploadingFile && (
                  <div className="flex items-center gap-2 text-sm text-[#3b82f6]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading file...</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> A unique student registration number and temporary password will be auto-generated. If an email is provided, credentials will be sent to the student.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5" />
                    <span>Create Student Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
