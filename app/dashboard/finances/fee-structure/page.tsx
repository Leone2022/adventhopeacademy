'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  DollarSign,
  Users,
  Calendar,
  BookOpen,
  Send,
  AlertCircle,
} from 'lucide-react';

interface FeeStructure {
  id: string;
  name: string;
  feeType: string;
  studentType: 'DAY_SCHOLAR' | 'BOARDER' | 'BOTH';
  amount: number;
  dueDate: string | null;
  lateFee: number | null;
  description: string | null;
  isActive: boolean;
  academicYear: { id: string; name: string };
  term: { id: string; name: string } | null;
  class: { id: string; name: string } | null;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface Term {
  id: string;
  name: string;
  academicYearId: string;
}

interface Class {
  id: string;
  name: string;
}

export default function FeeStructurePage() {
  const router = useRouter();
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    academicYearId: '',
    termId: '',
    classId: '',
    name: '',
    feeType: '',
    studentType: 'BOTH' as 'DAY_SCHOLAR' | 'BOARDER' | 'BOTH',
    amount: '',
    dueDate: '',
    lateFee: '',
    description: '',
  });

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyingFee, setApplyingFee] = useState<FeeStructure | null>(null);
  const [applyResults, setApplyResults] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch fee structures
      const feesRes = await fetch('/api/finances/fee-structure');
      if (feesRes.ok) {
        const data = await feesRes.json();
        setFeeStructures(data.feeStructures || []);
      }

      // Fetch academic years
      const yearsRes = await fetch('/api/academic-years');
      if (yearsRes.ok) {
        const data = await yearsRes.json();
        setAcademicYears(data.academicYears || data || []);
      }

      // Fetch terms
      const termsRes = await fetch('/api/terms');
      if (termsRes.ok) {
        const data = await termsRes.json();
        setTerms(data.terms || data || []);
      }

      // Fetch classes
      const classesRes = await fetch('/api/classes');
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes || data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const endpoint = '/api/finances/fee-structure';
      const method = editingId ? 'PATCH' : 'POST';
      const payload = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save fee structure');
      }

      alert(editingId ? 'Fee structure updated!' : 'Fee structure created!');
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to save fee structure');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (fee: FeeStructure) => {
    setFormData({
      academicYearId: fee.academicYear.id,
      termId: fee.term?.id || '',
      classId: fee.class?.id || '',
      name: fee.name,
      feeType: fee.feeType,
      studentType: fee.studentType,
      amount: fee.amount.toString(),
      dueDate: fee.dueDate ? fee.dueDate.split('T')[0] : '',
      lateFee: fee.lateFee?.toString() || '',
      description: fee.description || '',
    });
    setEditingId(fee.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;

    try {
      const response = await fetch(`/api/finances/fee-structure?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      alert('Fee structure deleted!');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete fee structure');
    }
  };

  const handleApply = async () => {
    if (!applyingFee) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/finances/fee-structure/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeStructureId: applyingFee.id,
          applyToAll: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply fee structure');
      }

      setApplyResults(data);
    } catch (error: any) {
      alert(error.message || 'Failed to apply fee structure');
      setShowApplyModal(false);
      setApplyingFee(null);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      academicYearId: '',
      termId: '',
      classId: '',
      name: '',
      feeType: '',
      studentType: 'BOTH',
      amount: '',
      dueDate: '',
      lateFee: '',
      description: '',
    });
  };

  const getStudentTypeLabel = (type: string) => {
    switch (type) {
      case 'DAY_SCHOLAR':
        return 'Day Scholar';
      case 'BOARDER':
        return 'Boarder';
      case 'BOTH':
        return 'Both';
      default:
        return type;
    }
  };

  const getStudentTypeBadge = (type: string) => {
    switch (type) {
      case 'DAY_SCHOLAR':
        return 'bg-blue-100 text-blue-800';
      case 'BOARDER':
        return 'bg-purple-100 text-purple-800';
      case 'BOTH':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (applyResults) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Fee Structure Applied!</h2>
              <p className="text-slate-600">{applyResults.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-blue-900">{applyResults.summary.totalStudents}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Successful</p>
              <p className="text-2xl font-bold text-green-900">{applyResults.summary.successful}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-900">{applyResults.summary.failed}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Total Charged</p>
              <p className="text-2xl font-bold text-purple-900">
                ${applyResults.summary.totalAmountCharged.toFixed(2)}
              </p>
            </div>
          </div>

          {applyResults.summary.totalBursaryDiscounts > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800 font-medium">
                Total Bursary Discounts: ${applyResults.summary.totalBursaryDiscounts.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setApplyResults(null);
                setApplyingFee(null);
                setShowApplyModal(false);
                fetchData();
              }}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/finances')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Finances
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Fee Structure Management</h1>
            <p className="text-slate-600 mt-2">
              Set up charges for Day Scholars and Boarders by term
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            New Fee Structure
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Edit Fee Structure' : 'Create Fee Structure'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Academic Year *
                  </label>
                  <select
                    required
                    value={formData.academicYearId}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYearId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.length > 0 ? (
                      academicYears.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.name} {year.isCurrent ? '(Current)' : ''}
                        </option>
                      ))
                    ) : (
                      // Fallback if no academic years in database
                      [2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                        <option key={year} value={year.toString()}>
                          {year} {year === new Date().getFullYear() ? '(Current)' : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Term (Optional)
                  </label>
                  <select
                    value={formData.termId}
                    onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Terms</option>
                    {terms.filter((t) => t.academicYearId === formData.academicYearId).length > 0 ? (
                      terms
                        .filter((t) => t.academicYearId === formData.academicYearId)
                        .map((term) => (
                          <option key={term.id} value={term.id}>
                            {term.name}
                          </option>
                        ))
                    ) : (
                      // Static term options
                      <>
                        <option value="term-1">Term 1</option>
                        <option value="term-2">Term 2</option>
                        <option value="term-3">Term 3</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fee Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Term 1 Tuition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fee Type *
                  </label>
                  <select
                    required
                    value={formData.feeType}
                    onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <optgroup label="Combined Fees">
                      <option value="Boarding and Tuition">Boarding and Tuition</option>
                      <option value="Tuition and Books">Tuition and Books</option>
                      <option value="Full Package">Full Package (All Inclusive)</option>
                    </optgroup>
                    <optgroup label="Individual Fees">
                      <option value="Tuition Only">Tuition Only</option>
                      <option value="Boarding Only">Boarding Only</option>
                      <option value="Transport">Transport</option>
                      <option value="Books">Books & Materials</option>
                      <option value="Uniform">Uniform</option>
                      <option value="Activities">Activities</option>
                      <option value="Exam">Exam Fees</option>
                      <option value="Laboratory">Laboratory Fees</option>
                      <option value="Sports">Sports Fees</option>
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Student Type *
                  </label>
                  <select
                    required
                    value={formData.studentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        studentType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BOTH">Both (Day & Boarder)</option>
                    <option value="DAY_SCHOLAR">Day Scholar Only</option>
                    <option value="BOARDER">Boarder Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Late Fee (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.lateFee}
                    onChange={(e) => setFormData({ ...formData, lateFee: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Class (Optional)
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingId ? 'Update' : 'Create'} Fee Structure</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplyModal && applyingFee && !applyResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Apply Fee Structure</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-slate-900">{applyingFee.name}</p>
                <p className="text-sm text-slate-600 mt-1">
                  Amount: ${applyingFee.amount.toFixed(2)} •{' '}
                  {getStudentTypeLabel(applyingFee.studentType)}
                </p>
                {applyingFee.term && (
                  <p className="text-sm text-slate-600">{applyingFee.term.name}</p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">
                    This will charge all eligible students
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    The system will automatically apply this fee to all active students matching
                    the criteria (Day Scholar, Boarder, or Both). Active bursaries will be
                    applied automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplyingFee(null);
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Apply Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {feeStructures.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Fee Structures Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first fee structure to start charging students
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Fee Structure
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Fee Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Student Type
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Term
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {feeStructures.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{fee.name}</p>
                      <p className="text-sm text-slate-500">{fee.academicYear.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{fee.feeType}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStudentTypeBadge(
                          fee.studentType
                        )}`}
                      >
                        {getStudentTypeLabel(fee.studentType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      ${fee.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fee.term?.name || 'All Terms'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {fee.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <X className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setApplyingFee(fee);
                            setShowApplyModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Apply to students"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(fee)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fee.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
