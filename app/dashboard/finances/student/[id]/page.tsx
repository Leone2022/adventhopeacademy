'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Receipt,
  Undo2,
  CreditCard,
  X,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionData {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference: string | null;
  paymentMethod: string | null;
  processedAt: string;
  notes: string | null;
  receiptNumber: string | null;
}

interface SummaryData {
  totalCharges: number;
  totalPayments: number;
  currentBalance: number;
  percentagePaid: number;
}

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  curriculum: string;
  className: string;
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ECOCASH', label: 'EcoCash' },
  { value: 'INNBUCKS', label: 'InnBucks' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'PAYNOW', label: 'PayNow' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD', label: 'Card' },
  { value: 'OTHER', label: 'Other' },
];

export default function StudentStatementPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState<'charge' | 'payment' | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalPaymentMethod, setModalPaymentMethod] = useState('CASH');
  const [modalReference, setModalReference] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Reverse state
  const [reversingId, setReversingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/finances/student/${studentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load financial data');
      }

      setStudent(data.student);
      setSummary(data.summary);
      setTransactions(data.transactions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAmount || !student) return;

    setModalSubmitting(true);
    setModalError('');

    try {
      if (showModal === 'charge') {
        const res = await fetch('/api/finances/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            amount: parseFloat(modalAmount),
            description: modalDescription || 'Fee charge',
            notes: modalNotes || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch(`/api/students/${student.id}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(modalAmount),
            paymentMethod: modalPaymentMethod,
            description: modalDescription || `Payment - ${modalPaymentMethod}`,
            reference: modalReference || undefined,
            notes: modalNotes || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      // Reset and refresh
      closeModal();
      fetchData();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setModalAmount('');
    setModalDescription('');
    setModalPaymentMethod('CASH');
    setModalReference('');
    setModalNotes('');
    setModalError('');
  };

  const handleReverse = async (txnId: string, txnDescription: string) => {
    if (!confirm(`Reverse this transaction?\n\n"${txnDescription}"\n\nThis will create a counter-entry and update the balance.`)) {
      return;
    }

    setReversingId(txnId);
    try {
      const res = await fetch('/api/finances/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txnId }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to reverse transaction');
        return;
      }

      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setReversingId(null);
    }
  };

  const exportStatementPDF = () => {
    if (!student || !summary) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Advent Hope Academy', margin, margin + 6);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Student Financial Statement', margin, margin + 13);

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 17, pageWidth - margin, margin + 17);

    let y = margin + 24;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student: ${student.firstName} ${student.lastName}`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student #: ${student.studentNumber}`, margin, y + 5);
    doc.text(`Class: ${student.className}`, margin, y + 10);
    doc.text(`Curriculum: ${student.curriculum}`, margin, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Charged: ${formatCurrency(summary.totalCharges)}`, pageWidth - margin, y, { align: 'right' });
    doc.setTextColor(34, 197, 94);
    doc.text(`Total Paid: ${formatCurrency(summary.totalPayments)}`, pageWidth - margin, y + 5, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    const balColor = summary.currentBalance > 0 ? [220, 38, 38] : [34, 197, 94];
    doc.setTextColor(balColor[0], balColor[1], balColor[2]);
    doc.text(
      `Balance: ${summary.currentBalance > 0 ? '' : '-'}${formatCurrency(summary.currentBalance)}`,
      pageWidth - margin, y + 10, { align: 'right' }
    );
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      pageWidth - margin, y + 15, { align: 'right' }
    );

    y += 24;

    const tableData = transactions.map((t) => [
      new Date(t.processedAt).toLocaleDateString(),
      t.description,
      t.type,
      t.receiptNumber || t.reference || '-',
      t.type === 'PAYMENT' ? formatCurrency(t.amount) : '-',
      t.type !== 'PAYMENT' ? formatCurrency(t.amount) : '-',
      `${t.balanceAfter >= 0 ? '' : '-'}${formatCurrency(t.balanceAfter)}`,
    ]);

    autoTable(doc, {
      head: [['Date', 'Description', 'Type', 'Reference', 'Credit', 'Debit', 'Balance']],
      body: tableData,
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
      },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const pageCount = (doc as any).internal.pages.length - 1;
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Advent Hope Academy - Confidential', margin, pageHeight - 8);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageSize.getWidth() - margin, pageHeight - 8, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      },
    });

    doc.save(`statement-${student.studentNumber}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {student ? `${student.firstName} ${student.lastName}` : 'Student'} - Statement
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {student?.studentNumber} &middot; {student?.className} &middot; {student?.curriculum}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowModal('charge')}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Charge
          </button>
          <button
            onClick={() => setShowModal('payment')}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <DollarSign className="h-4 w-4" />
            Record Payment
          </button>
          <button
            onClick={exportStatementPDF}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium text-slate-500">Total Charged</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(summary.totalCharges)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-500">Total Paid</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(summary.totalPayments)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-500">Balance</span>
            </div>
            <p className={`text-xl font-bold ${summary.currentBalance > 0 ? 'text-red-600' : summary.currentBalance < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
              {summary.currentBalance > 0 ? '' : summary.currentBalance < 0 ? '-' : ''}
              {formatCurrency(summary.currentBalance)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {summary.currentBalance > 0 ? 'Owing' : summary.currentBalance < 0 ? 'Credit' : 'Settled'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-slate-500">Paid</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{summary.percentagePaid}%</p>
            <div className="mt-2 bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(summary.percentagePaid, 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No transactions recorded yet</p>
            <p className="text-slate-400 text-xs mt-1">Add a charge or record a payment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Description</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Debit</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Credit</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Balance</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase w-16"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const isReversed = txn.reference?.startsWith('REV-');
                  const isReversal = transactions.some(t => t.reference === `REV-${txn.id}`);

                  return (
                    <tr key={txn.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isReversal ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(txn.processedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-800">{txn.description}</p>
                        {txn.receiptNumber && <p className="text-xs text-slate-400 mt-0.5">Receipt: {txn.receiptNumber}</p>}
                        {txn.notes && <p className="text-xs text-slate-400 mt-0.5">{txn.notes}</p>}
                        {isReversal && <p className="text-xs text-red-400 mt-0.5">Reversed</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          txn.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-700'
                            : txn.type === 'CHARGE' ? 'bg-orange-50 text-orange-700'
                              : txn.type === 'REFUND' ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {txn.type !== 'PAYMENT' && txn.type !== 'REFUND' ? (
                          <span className="text-orange-600 font-medium">{formatCurrency(txn.amount)}</span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {txn.type === 'PAYMENT' || txn.type === 'REFUND' ? (
                          <span className="text-emerald-600 font-medium">{formatCurrency(txn.amount)}</span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold ${txn.balanceAfter > 0 ? 'text-red-600' : txn.balanceAfter < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {txn.balanceAfter > 0 ? '' : txn.balanceAfter < 0 ? '-' : ''}
                          {formatCurrency(txn.balanceAfter)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!isReversed && !isReversal && (txn.type === 'CHARGE' || txn.type === 'PAYMENT') && (
                          <button
                            onClick={() => handleReverse(txn.id, txn.description)}
                            disabled={reversingId === txn.id}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Reverse this transaction"
                          >
                            {reversingId === txn.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                            ) : (
                              <Undo2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add Charge / Record Payment */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {showModal === 'charge' ? 'Add Charge' : 'Record Payment'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-4 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {showModal === 'payment' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={modalPaymentMethod}
                    onChange={(e) => setModalPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description {showModal === 'charge' ? '*' : ''}</label>
                <input
                  type="text"
                  placeholder={showModal === 'charge' ? 'e.g., Term 1 tuition fees' : 'e.g., Fee payment'}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  required={showModal === 'charge'}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              {showModal === 'payment' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                  <input
                    type="text"
                    placeholder="Bank ref, mobile money ref..."
                    value={modalReference}
                    onChange={(e) => setModalReference(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={modalSubmitting || !modalAmount}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-colors disabled:opacity-50 ${
                    showModal === 'charge' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {modalSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : showModal === 'charge' ? (
                    'Add Charge'
                  ) : (
                    'Record Payment'
                  )}
                </button>
                <button type="button" onClick={closeModal} className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
