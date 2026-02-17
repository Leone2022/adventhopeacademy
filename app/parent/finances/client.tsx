"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import {
  User,
  GraduationCap,
  FileText,
  DollarSign,
  LogOut,
  Menu,
  X,
  Home,
  Mail,
  Calendar,
  Bell,
  Download,
  TrendingUp,
  TrendingDown,
  Percent,
  Receipt,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface ChildFinance {
  id: string
  firstName: string
  lastName: string
  studentNumber: string
  curriculum: string
  className: string
  balance: number
  lastPaymentDate: string | null
  lastPaymentAmount: number | null
}

interface TransactionData {
  id: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  reference: string | null
  paymentMethod: string | null
  processedAt: string
  receiptNumber: string | null
}

interface FinancialSummary {
  totalCharges: number
  totalPayments: number
  currentBalance: number
  percentagePaid: number
}

interface Props {
  parentName: string
  children: ChildFinance[]
}

export default function ParentFinancesClient({ parentName, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<ChildFinance | null>(null)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loadingStatement, setLoadingStatement] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/portal/login" })
  }

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const viewChildStatement = async (child: ChildFinance) => {
    setSelectedChild(child)
    setLoadingStatement(true)

    try {
      const response = await fetch(`/api/parent/children/${child.id}/finances`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load financial data")
      }

      setTransactions(data.transactions || [])
      setSummary(data.summary || null)
    } catch (err) {
      console.error("Error loading statement:", err)
      setTransactions([])
      setSummary(null)
    } finally {
      setLoadingStatement(false)
    }
  }

  const exportStatementPDF = () => {
    if (!selectedChild || !summary) return

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15

    // Header
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Advent Hope Academy", margin, margin + 6)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Student Financial Statement", margin, margin + 13)

    // Blue divider
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.line(margin, margin + 17, pageWidth - margin, margin + 17)

    // Student info
    let y = margin + 24
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(
      `Student: ${selectedChild.firstName} ${selectedChild.lastName}`,
      margin,
      y
    )
    doc.setFont("helvetica", "normal")
    doc.text(`Student #: ${selectedChild.studentNumber}`, margin, y + 5)
    doc.text(`Class: ${selectedChild.className}`, margin, y + 10)
    doc.text(`Curriculum: ${selectedChild.curriculum}`, margin, y + 15)

    // Summary
    doc.setFont("helvetica", "bold")
    doc.text(
      `Total Charged: ${formatCurrency(summary.totalCharges)}`,
      pageWidth - margin,
      y,
      { align: "right" }
    )
    doc.setTextColor(34, 197, 94)
    doc.text(
      `Total Paid: ${formatCurrency(summary.totalPayments)}`,
      pageWidth - margin,
      y + 5,
      { align: "right" }
    )
    doc.setTextColor(0, 0, 0)

    const balColor =
      summary.currentBalance > 0 ? [220, 38, 38] : [34, 197, 94]
    doc.setTextColor(balColor[0], balColor[1], balColor[2])
    doc.text(
      `Balance: ${summary.currentBalance > 0 ? "" : "-"}${formatCurrency(summary.currentBalance)}`,
      pageWidth - margin,
      y + 10,
      { align: "right" }
    )
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      pageWidth - margin,
      y + 15,
      { align: "right" }
    )

    y += 24

    // Transactions table
    const tableData = transactions.map((t) => [
      new Date(t.processedAt).toLocaleDateString(),
      t.description,
      t.type,
      t.receiptNumber || t.reference || "-",
      t.type === "PAYMENT" ? formatCurrency(t.amount) : "-",
      t.type !== "PAYMENT" ? formatCurrency(t.amount) : "-",
      `${t.balanceAfter >= 0 ? "" : "-"}${formatCurrency(t.balanceAfter)}`,
    ])

    autoTable(doc, {
      head: [
        ["Date", "Description", "Type", "Reference", "Credit", "Debit", "Balance"],
      ],
      body: tableData,
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
      },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize
        const pageHeight = pageSize.getHeight()
        const pageCount = (doc as any).internal.pages.length - 1

        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text(
          "Advent Hope Academy - Confidential",
          margin,
          pageHeight - 8
        )
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageSize.getWidth() - margin,
          pageHeight - 8,
          { align: "right" }
        )
        doc.setTextColor(0, 0, 0)
      },
    })

    doc.save(
      `statement-${selectedChild.studentNumber}-${new Date().toISOString().split("T")[0]}.pdf`
    )
  }

  const totalOwing = children.reduce(
    (sum, c) => sum + Math.max(0, c.balance),
    0
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-slate-600" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-600" />
                )}
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Parent Portal
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Advent Hope Academy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {parentName}
                  </p>
                  <p className="text-xs text-slate-500">Parent</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto py-6">
            <nav className="px-4 space-y-2">
              <Link
                href="/parent/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/parent/children"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <GraduationCap className="w-5 h-5" />
                <span>My Children</span>
              </Link>
              <Link
                href="/parent/results"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <FileText className="w-5 h-5" />
                <span>Academic Results</span>
              </Link>
              <Link
                href="/parent/finances"
                className="flex items-center gap-3 px-4 py-3 text-[#3b82f6] bg-blue-50 rounded-lg font-medium"
              >
                <DollarSign className="w-5 h-5" />
                <span>Finances</span>
              </Link>
              <Link
                href="/parent/attendance"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Calendar className="w-5 h-5" />
                <span>Attendance</span>
              </Link>
              <Link
                href="/parent/messages"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Mail className="w-5 h-5" />
                <span>Messages</span>
              </Link>
              <Link
                href="/parent/profile"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <User className="w-5 h-5" />
                <span>My Profile</span>
              </Link>
            </nav>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Page Title */}
            {!selectedChild ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    School Fees & Finances
                  </h2>
                  <p className="text-slate-600">
                    View your children&apos;s fee balances and payment history
                  </p>
                </div>

                {/* Total Summary */}
                {children.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">
                          Total Outstanding Balance
                        </p>
                        <p
                          className={`text-3xl font-bold ${
                            totalOwing > 0 ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {formatCurrency(totalOwing)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Across {children.length} child
                          {children.length !== 1 ? "ren" : ""}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500">
                        <p>
                          For payment enquiries, please contact the school
                          accounts office.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Children Cards */}
                {children.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-800 font-medium mb-2">
                      No children linked to your account
                    </p>
                    <Link
                      href="/portal/add-child"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <GraduationCap className="w-4 h-4" />
                      Add Your Child
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => viewChildStatement(child)}
                        className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {child.firstName[0]}
                              {child.lastName[0]}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 text-lg">
                                {child.firstName} {child.lastName}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {child.studentNumber} &middot;{" "}
                                {child.className} &middot; {child.curriculum}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-slate-500 mb-1">
                                Balance
                              </p>
                              <p
                                className={`text-xl font-bold ${
                                  child.balance > 0
                                    ? "text-red-600"
                                    : child.balance < 0
                                      ? "text-emerald-600"
                                      : "text-slate-500"
                                }`}
                              >
                                {child.balance > 0
                                  ? ""
                                  : child.balance < 0
                                    ? "-"
                                    : ""}
                                {formatCurrency(child.balance)}
                              </p>
                              {child.balance > 0 && (
                                <p className="text-xs text-red-400">Owing</p>
                              )}
                              {child.balance <= 0 && (
                                <p className="text-xs text-emerald-400">
                                  {child.balance < 0 ? "Credit" : "Settled"}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>

                        {child.lastPaymentDate && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                            <Receipt className="w-3.5 h-3.5" />
                            Last payment:{" "}
                            {formatCurrency(child.lastPaymentAmount || 0)} on{" "}
                            {new Date(child.lastPaymentDate).toLocaleDateString()}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Statement View */
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedChild(null)
                        setTransactions([])
                        setSummary(null)
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        {selectedChild.firstName} {selectedChild.lastName}
                      </h2>
                      <p className="text-slate-500 text-sm">
                        {selectedChild.studentNumber} &middot;{" "}
                        {selectedChild.className} &middot;{" "}
                        {selectedChild.curriculum}
                      </p>
                    </div>
                  </div>
                  {summary && transactions.length > 0 && (
                    <button
                      onClick={exportStatementPDF}
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700"
                    >
                      <Download className="h-4 w-4" />
                      Download Statement
                    </button>
                  )}
                </div>

                {loadingStatement ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Summary Cards */}
                    {summary && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            <span className="text-xs font-medium text-slate-500">
                              Total Charged
                            </span>
                          </div>
                          <p className="text-xl font-bold text-slate-800">
                            {formatCurrency(summary.totalCharges)}
                          </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-medium text-slate-500">
                              Total Paid
                            </span>
                          </div>
                          <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(summary.totalPayments)}
                          </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-medium text-slate-500">
                              Balance
                            </span>
                          </div>
                          <p
                            className={`text-xl font-bold ${
                              summary.currentBalance > 0
                                ? "text-red-600"
                                : summary.currentBalance < 0
                                  ? "text-emerald-600"
                                  : "text-slate-600"
                            }`}
                          >
                            {summary.currentBalance > 0
                              ? ""
                              : summary.currentBalance < 0
                                ? "-"
                                : ""}
                            {formatCurrency(summary.currentBalance)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {summary.currentBalance > 0
                              ? "Owing"
                              : summary.currentBalance < 0
                                ? "Credit"
                                : "Settled"}
                          </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Percent className="h-4 w-4 text-purple-500" />
                            <span className="text-xs font-medium text-slate-500">
                              Paid
                            </span>
                          </div>
                          <p className="text-xl font-bold text-slate-800">
                            {summary.percentagePaid}%
                          </p>
                          <div className="mt-2 bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(summary.percentagePaid, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transactions Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                      <div className="p-4 border-b border-slate-100">
                        <h3 className="text-base font-semibold text-slate-800">
                          Transaction History
                        </h3>
                      </div>

                      {transactions.length === 0 ? (
                        <div className="text-center py-12">
                          <Receipt className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                          <p className="text-slate-500 text-sm">
                            No transactions recorded yet
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                  Date
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                  Description
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">
                                  Reference
                                </th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                  Debit
                                </th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                  Credit
                                </th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                  Balance
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.map((txn) => (
                                <tr
                                  key={txn.id}
                                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                                >
                                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                                    {new Date(
                                      txn.processedAt
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-4 text-slate-800">
                                    {txn.description}
                                  </td>
                                  <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">
                                    {txn.receiptNumber ||
                                      txn.reference ||
                                      "-"}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    {txn.type !== "PAYMENT" &&
                                    txn.type !== "REFUND" ? (
                                      <span className="text-orange-600 font-medium">
                                        {formatCurrency(txn.amount)}
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    {txn.type === "PAYMENT" ||
                                    txn.type === "REFUND" ? (
                                      <span className="text-emerald-600 font-medium">
                                        {formatCurrency(txn.amount)}
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span
                                      className={`font-semibold ${
                                        txn.balanceAfter > 0
                                          ? "text-red-600"
                                          : txn.balanceAfter < 0
                                            ? "text-emerald-600"
                                            : "text-slate-500"
                                      }`}
                                    >
                                      {txn.balanceAfter > 0
                                        ? ""
                                        : txn.balanceAfter < 0
                                          ? "-"
                                          : ""}
                                      {formatCurrency(txn.balanceAfter)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
