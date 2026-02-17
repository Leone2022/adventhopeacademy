'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { exportToExcel, exportToPDF, exportToWord, fetchStudentsForExport } from '@/lib/export-utils';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  FileText,
  BarChart3,
  File,
} from 'lucide-react';

interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  curriculum: string;
  status: string;
  email?: string;
  phone?: string;
  photo?: string;
  isBoarding: boolean;
  currentClass?: {
    id: string;
    name: string;
  };
  account?: {
    balance: number;
  };
  parents?: Array<{
    parent: {
      user: {
        name: string;
        email: string;
        phone: string;
      };
    };
    relationship: string;
    isPrimary: boolean;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  GRADUATED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: GraduationCap },
  TRANSFERRED: { bg: 'bg-amber-100', text: 'text-amber-700', icon: MapPin },
  SUSPENDED: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
  EXPELLED: { bg: 'bg-red-200', text: 'text-red-800', icon: X },
  WITHDRAWN: { bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock },
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [boardingFilter, setBoardingFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [stats, setStats] = useState({ total: 0, zimsec: 0, cambridge: 0, active: 0, boarding: 0, dayScholar: 0 });
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; studentId: string | null; studentName: string }>({ show: false, studentId: null, studentName: '' });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: viewAll ? '10000' : pagination.limit.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (curriculumFilter) params.append('curriculum', curriculumFilter);
      if (classFilter) params.append('classId', classFilter);
      if (boardingFilter) params.append('isBoarding', boardingFilter);

      const response = await fetch(`/api/students?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/students?limit=10000');
      const data = await response.json();
      if (response.ok) {
        const allStudents = data.students;
        setStats({
          total: allStudents.length,
          zimsec: allStudents.filter((s: Student) => s.curriculum === 'ZIMSEC').length,
          cambridge: allStudents.filter((s: Student) => s.curriculum === 'CAMBRIDGE').length,
          active: allStudents.filter((s: Student) => s.status === 'ACTIVE').length,
          boarding: allStudents.filter((s: Student) => s.isBoarding).length,
          dayScholar: allStudents.filter((s: Student) => !s.isBoarding).length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, searchTerm, statusFilter, curriculumFilter, classFilter, boardingFilter, viewAll]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDeleteConfirm({ show: false, studentId: null, studentName: '' });
        fetchStudents(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportStudents = async (
    format: 'excel' | 'pdf' | 'word',
    curriculumOverride?: string
  ) => {
    setExporting(true);
    try {
      const curriculumValue = typeof curriculumOverride === 'string'
        ? curriculumOverride
        : curriculumFilter;

      const allStudents = await fetchStudentsForExport({
        search: searchTerm,
        status: statusFilter,
        curriculum: curriculumValue || undefined,
      });

      if (!allStudents || allStudents.length === 0) {
        alert('No students to export');
        return;
      }

      const datePart = new Date().toISOString().split('T')[0];
      const label = curriculumValue ? curriculumValue : 'all';

      if (format === 'excel') {
        await exportToExcel(allStudents, `students-${label}-${datePart}.xlsx`);
        return;
      }

      if (format === 'pdf') {
        await exportToPDF(allStudents, `students-${label}-${datePart}.pdf`);
        return;
      }

      await exportToWord(allStudents, `students-${label}-${datePart}.docx`);
    } catch (error) {
      console.error(`Error exporting to ${format.toUpperCase()}:`, error);
      alert(`Failed to export to ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusColors[status] || statusColors.ACTIVE;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-600 mt-1">
            Manage student registrations, profiles, and records
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative group">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm hover:shadow active:scale-95">
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500">Excel</div>
              <button
                onClick={() => exportStudents('excel', '')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                {exporting ? 'Exporting...' : 'Export All (Excel)'}
              </button>
              <button
                onClick={() => exportStudents('excel', 'ZIMSEC')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                {exporting ? 'Exporting...' : 'Export ZIMSEC (Excel)'}
              </button>
              <button
                onClick={() => exportStudents('excel', 'CAMBRIDGE')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                {exporting ? 'Exporting...' : 'Export Cambridge (Excel)'}
              </button>

              <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-t border-slate-200">PDF</div>
              <button
                onClick={() => exportStudents('pdf', '')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4 text-red-600" />
                {exporting ? 'Exporting...' : 'Export All (PDF)'}
              </button>
              <button
                onClick={() => exportStudents('pdf', 'ZIMSEC')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4 text-red-600" />
                {exporting ? 'Exporting...' : 'Export ZIMSEC (PDF)'}
              </button>
              <button
                onClick={() => exportStudents('pdf', 'CAMBRIDGE')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4 text-red-600" />
                {exporting ? 'Exporting...' : 'Export Cambridge (PDF)'}
              </button>

              <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-t border-slate-200">Word</div>
              <button
                onClick={() => exportStudents('word', '')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <File className="h-4 w-4 text-blue-600" />
                {exporting ? 'Exporting...' : 'Export All (Word)'}
              </button>
              <button
                onClick={() => exportStudents('word', 'ZIMSEC')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <File className="h-4 w-4 text-blue-600" />
                {exporting ? 'Exporting...' : 'Export ZIMSEC (Word)'}
              </button>
              <button
                onClick={() => exportStudents('word', 'CAMBRIDGE')}
                disabled={exporting}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <File className="h-4 w-4 text-blue-600" />
                {exporting ? 'Exporting...' : 'Export Cambridge (Word)'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Quick Export (Excel):</span>
            <button
              onClick={() => exportStudents('excel', '')}
              disabled={exporting}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              All
            </button>
            <button
              onClick={() => exportStudents('excel', 'ZIMSEC')}
              disabled={exporting}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ZIMSEC
            </button>
            <button
              onClick={() => exportStudents('excel', 'CAMBRIDGE')}
              disabled={exporting}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cambridge
            </button>
          </div>
          <Link
            href="/dashboard/students/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setCurriculumFilter('');
            setBoardingFilter('');
            setStatusFilter('');
            setClassFilter('');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            !curriculumFilter && !boardingFilter && !statusFilter && !classFilter
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="inline h-4 w-4 mr-2" />
          All Students ({stats.total})
        </button>
        <button
          onClick={() => {
            setCurriculumFilter('ZIMSEC');
            setBoardingFilter('');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            curriculumFilter === 'ZIMSEC'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          🇿🇼 ZimSec ({stats.zimsec})
        </button>
        <button
          onClick={() => {
            setCurriculumFilter('CAMBRIDGE');
            setBoardingFilter('');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            curriculumFilter === 'CAMBRIDGE'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          🌐 Cambridge ({stats.cambridge})
        </button>
        <button
          onClick={() => {
            setBoardingFilter('true');
            setCurriculumFilter('');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            boardingFilter === 'true'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-50'
          }`}
        >
          🏠 Boarders ({stats.boarding})
        </button>
        <button
          onClick={() => {
            setBoardingFilter('false');
            setCurriculumFilter('');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            boardingFilter === 'false'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-white border border-cyan-300 text-cyan-700 hover:bg-cyan-50'
          }`}
        >
          🚌 Day Scholars ({stats.dayScholar})
        </button>
        <button
          onClick={() => {
            setStatusFilter('ACTIVE');
            setCurriculumFilter('');
            setBoardingFilter('');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === 'ACTIVE'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
          }`}
        >
          <CheckCircle className="inline h-4 w-4 mr-2" />
          Active ({stats.active})
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Students</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">ZIMSEC 🇿🇼</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.zimsec}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Cambridge 🌐</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.cambridge}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, student number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </form>

          {/* View All Toggle */}
          <button
            onClick={() => setViewAll(!viewAll)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors font-medium ${
              viewAll
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            {viewAll ? `All ${stats.total}` : 'View All'}
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="GRADUATED">Graduated</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Curriculum
              </label>
              <select
                value={curriculumFilter}
                onChange={(e) => setCurriculumFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Curricula</option>
                <option value="ZIMSEC">ZIMSEC</option>
                <option value="CAMBRIDGE">Cambridge</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Student Type
              </label>
              <select
                value={boardingFilter}
                onChange={(e) => setBoardingFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Student Types</option>
                <option value="true">Boarders</option>
                <option value="false">Day Scholars</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurriculumFilter('');
                  setClassFilter('');
                  setBoardingFilter('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium mt-6"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Summary */}
      {(statusFilter || curriculumFilter || boardingFilter || classFilter || searchTerm) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-blue-900 mb-2">
                Showing {students.length} of {stats.total} students
              </p>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-700">
                    Search: &quot;{searchTerm}&quot;
                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {curriculumFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-700">
                    {curriculumFilter}
                    <button onClick={() => setCurriculumFilter('')} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {boardingFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-700">
                    {boardingFilter === 'true' ? 'Boarders' : 'Day Scholars'}
                    <button onClick={() => setBoardingFilter('')} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-700">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('')} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCurriculumFilter('');
                setClassFilter('');
                setBoardingFilter('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Student
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Student Number
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Class
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Type & Curriculum
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Balance
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="animate-pulse flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">No students found</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {student.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-700">
                        {student.studentNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700">
                        {student.currentClass?.name || 'Not assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.curriculum === 'CAMBRIDGE'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {student.curriculum}
                        </span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.isBoarding
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {student.isBoarding ? '🏠 Boarder' : '🚌 Day Scholar'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        Number(student.account?.balance || 0) < 0
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}>
                        {formatCurrency(Number(student.account?.balance || 0))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/students/${student.id}`}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/students/${student.id}/edit`}
                          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/students/${student.id}/card`}
                          className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                          title="Print Registration Card"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, studentId: student.id, studentName: `${student.firstName} ${student.lastName}` })}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!viewAll && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} students
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {viewAll && students.length > 0 && (
          <div className="flex items-center justify-center px-6 py-4 border-t border-slate-200 bg-emerald-50">
            <p className="text-sm font-medium text-emerald-700">
              Showing all {students.length} students
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Delete Student</h3>
                <p className="text-sm text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deleteConfirm.studentName}</span>? This will permanently remove the student record and all associated data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, studentId: null, studentName: '' })}
                className="px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.studentId && handleDelete(deleteConfirm.studentId)}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
