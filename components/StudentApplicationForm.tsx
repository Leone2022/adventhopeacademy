"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  FileText,
  User,
  GraduationCap,
  Heart,
  Users,
  Phone,
  Calendar,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react"

interface FormProps {
  mode: "apply" | "admin" // 'apply' = public, 'admin' = dashboard
  onSuccess?: (result: { applicationNumber?: string; studentNumber?: string }) => void
}

interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

interface UploadedFile {
  url: string
  filename: string
  originalName: string
}

const GRADE_OPTIONS = [
  { value: "ECD_A", label: "ECD A" },
  { value: "ECD_B", label: "ECD B" },
  { value: "GRADE_1", label: "Grade 1" },
  { value: "GRADE_2", label: "Grade 2" },
  { value: "GRADE_3", label: "Grade 3" },
  { value: "GRADE_4", label: "Grade 4" },
  { value: "GRADE_5", label: "Grade 5" },
  { value: "GRADE_6", label: "Grade 6" },
  { value: "GRADE_7", label: "Grade 7" },
  { value: "FORM_1", label: "Form 1" },
  { value: "FORM_2", label: "Form 2" },
  { value: "FORM_3", label: "Form 3" },
  { value: "FORM_4", label: "Form 4" },
  { value: "LOWER_6", label: "Lower 6 (AS Level)" },
  { value: "UPPER_6", label: "Upper 6 (A Level)" },
]

export default function StudentApplicationForm({ mode, onSuccess }: FormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fileUploading, setFileUploading] = useState(false)

  const [formData, setFormData] = useState({
    // Student Information
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "MALE",
    nationalId: "",
    birthCertNumber: "",
    religion: "",
    email: "",
    phone: "",
    address: "",

    // Academic Information
    curriculum: "ZIMSEC",
    gradeApplying: "",
    previousSchool: "",
    previousGrade: "",
    transferReason: "",

    // Former Primary School
    formerPrimarySchool: "",
    formerPrimarySchoolAddress: "",
    formerPrimarySchoolContact: "",
    formerPrimaryGrade: "",

    // Medical Information
    bloodGroup: "",
    allergies: "",
    medicalConditions: "",

    // Parent/Guardian
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    parentRelationship: "Parent",
    parentOccupation: "",
    parentEmployer: "",

    // Accommodation
    isBoarding: false,

    // Activities
    specialTalents: "",
    clubsInterests: "",
  })

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: "", relationship: "", phone: "" },
  ])

  const [uploadedFiles, setUploadedFiles] = useState<{
    birthCert?: UploadedFile
    reportCard?: UploadedFile
    otherDocs: UploadedFile[]
  }>({
    otherDocs: [],
  })

  const steps =
    mode === "apply"
      ? [
          { number: 1, title: "Student Info", icon: User },
          { number: 2, title: "Academics", icon: GraduationCap },
          { number: 3, title: "Parent/Guardian", icon: Users },
          { number: 4, title: "Medical & Activities", icon: Heart },
          { number: 5, title: "Documents", icon: FileText },
          { number: 6, title: "Review & Submit", icon: CheckCircle },
        ]
      : [
          { number: 1, title: "Student Info", icon: User },
          { number: 2, title: "Academics", icon: GraduationCap },
          { number: 3, title: "Parent/Guardian", icon: Users },
          { number: 4, title: "Medical & Activities", icon: Heart },
          { number: 5, title: "Documents", icon: FileText },
          { number: 6, title: "Review & Save", icon: CheckCircle },
        ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleEmergencyChange = (index: number, field: string, value: string) => {
    setEmergencyContacts((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addEmergencyContact = () => {
    setEmergencyContacts((prev) => [...prev, { name: "", relationship: "", phone: "" }])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileUploading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("file", file)
      formDataObj.append("type", "document")
      formDataObj.append("documentName", fileType)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      })

      const data = await response.json()
      if (response.ok) {
        if (fileType === "Birth Certificate") {
          setUploadedFiles((prev) => ({ ...prev, birthCert: data }))
        } else if (fileType === "Report Card") {
          setUploadedFiles((prev) => ({ ...prev, reportCard: data }))
        } else {
          setUploadedFiles((prev) => ({ ...prev, otherDocs: [...prev.otherDocs, data] }))
        }
      } else {
        setError(data.error || "Failed to upload file")
      }
    } catch (err) {
      setError("Failed to upload file")
    } finally {
      setFileUploading(false)
    }
  }

  const removeFile = (fileType: string, index?: number) => {
    if (fileType === "Birth Certificate") {
      setUploadedFiles((prev) => ({ ...prev, birthCert: undefined }))
    } else if (fileType === "Report Card") {
      setUploadedFiles((prev) => ({ ...prev, reportCard: undefined }))
    } else if (index !== undefined) {
      setUploadedFiles((prev) => ({
        ...prev,
        otherDocs: prev.otherDocs.filter((_, i) => i !== index),
      }))
    }
  }

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.nationalId) {
        setError("Please fill in all required fields (Name, DOB, National ID)")
        return false
      }
    } else if (currentStep === 2) {
      if (!formData.gradeApplying) {
        setError("Please select the grade you are applying for")
        return false
      }
    } else if (currentStep === 3) {
      if (!formData.parentName || !formData.parentEmail || !formData.parentPhone) {
        setError("Please fill in all parent/guardian information")
        return false
      }
    }
    setError("")
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const validEmergencyContacts = emergencyContacts.filter((c) => c.name && c.phone)
      const endpoint = mode === "apply" ? "/api/apply" : "/api/admin/create-student"

      const payload =
        mode === "apply"
          ? {
              ...formData,
              emergencyContacts: validEmergencyContacts.length > 0 ? validEmergencyContacts : null,
              documents: uploadedFiles,
            }
          : {
              firstName: formData.firstName,
              lastName: formData.lastName,
              middleName: formData.middleName,
              dateOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              nationalId: formData.nationalId,
              birthCertNumber: formData.birthCertNumber,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              curriculum: formData.curriculum,
              gradeApplying: formData.gradeApplying,
              previousSchool: formData.previousSchool,
              previousGrade: formData.previousGrade,
              bloodGroup: formData.bloodGroup,
              allergies: formData.allergies,
              medicalConditions: formData.medicalConditions,
              isBoarding: formData.isBoarding,
              religion: formData.religion,
              documents: uploadedFiles,
              parentInfo: {
                firstName: formData.parentName.split(" ")[0],
                lastName: formData.parentName.split(" ").slice(1).join(" "),
                email: formData.parentEmail,
                phone: formData.parentPhone,
              },
              emergencyContacts: validEmergencyContacts.length > 0 ? validEmergencyContacts : null,
            }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit")
      }

      if (mode === "apply") {
        onSuccess?.({ applicationNumber: data.applicationNumber })
      } else {
        onSuccess?.({ studentNumber: data.studentNumber })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-shrink-0">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= step.number ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      currentStep > step.number
                        ? "bg-blue-600 text-white"
                        : currentStep === step.number
                          ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium whitespace-nowrap">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 flex-shrink-0 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8">
              {error && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Step 1: Student Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Student Information</h2>
                    <p className="text-slate-600">Please provide the student's personal details</p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Middle name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="student@email.com (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="+263 77 123 4567 (optional)"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Residential Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="Full residential address"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        National ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Required for finance/boarding linkage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Birth Certificate Number
                      </label>
                      <input
                        type="text"
                        name="birthCertNumber"
                        value={formData.birthCertNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Birth cert number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Religion
                      </label>
                      <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., Christianity"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Academic Information</h2>
                    <p className="text-slate-600">Please provide academic background</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Curriculum <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="curriculum"
                        value={formData.curriculum}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="ZIMSEC">ZIMSEC</option>
                        <option value="CAMBRIDGE">Cambridge</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Grade Applying For <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gradeApplying"
                        value={formData.gradeApplying}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select Grade/Form</option>
                        {GRADE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Previous School
                      </label>
                      <input
                        type="text"
                        name="previousSchool"
                        value={formData.previousSchool}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="School name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Previous Grade/Form
                      </label>
                      <input
                        type="text"
                        name="previousGrade"
                        value={formData.previousGrade}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., Grade 6, Form 2"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Former Primary School (Optional)</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          School Name
                        </label>
                        <input
                          type="text"
                          name="formerPrimarySchool"
                          value={formData.formerPrimarySchool}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Primary school name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          name="formerPrimarySchoolContact"
                          value={formData.formerPrimarySchoolContact}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Contact number"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          School Address
                        </label>
                        <input
                          type="text"
                          name="formerPrimarySchoolAddress"
                          value={formData.formerPrimarySchoolAddress}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="School address"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isBoarding"
                        checked={formData.isBoarding}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-slate-800">Apply for Boarding</span>
                        <p className="text-sm text-slate-600">
                          Check if the student requires hostel accommodation
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Parent/Guardian Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Parent/Guardian Information</h2>
                    <p className="text-slate-600">Please provide parent or guardian contact details</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Relationship
                      </label>
                      <select
                        name="parentRelationship"
                        value={formData.parentRelationship}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Parent">Parent</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="parent@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="+263 77 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="parentOccupation"
                        value={formData.parentOccupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Occupation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Employer
                      </label>
                      <input
                        type="text"
                        name="parentEmployer"
                        value={formData.parentEmployer}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Company/Organization"
                      />
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-800">Emergency Contacts</h3>
                      <button
                        type="button"
                        onClick={addEmergencyContact}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add Another
                      </button>
                    </div>
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="grid sm:grid-cols-3 gap-4 mb-4">
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleEmergencyChange(index, "name", e.target.value)}
                          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Full Name"
                        />
                        <input
                          type="text"
                          value={contact.relationship}
                          onChange={(e) => handleEmergencyChange(index, "relationship", e.target.value)}
                          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Relationship"
                        />
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => handleEmergencyChange(index, "phone", e.target.value)}
                          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Phone Number"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Medical & Activities */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Medical Information & Activities</h2>
                    <p className="text-slate-600">Health and interests information</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Known Allergies
                    </label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="List any known allergies (food, medication, environmental, etc.)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Medical Conditions
                    </label>
                    <textarea
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="List any medical conditions or ongoing treatments"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Activities & Interests</h3>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Special Talents
                      </label>
                      <textarea
                        name="specialTalents"
                        value={formData.specialTalents}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="e.g., Music, Art, Sports, etc."
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Clubs & Interests
                      </label>
                      <textarea
                        name="clubsInterests"
                        value={formData.clubsInterests}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="e.g., Debate, Science Club, Chess, etc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Documents */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Documents (Optional)</h2>
                    <p className="text-slate-600">
                      Upload documents if available, or bring physical copies to school
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      📋 <strong>Note:</strong> Document uploads are optional. Physical copies of birth
                      certificates, report cards, and ID documents are welcome and can be brought to school
                      during registration.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Birth Certificate */}
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                      <h3 className="font-semibold text-slate-800 mb-3">Birth Certificate (Optional)</h3>
                      {uploadedFiles.birthCert ? (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-slate-700">{uploadedFiles.birthCert.originalName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile("Birth Certificate")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 cursor-pointer">
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">Click to upload (PDF, PNG, JPEG)</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
                            onChange={(e) => handleFileUpload(e, "Birth Certificate")}
                            disabled={fileUploading}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Report Card */}
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                      <h3 className="font-semibold text-slate-800 mb-3">Report Card (Optional)</h3>
                      {uploadedFiles.reportCard ? (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-slate-700">{uploadedFiles.reportCard.originalName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile("Report Card")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 cursor-pointer">
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">Click to upload (PDF, PNG, JPEG)</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
                            onChange={(e) => handleFileUpload(e, "Report Card")}
                            disabled={fileUploading}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Other Documents */}
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                      <h3 className="font-semibold text-slate-800 mb-3">Other Documents (Optional)</h3>
                      <div className="space-y-2 mb-4">
                        {uploadedFiles.otherDocs.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className="text-sm text-slate-700">{doc.originalName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile("Other", index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <label className="flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-600">Click to add documents (PDF, PNG, JPEG, DOCX, XLSX)</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
                          onChange={(e) => handleFileUpload(e, "Other Document")}
                          disabled={fileUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Review & Submit */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Review & Submit</h2>
                    <p className="text-slate-600">Please review your information before submitting</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-800 mb-2">Student Information</h3>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="text-slate-600">Name:</span> {formData.firstName} {formData.lastName}
                        </p>
                        <p>
                          <span className="text-slate-600">DOB:</span> {formData.dateOfBirth}
                        </p>
                        <p>
                          <span className="text-slate-600">Grade:</span> {formData.gradeApplying}
                        </p>
                        <p>
                          <span className="text-slate-600">Curriculum:</span> {formData.curriculum}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-800 mb-2">Parent/Guardian</h3>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="text-slate-600">Name:</span> {formData.parentName}
                        </p>
                        <p>
                          <span className="text-slate-600">Email:</span> {formData.parentEmail}
                        </p>
                        <p>
                          <span className="text-slate-600">Phone:</span> {formData.parentPhone}
                        </p>
                      </div>
                    </div>

                    {(uploadedFiles.birthCert ||
                      uploadedFiles.reportCard ||
                      uploadedFiles.otherDocs.length > 0) && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h3 className="font-semibold text-slate-800 mb-2">Uploaded Documents</h3>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {uploadedFiles.birthCert && (
                            <li>✓ Birth Certificate: {uploadedFiles.birthCert.originalName}</li>
                          )}
                          {uploadedFiles.reportCard && (
                            <li>✓ Report Card: {uploadedFiles.reportCard.originalName}</li>
                          )}
                          {uploadedFiles.otherDocs.map((doc, idx) => (
                            <li key={idx}>✓ {doc.originalName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="bg-slate-50 px-6 sm:px-8 py-4 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || fileUploading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "apply" ? "Submit Application" : "Save Student"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
