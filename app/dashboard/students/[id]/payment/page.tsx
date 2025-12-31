'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  DollarSign,
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Receipt,
  Wallet,
  Calendar,
  FileText,
} from 'lucide-react';

interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  currentClass?: { name: string };
  account?: {
    balance: number;
    lastPaymentDate?: string;
    lastPaymentAmount?: number;
  };
}

export default function RecordPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    description: '',
    reference: '',
    bankReference: '',
    mobileMoneyRef: '',
    notes: '',
    proofOfPayment: '',
  });

  const paymentMethods = [
    { value: 'CASH', label: 'Cash' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'ECOCASH', label: 'EcoCash' },
    { value: 'INNBUCKS', label: 'InnBucks' },
    { value: 'MOBILE_MONEY', label: 'Other Mobile Money' },
    { value: 'PAYNOW', label: 'PayNow' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'CARD', label: 'Card Payment' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    fetchStudent();
  }, [params.id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setStudent(data);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid payment amount');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/students/${params.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          description: formData.description || `Fee payment - ${formData.paymentMethod}`,
          reference: formData.reference,
          bankReference: formData.bankReference,
          mobileMoneyRef: formData.mobileMoneyRef,
          notes: formData.notes,
          proofOfPayment: formData.proofOfPayment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      setSuccess(`Payment recorded successfully! Receipt: ${data.receiptNumber}`);
      setTimeout(() => {
        router.push(`/dashboard/students/${params.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Student not found</h2>
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/students/${student.id}`}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Record Payment</h1>
          <p className="text-slate-600 mt-1">
            {student.firstName} {student.lastName} ({student.studentNumber})
          </p>
        </div>
      </div>

      {/* Current Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Current Balance</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(student.account?.balance || 0)}
            </p>
            {student.account?.lastPaymentDate && (
              <p className="text-blue-200 text-sm mt-2">
                Last payment: {formatCurrency(student.account.lastPaymentAmount || 0)} on{' '}
                {new Date(student.account.lastPaymentDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Wallet className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Payment Details</h2>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Amount (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.slice(0, 6).map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    formData.paymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full mt-3 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Numbers based on payment method */}
          {(formData.paymentMethod === 'BANK_TRANSFER' || formData.paymentMethod === 'CHEQUE') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bank Reference / Cheque Number
              </label>
              <input
                type="text"
                name="bankReference"
                value={formData.bankReference}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter bank reference or cheque number"
              />
            </div>
          )}

          {(formData.paymentMethod === 'ECOCASH' || formData.paymentMethod === 'INNBUCKS' || formData.paymentMethod === 'MOBILE_MONEY') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mobile Money Reference
              </label>
              <input
                type="text"
                name="mobileMoneyRef"
                value={formData.mobileMoneyRef}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., MP240101.1234.A12345"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g., Term 1 Tuition Payment, Registration Fee"
            />
          </div>

          {/* Proof of Payment URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Proof of Payment (URL)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="url"
                name="proofOfPayment"
                value={formData.proofOfPayment}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="https://drive.google.com/... or receipt image URL"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload proof of payment to cloud storage and paste the link here
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Any additional notes about this payment..."
            />
          </div>

          {/* Payment Preview */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-2">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(parseFloat(formData.amount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Balance:</span>
                  <span className="text-slate-800">
                    {formatCurrency(student.account?.balance || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-600">New Balance:</span>
                  <span className={`font-semibold ${
                    ((student.account?.balance || 0) + parseFloat(formData.amount)) < 0
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }`}>
                    {formatCurrency((student.account?.balance || 0) + parseFloat(formData.amount))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Link
            href={`/dashboard/students/${student.id}`}
            className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !formData.amount}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                Record Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
