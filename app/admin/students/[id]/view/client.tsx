"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  User,
  Heart,
  AlertCircle,
  DollarSign,
  FileSpreadsheet,
  Table as TableIcon,
  File,
  Eye,
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType } from "docx"
import { saveAs } from "file-saver"

interface StudentData {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  middleName?: string | null
  gender: string
  dateOfBirth: string
  email?: string | null
  phone?: string | null
  photo?: string | null
  nationalId?: string | null
  birthCertNumber?: string | null
  status: string
  admissionDate: string
  address?: string | null
  bloodGroup?: string | null
  allergies?: string | null
  medicalConditions?: string | null
  previousSchool?: string | null
  previousGrade?: string | null
  curriculum: string
  isBoarding: boolean
  currentClass: {
    id: string
    name: string
    level: string
  } | null
  account: {
    balance: number
    lastPaymentDate?: string | null
    lastPaymentAmount?: number | null
  } | null
  school: {
    name: string
    email?: string | null
    phone?: string | null
  }
  parents: Array<{
    id: string
    name: string
    email?: string | null
    phone?: string | null
    relationship: string
    isPrimary: boolean
    occupation?: string | null
    employer?: string | null
    workPhone?: string | null
  }>
  documents?: any
  userActive: boolean
  userEmail?: string | null
  grades: Array<{
    id: string
    subject: string
    score: number
    term: string
    academicYear: string
  }>
  attendance: Array<{
    id: string
    date: string
    status: string
    remarks?: string | null
  }>
}

interface StudentViewClientProps {
  student: StudentData
}

export default function StudentViewClient({ student }: StudentViewClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "documents">("personal")

  const fullName = `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim()

  // Export individual student data to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    const margin = 14
    const pageWidth = doc.internal.pageSize.getWidth()

    // School header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Advent Hope Academy", margin, 18)

    doc.setFontSize(13)
    doc.setFont("helvetica", "normal")
    doc.text("Student Record", margin, 26)

    // Divider
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.line(margin, 30, pageWidth - margin, 30)

    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, margin, 36)
    doc.setTextColor(0, 0, 0)

    // Student Information
    doc.setFontSize(14)
    doc.text("Personal Information", margin, 47)

    const personalData = [
      ["Student Number", student.studentNumber],
      ["Full Name", fullName],
      ["Gender", student.gender],
      ["Date of Birth", new Date(student.dateOfBirth).toLocaleDateString()],
      ["Email", student.email || "N/A"],
      ["Phone", student.phone || "N/A"],
      ["Address", student.address || "N/A"],
      ["Blood Group", student.bloodGroup || "N/A"],
      ["Status", student.status],
      ["Admission Date", new Date(student.admissionDate).toLocaleDateString()],
      ["Current Class", student.currentClass?.name || "N/A"],
      ["Curriculum", student.curriculum],
      ["Boarding", student.isBoarding ? "Yes" : "No"],
    ]

    autoTable(doc, {
      body: personalData,
      startY: 52,
      theme: "grid",
      styles: { fontSize: 9 },
    })

    // Parents Information
    let finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.text("Parent/Guardian Information", 14, finalY)

    if (student.parents.length > 0) {
      const parentsData = student.parents.map((parent) => [
        parent.name,
        parent.relationship,
        parent.email || "N/A",
        parent.phone || "N/A",
        parent.isPrimary ? "Primary" : "Secondary",
      ])

      autoTable(doc, {
        head: [["Name", "Relationship", "Email", "Phone", "Type"]],
        body: parentsData,
        startY: finalY + 5,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
      })
      finalY = (doc as any).lastAutoTable.finalY + 10
    }

    // Medical Information
    if (student.allergies || student.medicalConditions) {
      doc.setFontSize(14)
      doc.text("Medical Information", 14, finalY)

      const medicalData = []
      if (student.allergies) medicalData.push(["Allergies", student.allergies])
      if (student.medicalConditions) medicalData.push(["Medical Conditions", student.medicalConditions])

      autoTable(doc, {
        body: medicalData,
        startY: finalY + 5,
        theme: "grid",
        styles: { fontSize: 9 },
      })
      finalY = (doc as any).lastAutoTable.finalY + 10
    }

    // Account Information
    if (student.account) {
      doc.setFontSize(14)
      doc.text("Financial Information", 14, finalY)

      const accountData = [
        ["Current Balance", `$${Number(student.account.balance).toFixed(2)}`],
        [
          "Last Payment Date",
          student.account.lastPaymentDate
            ? new Date(student.account.lastPaymentDate).toLocaleDateString()
            : "N/A",
        ],
        [
          "Last Payment Amount",
          student.account.lastPaymentAmount
            ? `$${student.account.lastPaymentAmount.toFixed(2)}`
            : "N/A",
        ],
      ]

      autoTable(doc, {
        body: accountData,
        startY: finalY + 5,
        theme: "grid",
        styles: { fontSize: 9 },
      })
    }

    // Add footer to all pages
    const totalPages = (doc as any).internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text("Advent Hope Academy - Confidential", margin, pageHeight - 5)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: "right" })
      doc.setTextColor(0, 0, 0)
    }

    doc.save(`student_${student.studentNumber}_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  // Export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new()

    // Personal Information Sheet
    const personalData = [
      ["Student Number", student.studentNumber],
      ["Full Name", fullName],
      ["Gender", student.gender],
      ["Date of Birth", new Date(student.dateOfBirth).toLocaleDateString()],
      ["Email", student.email || ""],
      ["Phone", student.phone || ""],
      ["Address", student.address || ""],
      ["Blood Group", student.bloodGroup || ""],
      ["Allergies", student.allergies || ""],
      ["Medical Conditions", student.medicalConditions || ""],
      ["Status", student.status],
      ["Admission Date", new Date(student.admissionDate).toLocaleDateString()],
      ["Current Class", student.currentClass?.name || ""],
      ["Curriculum", student.curriculum],
      ["Boarding", student.isBoarding ? "Yes" : "No"],
      ["National ID", student.nationalId || ""],
      ["Birth Certificate Number", student.birthCertNumber || ""],
    ]

    const personalSheet = XLSX.utils.aoa_to_sheet(personalData)
    XLSX.utils.book_append_sheet(workbook, personalSheet, "Personal Info")

    // Parents Sheet
    if (student.parents.length > 0) {
      const parentsData = [
        ["Name", "Relationship", "Email", "Phone", "Primary Contact", "Occupation", "Employer", "Work Phone"],
        ...student.parents.map((parent) => [
          parent.name,
          parent.relationship,
          parent.email || "",
          parent.phone || "",
          parent.isPrimary ? "Yes" : "No",
          parent.occupation || "",
          parent.employer || "",
          parent.workPhone || "",
        ]),
      ]

      const parentsSheet = XLSX.utils.aoa_to_sheet(parentsData)
      XLSX.utils.book_append_sheet(workbook, parentsSheet, "Parents")
    }

    // Grades Sheet
    if (student.grades.length > 0) {
      const gradesData = [
        ["Subject", "Score", "Term", "Academic Year"],
        ...student.grades.map((grade) => [
          grade.subject,
          grade.score,
          grade.term,
          grade.academicYear,
        ]),
      ]

      const gradesSheet = XLSX.utils.aoa_to_sheet(gradesData)
      XLSX.utils.book_append_sheet(workbook, gradesSheet, "Grades")
    }

    // Attendance Sheet
    if (student.attendance.length > 0) {
      const attendanceData = [
        ["Date", "Status", "Remarks"],
        ...student.attendance.map((att) => [
          new Date(att.date).toLocaleDateString(),
          att.status,
          att.remarks || "",
        ]),
      ]

      const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData)
      XLSX.utils.book_append_sheet(workbook, attendanceSheet, "Attendance")
    }

    // Account Sheet
    if (student.account) {
      const accountData = [
        ["Current Balance", student.account.balance],
        [
          "Last Payment Date",
          student.account.lastPaymentDate
            ? new Date(student.account.lastPaymentDate).toLocaleDateString()
            : "",
        ],
        ["Last Payment Amount", student.account.lastPaymentAmount || 0],
      ]

      const accountSheet = XLSX.utils.aoa_to_sheet(accountData)
      XLSX.utils.book_append_sheet(workbook, accountSheet, "Financial")
    }

    XLSX.writeFile(
      workbook,
      `student_${student.studentNumber}_${new Date().toISOString().split("T")[0]}.xlsx`
    )
  }

  // Export to Word
  const exportToWord = async () => {
    const sections: Paragraph[] = []

    // Title
    sections.push(
      new Paragraph({
        text: "Student Record",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )

    sections.push(
      new Paragraph({
        text: student.school.name,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )

    sections.push(
      new Paragraph({
        text: `Generated: ${new Date().toLocaleDateString()}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    )

    // Personal Information
    sections.push(
      new Paragraph({
        text: "Personal Information",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 },
      })
    )

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Student Number: ", bold: true }),
          new TextRun(student.studentNumber),
        ],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Full Name: ", bold: true }), new TextRun(fullName)],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Gender: ", bold: true }), new TextRun(student.gender)],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Date of Birth: ", bold: true }),
          new TextRun(new Date(student.dateOfBirth).toLocaleDateString()),
        ],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Email: ", bold: true }),
          new TextRun(student.email || "N/A"),
        ],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Phone: ", bold: true }),
          new TextRun(student.phone || "N/A"),
        ],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Address: ", bold: true }),
          new TextRun(student.address || "N/A"),
        ],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Status: ", bold: true }), new TextRun(student.status)],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Current Class: ", bold: true }),
          new TextRun(student.currentClass?.name || "N/A"),
        ],
        spacing: { after: 100 },
      })
    )

    // Parents Information
    if (student.parents.length > 0) {
      sections.push(
        new Paragraph({
          text: "Parent/Guardian Information",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      )

      student.parents.forEach((parent, index) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Parent ${index + 1}: `, bold: true }),
              new TextRun(parent.name),
            ],
            spacing: { after: 100 },
          })
        )

        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: "  Relationship: ", bold: true }),
              new TextRun(parent.relationship),
            ],
            spacing: { after: 100 },
          })
        )

        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: "  Email: ", bold: true }),
              new TextRun(parent.email || "N/A"),
            ],
            spacing: { after: 100 },
          })
        )

        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: "  Phone: ", bold: true }),
              new TextRun(parent.phone || "N/A"),
            ],
            spacing: { after: 200 },
          })
        )
      })
    }

    // Medical Information
    if (student.allergies || student.medicalConditions) {
      sections.push(
        new Paragraph({
          text: "Medical Information",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      )

      if (student.allergies) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Allergies: ", bold: true }),
              new TextRun(student.allergies),
            ],
            spacing: { after: 100 },
          })
        )
      }

      if (student.medicalConditions) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Medical Conditions: ", bold: true }),
              new TextRun(student.medicalConditions),
            ],
            spacing: { after: 100 },
          })
        )
      }
    }

    const doc = new Document({
      sections: [
        {
          children: sections,
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `student_${student.studentNumber}_${new Date().toISOString().split("T")[0]}.docx`)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin/students")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Students</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Student Details</h1>
              <p className="text-slate-600">{fullName}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                <span>PDF</span>
              </button>

              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Excel</span>
              </button>

              <button
                onClick={exportToWord}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <TableIcon className="w-5 h-5" />
                <span>Word</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("personal")}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === "personal"
                    ? "border-[#3b82f6] text-[#3b82f6]"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Personal Information</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("academic")}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === "academic"
                    ? "border-[#3b82f6] text-[#3b82f6]"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-medium">Academic & Attendance</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("documents")}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === "documents"
                    ? "border-[#3b82f6] text-[#3b82f6]"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <File className="w-5 h-5" />
                  <span className="font-medium">Documents</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "personal" && (
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-slate-600">Student Number</label>
                      <p className="text-base font-medium text-slate-800 mt-1">
                        {student.studentNumber}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Full Name</label>
                      <p className="text-base font-medium text-slate-800 mt-1">{fullName}</p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Gender</label>
                      <p className="text-base font-medium text-slate-800 mt-1">{student.gender}</p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Date of Birth</label>
                      <p className="text-base font-medium text-slate-800 mt-1">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Email</label>
                      <p className="text-base font-medium text-slate-800 mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {student.email || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Phone</label>
                      <p className="text-base font-medium text-slate-800 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {student.phone || "N/A"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-600">Address</label>
                      <p className="text-base font-medium text-slate-800 mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {student.address || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Status</label>
                      <p className="text-base font-medium text-slate-800 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Admission Date</label>
                      <p className="text-base font-medium text-slate-800 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(student.admissionDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Current Class</label>
                      <p className="text-base font-medium text-slate-800 mt-1">
                        {student.currentClass?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Curriculum</label>
                      <p className="text-base font-medium text-slate-800 mt-1">{student.curriculum}</p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Boarding Student</label>
                      <p className="text-base font-medium text-slate-800 mt-1">
                        {student.isBoarding ? "Yes" : "No"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">National ID</label>
                      <p className="text-base font-medium text-slate-800 mt-1">
                        {student.nationalId || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Birth Certificate Number</label>
                      <p className="text-base font-medium text-slate-800 mt-1">
                        {student.birthCertNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-slate-600">Blood Group</label>
                      <p className="text-base font-medium text-slate-800 mt-1">
                        {student.bloodGroup || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Allergies</label>
                      <p className="text-base font-medium text-slate-800 mt-1 flex items-start gap-2">
                        {student.allergies ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                            {student.allergies}
                          </>
                        ) : (
                          "None"
                        )}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-600">Medical Conditions</label>
                      <p className="text-base font-medium text-slate-800 mt-1 flex items-start gap-2">
                        {student.medicalConditions ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                            {student.medicalConditions}
                          </>
                        ) : (
                          "None"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parents Information */}
                {student.parents.length > 0 && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Parents/Guardians
                    </h3>
                    <div className="space-y-4">
                      {student.parents.map((parent, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-slate-800">{parent.name}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                parent.isPrimary
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {parent.isPrimary ? "Primary Contact" : "Secondary Contact"}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <p className="text-slate-600">
                              <span className="font-medium">Relationship:</span> {parent.relationship}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium">Email:</span> {parent.email || "N/A"}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium">Phone:</span> {parent.phone || "N/A"}
                            </p>
                            <p className="text-slate-600">
                              <span className="font-medium">Occupation:</span>{" "}
                              {parent.occupation || "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Information */}
                {student.account && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Financial Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="text-sm text-slate-600">Current Balance</label>
                        <p className="text-2xl font-bold text-slate-800 mt-1">
                          ${Number(student.account.balance).toFixed(2)}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="text-sm text-slate-600">Last Payment Date</label>
                        <p className="text-base font-medium text-slate-800 mt-1">
                          {student.account.lastPaymentDate
                            ? new Date(student.account.lastPaymentDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="text-sm text-slate-600">Last Payment Amount</label>
                        <p className="text-base font-medium text-slate-800 mt-1">
                          {student.account.lastPaymentAmount
                            ? `$${student.account.lastPaymentAmount.toFixed(2)}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "academic" && (
              <div className="space-y-8">
                {/* Recent Grades */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Grades</h3>
                  {student.grades.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                              Subject
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                              Score
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                              Term
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                              Academic Year
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {student.grades.map((grade) => (
                            <tr key={grade.id}>
                              <td className="px-4 py-3 text-sm text-slate-800">{grade.subject}</td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                {grade.score}%
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">{grade.term}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {grade.academicYear}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-center py-8">No grades recorded yet</p>
                  )}
                </div>

                {/* Recent Attendance */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Attendance</h3>
                  {student.attendance.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                              Date
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                              Status
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {student.attendance.map((att) => (
                            <tr key={att.id}>
                              <td className="px-4 py-3 text-sm text-slate-800">
                                {new Date(att.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    att.status === "PRESENT"
                                      ? "bg-green-100 text-green-800"
                                      : att.status === "ABSENT"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {att.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {att.remarks || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-center py-8">No attendance records yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Uploaded Documents</h3>
                {student.documents ? (
                  <div className="space-y-4">
                    {student.documents.birthCertificate && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-[#3b82f6]" />
                            <div>
                              <p className="font-medium text-slate-800">
                                {student.documents.birthCertificate.originalName}
                              </p>
                              <p className="text-sm text-slate-500">Birth Certificate</p>
                            </div>
                          </div>
                          <a
                            href={student.documents.birthCertificate.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {student.documents.academicRecords &&
                      Array.isArray(student.documents.academicRecords) &&
                      student.documents.academicRecords.map((doc: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-green-600" />
                              <div>
                                <p className="font-medium text-slate-800">{doc.originalName}</p>
                                <p className="text-sm text-slate-500">Academic Record</p>
                              </div>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </a>
                          </div>
                        </div>
                      ))}

                    {student.documents.otherDocuments &&
                      Array.isArray(student.documents.otherDocuments) &&
                      student.documents.otherDocuments.map((doc: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-purple-600" />
                              <div>
                                <p className="font-medium text-slate-800">{doc.originalName}</p>
                                <p className="text-sm text-slate-500">Other Document</p>
                              </div>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No documents uploaded yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
