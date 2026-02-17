'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Gift,
  Users,
  Percent,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Bursary {
  id: string;
  percentage: number;
  reason: string;
  notes: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  student: {
    id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
    currentClass: { name: string } | null;
  };
}

interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  currentClass?: { name: string };
}

export default function BursaryPage() {
  const router = useRouter();
  const [bursaries, setBursaries] = useState<Bursary[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    percentage: '',
    reason: '',
    notes: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch bursaries
      const bursariesRes = await fetch('/api/finances/bursary');
      if (bursariesRes.ok) {
        const data = await bursariesRes.json();
        setBursaries(data.bursaries || []);
      }

      // Fetch students
      const studentsRes = await fetch('/api/students');
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudents.size === 0) {
      alert('Please select at least one student');
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = '/api/finances/bursary';
      const method = editingId ? 'PATCH' : 'POST';
      const payload = editingId
        ? { id: editingId, ...formData }
        : { studentIds: Array.from(selectedStudents), ...formData };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save bursary');
      }

      alert(
        editingId
          ? 'Bursary updated!'
          : `Bursary applied to ${selectedStudents.size} student(s)!`
      );
      setShowForm(false);
      setEditingId(null);
      setSelectedStudents(new Set());
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to save bursary');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (bursary: Bursary) => {
    setFormData({
      percentage: bursary.percentage.toString(),
      reason: bursary.reason,
      notes: bursary.notes || '',
      endDate: bursary.endDate ? bursary.endDate.split('T')[0] : '',
    });
    setEditingId(bursary.id);
    setSelectedStudents(new Set([bursary.student.id]));
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bursary?')) return;

    try {
      const response = await fetch(`/api/finances/bursary?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      alert('Bursary deleted!');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete bursary');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/finances/bursary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to update bursary');
    }
  };

  const resetForm = () => {
    setFormData({
      percentage: '',
      reason: '',
      notes: '',
      endDate: '',
    });
  };

  const handleToggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.studentNumber.toLowerCase().includes(searchLower)
    );
  });

  // Get students with active bursaries
  const studentsWithBursaries = new Set(
    bursaries.filter((b) => b.isActive).map((b) => b.student.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            <h1 className="text-3xl font-bold text-slate-900">Bursary Management</h1>
            <p className="text-slate-600 mt-2">
              Apply percentage-based discounts (scholarships/bursaries) to students
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setSelectedStudents(new Set());
              resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Apply Bursary
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Students with Bursaries</p>
              <p className="text-2xl font-bold text-slate-900">
                {studentsWithBursaries.size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Bursaries</p>
              <p className="text-2xl font-bold text-slate-900">
                {bursaries.filter((b) => b.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Percent className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Average Discount</p>
              <p className="text-2xl font-bold text-slate-900">
                {bursaries.length > 0
                  ? (
                      bursaries
                        .filter((b) => b.isActive)
                        .reduce((sum, b) => sum + b.percentage, 0) /
                      bursaries.filter((b) => b.isActive).length
                    ).toFixed(1)
                  : '0'}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Edit Bursary' : 'Apply Bursary'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Student Selection */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Select Students ({selectedStudents.size} selected)
                  </h3>

                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3">
                    {filteredStudents.length === 0 ? (
                      <p className="text-center text-slate-500 py-4">No students found</p>
                    ) : (
                      filteredStudents.map((student) => {
                        const hasActiveBursary = studentsWithBursaries.has(student.id);
                        return (
                          <label
                            key={student.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              hasActiveBursary
                                ? 'border-amber-200 bg-amber-50'
                                : 'border-slate-200 hover:bg-slate-50'
                            } cursor-pointer transition-colors`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(student.id)}
                              onChange={() => handleToggleStudent(student.id)}
                              disabled={editingId !== null}
                              className="w-5 h-5 text-blue-600 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {student.studentNumber} •{' '}
                                {student.currentClass?.name || 'No Class'}
                              </p>
                            </div>
                            {hasActiveBursary && (
                              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">
                                Has Bursary
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Bursary Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Discount Percentage (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100"
                      required
                      value={formData.percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, percentage: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 50"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This percentage will be deducted from all charges
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reason *
                    </label>
                    <select
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Reason</option>
                      <option value="Academic Excellence">Academic Excellence</option>
                      <option value="Sports Scholarship">Sports Scholarship</option>
                      <option value="Financial Need">Financial Need</option>
                      <option value="Staff Child">Staff Child</option>
                      <option value="Sibling Discount">Sibling Discount</option>
                      <option value="Merit Scholarship">Merit Scholarship</option>
                      <option value="Community Service">Community Service</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty for indefinite bursary
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional information..."
                    />
                  </div>

                  {selectedStudents.size > 0 && formData.percentage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900">
                        {selectedStudents.size} student(s) will receive{' '}
                        {formData.percentage}% discount on all charges
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Example: A $1,000 charge becomes $
                        {(1000 * (1 - parseFloat(formData.percentage || '0') / 100)).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setSelectedStudents(new Set());
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedStudents.size === 0}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Applying...'}
                    </>
                  ) : (
                    <>{editingId ? 'Update' : 'Apply'} Bursary</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bursaries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {bursaries.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Bursaries Applied Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Start applying bursaries to give students discounts on their fees
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Apply First Bursary
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Student
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Duration
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
                {bursaries.map((bursary) => (
                  <tr key={bursary.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {bursary.student.firstName} {bursary.student.lastName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {bursary.student.studentNumber} •{' '}
                        {bursary.student.currentClass?.name || 'No Class'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-lg font-bold text-purple-600">
                        {bursary.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{bursary.reason}</p>
                      {bursary.notes && (
                        <p className="text-xs text-slate-500 mt-1">{bursary.notes}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex flex-col gap-1">
                        <span>
                          From: {new Date(bursary.startDate).toLocaleDateString()}
                        </span>
                        {bursary.endDate ? (
                          <span>
                            To: {new Date(bursary.endDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">Indefinite</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(bursary.id, bursary.isActive)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          bursary.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {bursary.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(bursary)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bursary.id)}
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
