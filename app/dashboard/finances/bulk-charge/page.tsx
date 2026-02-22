'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  BookOpen,
} from 'lucide-react';

interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  curriculum: string;
  isBoarding: boolean;
  status: string;
  currentClass?: { name: string };
  account?: { balance: number };
}

interface Class {
  id: string;
  name: string;
}

interface FeeStructure {
  id: string;
  name: string;
  feeType: string;
  studentType: 'DAY_SCHOLAR' | 'BOARDER' | 'BOTH';
  amount: number;
  description: string | null;
  isActive: boolean;
  academicYear: { id: string; name: string };
  term: { id: string; name: string } | null;
  class: { id: string; name: string } | null;
}

export default function BulkChargePage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [selectedStudentType, setSelectedStudentType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');

  // Fee structure selection
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<string>('');

  // Form fields
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [chargeType, setChargeType] = useState('');
  const [notes, setNotes] = useState('');

  // Results
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [studentsRes, classesRes, feesRes] = await Promise.all([
        fetch('/api/students?limit=10000&status=ACTIVE'),
        fetch('/api/classes'),
        fetch('/api/finances/fee-structure'),
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || []);
      }
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes || data || []);
      }
      if (feesRes.ok) {
        const data = await feesRes.json();
        setFeeStructures((data.feeStructures || []).filter((f: FeeStructure) => f.isActive));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // When a fee structure is selected, auto-fill amount and description
  const handleFeeStructureChange = useCallback((feeId: string) => {
    setSelectedFeeStructure(feeId);
    if (feeId) {
      const fee = feeStructures.find((f) => f.id === feeId);
      if (fee) {
        setAmount(fee.amount.toString());
        setDescription(`${fee.name}${fee.term ? ` - ${fee.term.name}` : ''}`);
        setChargeType(fee.feeType);
        // Auto-filter student type to match fee structure
        if (fee.studentType === 'DAY_SCHOLAR') {
          setSelectedStudentType('DAY_SCHOLAR');
        } else if (fee.studentType === 'BOARDER') {
          setSelectedStudentType('BOARDER');
        } else {
          setSelectedStudentType('');
        }
      }
    } else {
      setAmount('');
      setDescription('');
      setChargeType('');
    }
  }, [feeStructures]);

  // Fast client-side search using useMemo
  const filteredStudents = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return students.filter((student) => {
      if (search && !student.firstName.toLowerCase().includes(search) &&
          !student.lastName.toLowerCase().includes(search) &&
          !student.studentNumber.toLowerCase().includes(search) &&
          !`${student.firstName} ${student.lastName}`.toLowerCase().includes(search)) {
        return false;
      }
      if (selectedClass && student.currentClass?.name !== selectedClass) return false;
      if (selectedCurriculum && student.curriculum !== selectedCurriculum) return false;
      if (selectedStudentType === 'DAY_SCHOLAR' && student.isBoarding) return false;
      if (selectedStudentType === 'BOARDER' && !student.isBoarding) return false;
      if (selectedStatus && student.status !== selectedStatus) return false;
      return true;
    });
  }, [students, searchTerm, selectedClass, selectedCurriculum, selectedStudentType, selectedStatus]);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleSelectByClass = () => {
    if (selectedClass) {
      const classStudents = students.filter((s) => s.currentClass?.name === selectedClass);
      setSelectedStudents(new Set(classStudents.map((s) => s.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudents.size === 0) {
      alert('Please select at least one student');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!description) {
      alert('Please enter a description');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to charge ${selectedStudents.size} student(s) $${parseFloat(amount).toFixed(2)} each?\n\nTotal: $${(selectedStudents.size * parseFloat(amount)).toFixed(2)}\n\nDescription: ${description}`
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/finances/bulk-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
          amount: parseFloat(amount),
          description,
          chargeType,
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details ? `${data.error}: ${data.details}` : data.error || 'Failed to process bulk charge');
      }

      setResults(data);
      setShowResults(true);
      setSelectedStudents(new Set());
      setAmount('');
      setDescription('');
      setChargeType('');
      setNotes('');
      setSelectedFeeStructure('');
    } catch (error: any) {
      alert(error.message || 'Failed to process bulk charge');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <button
            onClick={() => { setShowResults(false); fetchData(); }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bulk Charge
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Bulk Charge Results</h1>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Processed</p>
              <p className="text-2xl font-bold text-blue-900">{results.summary.totalProcessed}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Successful</p>
              <p className="text-2xl font-bold text-green-900">{results.summary.successful}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-900">{results.summary.failed}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-purple-900">${Number(results.summary.totalAmountCharged).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Successful Charges */}
        {results.details.successfulCharges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Successful Charges ({results.details.successfulCharges.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Class</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Previous Balance</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Charged</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">New Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.details.successfulCharges.map((charge: any) => (
                    <tr key={charge.studentId}>
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium">{charge.name}</p>
                        <p className="text-slate-500">{charge.studentNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{charge.class}</td>
                      <td className="px-4 py-3 text-sm text-right">${Number(charge.previousBalance).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right text-orange-600 font-medium">
                        +${Number(charge.amountCharged).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">${Number(charge.newBalance).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Failed Charges */}
        {results.details.failedCharges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Failed Charges ({results.details.failedCharges.length})
            </h2>
            <div className="space-y-2">
              {results.details.failedCharges.map((failed: any) => (
                <div key={failed.studentId} className="bg-red-50 rounded-lg p-3">
                  <p className="font-medium text-red-900">{failed.name} ({failed.studentNumber})</p>
                  <p className="text-sm text-red-600">{failed.error}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => { setShowResults(false); fetchData(); }}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Charge More Students
          </button>
          <button
            onClick={() => router.push('/dashboard/finances')}
            className="flex-1 bg-slate-200 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Back to Finances
          </button>
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
        <h1 className="text-3xl font-bold text-slate-900">Bulk Charge Students</h1>
        <p className="text-slate-600 mt-2">Select a fee structure or enter a custom charge</p>
      </div>

      {/* Fee Structure Selector */}
      {feeStructures.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Select Fee Structure (Recommended)
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Pick a fee structure to auto-fill the amount and description. Student type filters will adjust automatically.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => handleFeeStructureChange('')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                !selectedFeeStructure
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="font-medium text-slate-700">Custom Charge</p>
              <p className="text-xs text-slate-500 mt-1">Enter amount manually</p>
            </button>
            {feeStructures.map((fee) => (
              <button
                key={fee.id}
                onClick={() => handleFeeStructureChange(fee.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedFeeStructure === fee.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <p className="font-medium text-slate-900">{fee.name}</p>
                <p className="text-lg font-bold text-indigo-600 mt-1">${fee.amount.toFixed(2)}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fee.term && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{fee.term.name}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    fee.studentType === 'DAY_SCHOLAR' ? 'bg-blue-100 text-blue-700'
                    : fee.studentType === 'BOARDER' ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                  }`}>
                    {fee.studentType === 'DAY_SCHOLAR' ? 'Day Scholar' : fee.studentType === 'BOARDER' ? 'Boarder' : 'Both'}
                  </span>
                  {fee.class && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">{fee.class.name}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{fee.academicYear.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Students
              <span className="text-sm font-normal text-slate-500">({selectedStudents.size} selected)</span>
            </h2>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or student number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            <select
              value={selectedCurriculum}
              onChange={(e) => setSelectedCurriculum(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Curriculums</option>
              <option value="ZIMSEC">ZimSec</option>
              <option value="CAMBRIDGE">Cambridge</option>
            </select>
            <select
              value={selectedStudentType}
              onChange={(e) => setSelectedStudentType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="DAY_SCHOLAR">Day Scholar</option>
              <option value="BOARDER">Boarder</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ENROLLED">Enrolled</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Quick Actions + Summary */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {selectedClass && (
                <button
                  onClick={handleSelectByClass}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
                >
                  Select All in {selectedClass}
                </button>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('');
                  setSelectedCurriculum('');
                  setSelectedStudentType('');
                  setSelectedStatus('ACTIVE');
                }}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-xs font-medium"
              >
                Clear Filters
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {filteredStudents.length} of {students.length} students shown
            </p>
          </div>

          {/* Student List */}
          <div className="max-h-[450px] overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No students found</p>
            ) : (
              filteredStudents.map((student) => (
                <label
                  key={student.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedStudents.has(student.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                    className="w-4 h-4 text-blue-600 rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">
                      {student.firstName} {student.lastName}
                      <span className="text-slate-400 font-normal ml-2">{student.studentNumber}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{student.currentClass?.name || 'No Class'}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        student.curriculum === 'ZIMSEC' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {student.curriculum}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        student.isBoarding ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {student.isBoarding ? 'Boarder' : 'Day'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm font-medium flex-shrink-0 ${
                    Number(student.account?.balance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    ${Number(student.account?.balance || 0).toFixed(2)}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Charge Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit sticky top-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Charge Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0.00"
              />
              {selectedFeeStructure && (
                <p className="text-xs text-indigo-600 mt-1">Auto-filled from fee structure</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Charge Type</label>
              <select
                value={chargeType}
                onChange={(e) => setChargeType(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select type (optional)</option>
                <optgroup label="Combined Fees">
                  <option value="Tuition & Boarding">Tuition & Boarding</option>
                  <option value="Tuition & Books">Tuition & Books</option>
                  <option value="Full Package">Full Package</option>
                </optgroup>
                <optgroup label="Individual Fees">
                  <option value="Tuition">Tuition</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Transport">Transport</option>
                  <option value="Books">Books & Materials</option>
                  <option value="Uniform">Uniform</option>
                  <option value="Activities">Activities</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Sports">Sports</option>
                  <option value="Exam Fees">Exam Fees</option>
                  <option value="Late Fee">Late Fee</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g., Term 1 Tuition - 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Optional notes..."
              />
            </div>

            {/* Summary */}
            {selectedStudents.size > 0 && amount && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-1">
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">Students:</span> {selectedStudents.size}
                </p>
                <p className="text-sm text-indigo-800">
                  <span className="font-medium">Per Student:</span> ${parseFloat(amount || '0').toFixed(2)}
                </p>
                <p className="text-xl font-bold text-indigo-900 pt-1">
                  Total: ${(selectedStudents.size * parseFloat(amount || '0')).toFixed(2)}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || selectedStudents.size === 0 || !amount || !description}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Apply Charges ({selectedStudents.size})
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
