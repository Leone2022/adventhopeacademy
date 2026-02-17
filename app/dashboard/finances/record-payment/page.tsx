'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  DollarSign,
  CreditCard,
  Check,
  AlertCircle,
  User,
  BookOpen,
} from 'lucide-react';

interface StudentResult {
  id: string;
  studentId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  className: string;
  curriculum: string;
  balance: number;
}

interface FeeStructure {
  id: string;
  name: string;
  feeType: string;
  studentType: string;
  amount: number;
  academicYear: { name: string };
  term: { name: string } | null;
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

export default function RecordPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');
  const typeParam = searchParams.get('type');

  const [mode, setMode] = useState<'payment' | 'charge'>(typeParam === 'charge' ? 'charge' : 'payment');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);

  // Fee structures
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<string>('');

  // Form fields
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ receiptNumber?: string; newBalance: number } | null>(null);
  const [error, setError] = useState('');

  // Load fee structures
  useEffect(() => {
    fetch('/api/finances/fee-structure')
      .then((res) => res.json())
      .then((data) => setFeeStructures((data.feeStructures || []).filter((f: FeeStructure) => f.amount > 0)))
      .catch(() => {});
  }, []);

  // Load preselected student
  useEffect(() => {
    if (preselectedStudentId) {
      loadStudent(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  const handleFeeStructureSelect = (feeId: string) => {
    setSelectedFeeStructure(feeId);
    if (feeId) {
      const fee = feeStructures.find((f) => f.id === feeId);
      if (fee) {
        setAmount(fee.amount.toString());
        setDescription(`${fee.name}${fee.term ? ` - ${fee.term.name}` : ''}`);
      }
    }
  };

  const loadStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/finances/accounts?search=${studentId}&limit=50`);
      const data = await response.json();
      const match = data.accounts?.find((a: any) => a.studentId === studentId);
      if (match) {
        setSelectedStudent(match);
      }
    } catch (err) {
      console.error('Error loading student:', err);
    }
  };

  const searchStudents = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await fetch(`/api/finances/accounts?search=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      setSearchResults(data.accounts || []);
    } catch (err) {
      console.error('Error searching students:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amount) return;

    setSubmitting(true);
    setError('');
    setSuccess(null);

    try {
      if (mode === 'payment') {
        const response = await fetch(`/api/students/${selectedStudent.studentId}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(amount),
            paymentMethod,
            description: description || `Fee payment - ${paymentMethod}`,
            reference: reference || undefined,
            notes: notes || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to record payment');
        }

        setSuccess({
          receiptNumber: data.receiptNumber,
          newBalance: Number(data.newBalance),
        });
      } else {
        const response = await fetch('/api/finances/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudent.studentId,
            amount: parseFloat(amount),
            description: description || 'Fee charge',
            notes: notes || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to record charge');
        }

        setSuccess({
          newBalance: data.newBalance,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setReference('');
    setNotes('');
    setSuccess(null);
    setError('');
  };

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Success screen
  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {mode === 'payment' ? 'Payment Recorded' : 'Charge Added'}
          </h2>
          <p className="text-slate-600 mb-4">
            {mode === 'payment' ? 'Payment' : 'Charge'} of {formatCurrency(parseFloat(amount))} for{' '}
            {selectedStudent?.firstName} {selectedStudent?.lastName} has been recorded.
          </p>

          {success.receiptNumber && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Receipt Number</p>
              <p className="text-lg font-mono font-bold text-slate-800">{success.receiptNumber}</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-slate-500 mb-1">New Balance</p>
            <p className={`text-lg font-bold ${success.newBalance > 0 ? 'text-red-600' : success.newBalance < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
              {success.newBalance > 0 ? '' : success.newBalance < 0 ? '-' : ''}
              {formatCurrency(success.newBalance)}
              {success.newBalance > 0 ? ' (Owing)' : success.newBalance < 0 ? ' (Credit)' : ' (Settled)'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Record Another
            </button>
            <Link
              href={`/dashboard/finances/student/${selectedStudent?.studentId}`}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-center"
            >
              View Statement
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === 'payment' ? 'Record Payment' : 'Add Charge'}
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            {mode === 'payment' ? 'Record a student fee payment' : 'Add a fee charge to a student account'}
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 mb-6 flex">
        <button
          onClick={() => setMode('payment')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            mode === 'payment' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Record Payment
        </button>
        <button
          onClick={() => setMode('charge')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            mode === 'charge' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Add Charge / Fee
        </button>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Select Student</h2>

        {selectedStudent ? (
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedStudent.studentNumber} &middot; {selectedStudent.className} &middot; {selectedStudent.curriculum}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Current Balance</p>
              <p className={`font-semibold ${selectedStudent.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {selectedStudent.balance > 0 ? '' : '-'}
                {formatCurrency(selectedStudent.balance)}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedStudent(null);
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="ml-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Change
            </button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or student number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    searchStudents();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchStudents();
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                autoFocus
              />
            </div>

            {searching && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="mt-3 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {searchResults.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setSearchResults([]);
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {student.studentNumber} &middot; {student.className}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${student.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {student.balance > 0 ? '' : '-'}
                      {formatCurrency(student.balance)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No students found</p>
            )}
          </div>
        )}
      </div>

      {/* Payment/Charge Form */}
      {selectedStudent && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">
            {mode === 'payment' ? 'Payment Details' : 'Charge Details'}
          </h2>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Fee Structure Selector (charge mode only) */}
            {mode === 'charge' && feeStructures.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  Fee Structure
                </label>
                <select
                  value={selectedFeeStructure}
                  onChange={(e) => handleFeeStructureSelect(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
                >
                  <option value="">Custom charge (enter manually)</option>
                  {feeStructures.map((fee) => (
                    <option key={fee.id} value={fee.id}>
                      {fee.name} - ${fee.amount.toFixed(2)} {fee.term ? `(${fee.term.name})` : ''} • {fee.academicYear.name}
                    </option>
                  ))}
                </select>
                {selectedFeeStructure && (
                  <p className="text-xs text-indigo-600 mt-1">Amount and description auto-filled from fee structure</p>
                )}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (USD) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Payment Method (only for payments) */}
            {mode === 'payment' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white appearance-none"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description {mode === 'charge' ? '*' : ''}
              </label>
              <input
                type="text"
                placeholder={mode === 'payment' ? 'e.g., Term 1 fees payment' : 'e.g., Term 1 tuition fees'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required={mode === 'charge'}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            {/* Reference (payments only) */}
            {mode === 'payment' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference Number</label>
                <input
                  type="text"
                  placeholder="Bank ref, mobile money ref, etc."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting || !amount}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'payment'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  {mode === 'payment' ? <DollarSign className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  {mode === 'payment' ? 'Record Payment' : 'Add Charge'}
                </>
              )}
            </button>
            <Link
              href="/dashboard/finances"
              className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
