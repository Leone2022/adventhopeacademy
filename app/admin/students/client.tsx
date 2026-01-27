"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Download,
  FileText,
  Table as TableIcon,
  FileSpreadsheet,
  Eye,
  Filter,
  X,
  Users,
  GraduationCap,
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun } from "docx"
import { saveAs } from "file-saver"

interface Student {
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
  status: string
  admissionDate: string
  currentClass: {
    id: string
    name: string
    level: string
  } | null
  account: {
    balance: number
  } | null
  parents: Array<{
    name: string
    email?: string | null
    phone?: string | null
    relationship: string
    isPrimary: boolean
  }>
  userActive: boolean
  documents?: any
  address?: string | null
  bloodGroup?: string | null
  allergies?: string | null
  medicalConditions?: string | null
  previousSchool?: string | null
  curriculum: string
  isBoarding: boolean
}

interface StudentsListClientProps {
  students: Student[]
}

export default function StudentsListClient({ students }: StudentsListClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [classFilter, setClassFilter] = useState<string>("ALL")
  const [genderFilter, setGenderFilter] = useState<string>("ALL")
  const [showFilters, setShowFilters] = useState(false)

  // Get unique classes for filter
  const classes = useMemo(() => {
    const uniqueClasses = new Set<string>()
    students.forEach((s) => {
      if (s.currentClass) {
        uniqueClasses.add(s.currentClass.name)
      }
    })
    return Array.from(uniqueClasses).sort()
  }, [students])

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchTerm === "" ||
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "ALL" || student.status === statusFilter
      const matchesClass =
        classFilter === "ALL" || student.currentClass?.name === classFilter
      const matchesGender = genderFilter === "ALL" || student.gender === genderFilter

      return matchesSearch && matchesStatus && matchesClass && matchesGender
    })
  }, [students, searchTerm, statusFilter, classFilter, genderFilter])

  // Statistics
  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter((s) => s.status === "ACTIVE").length,
      male: students.filter((s) => s.gender === "MALE").length,
      female: students.filter((s) => s.gender === "FEMALE").length,
    }
  }, [students])

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text("Advent Hope Academy - Student List", 14, 20)

    // Date
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Total Students: ${filteredStudents.length}`, 14, 34)

    // Table
    const tableData = filteredStudents.map((student) => [
      student.studentNumber,
      `${student.firstName} ${student.lastName}`,
      student.gender,
      new Date(student.dateOfBirth).toLocaleDateString(),
      student.currentClass?.name || "N/A",
      student.status,
      student.email || "N/A",
      student.phone || "N/A",
    ])

    autoTable(doc, {
      head: [["Student #", "Name", "Gender", "DOB", "Class", "Status", "Email", "Phone"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save(`students_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredStudents.map((student) => ({
      "Student Number": student.studentNumber,
      "First Name": student.firstName,
      "Last Name": student.lastName,
      "Gender": student.gender,
      "Date of Birth": new Date(student.dateOfBirth).toLocaleDateString(),
      "Email": student.email || "",
      "Phone": student.phone || "",
      "Class": student.currentClass?.name || "",
      "Status": student.status,
      "Admission Date": new Date(student.admissionDate).toLocaleDateString(),
      "Account Balance": student.account?.balance || 0,
      "Address": student.address || "",
      "Blood Group": student.bloodGroup || "",
      "Allergies": student.allergies || "",
      "Medical Conditions": student.medicalConditions || "",
      "Previous School": student.previousSchool || "",
      "Curriculum": student.curriculum,
      "Boarding": student.isBoarding ? "Yes" : "No",
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students")

    // Set column widths
    const colWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 },
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 },
      { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 30 }, { wch: 30 },
      { wch: 30 }, { wch: 10 }, { wch: 10 },
    ]
    worksheet["!cols"] = colWidths

    XLSX.writeFile(workbook, `students_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  // Export to Word
  const exportToWord = async () => {
    const rows = filteredStudents.map(
      (student) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(student.studentNumber)],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(`${student.firstName} ${student.lastName}`)],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(student.gender)],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(new Date(student.dateOfBirth).toLocaleDateString())],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(student.currentClass?.name || "N/A")],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(student.status)],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(student.email || "N/A")],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
          ],
        })
    )

    const table = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Student #", bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Name", bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Gender", bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Date of Birth", bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Class", bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 15, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Status", bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Email", bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        ...rows,
      ],
    })

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Advent Hope Academy - Student List",
              heading: "Heading1",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated: ${new Date().toLocaleDateString()}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Total Students: ${filteredStudents.length}`,
                  size: 20,
                }),
              ],
              spacing: { after: 400 },
            }),
            table,
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `students_${new Date().toISOString().split("T")[0]}.docx`)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Student Management</h1>
          <p className="text-slate-600">View, search, and export student records</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Students</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-800">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Male</p>
                <p className="text-2xl font-bold text-slate-800">{stats.male}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Female</p>
                <p className="text-2xl font-bold text-slate-800">{stats.female}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, student number, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>

              <button
                onClick={exportToPDF}
                className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                <span>PDF</span>
              </button>

              <button
                onClick={exportToExcel}
                className="px-4 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Excel</span>
              </button>

              <button
                onClick={exportToWord}
                className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <TableIcon className="w-5 h-5" />
                <span>Word</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="GRADUATED">Graduated</option>
                    <option value="TRANSFERRED">Transferred</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Class
                  </label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  >
                    <option value="ALL">All Classes</option>
                    {classes.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setStatusFilter("ALL")
                    setClassFilter("ALL")
                    setGenderFilter("ALL")
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{filteredStudents.length}</span> of{" "}
            <span className="font-semibold">{students.length}</span> students
          </p>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Student #
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Gender
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Class
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-600">No students found</p>
                        <p className="text-sm text-slate-500">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {student.studentNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {student.firstName} {student.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{student.gender}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">
                          {student.currentClass?.name || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : student.status === "INACTIVE"
                              ? "bg-gray-100 text-gray-800"
                              : student.status === "GRADUATED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{student.email || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/students/${student.id}/view`)}
                          className="px-3 py-1.5 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors flex items-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
