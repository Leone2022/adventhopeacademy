'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Users,
  Printer,
  X,
} from 'lucide-react';

interface Guardian {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  occupation?: string;
}

interface Application {
  id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  curriculum: string;
  applyingForClass: string;
  previousSchool?: string;
  guardianInfo: Guardian;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WAITLISTED: 'bg-orange-100 text-orange-700',
  ENROLLED: 'bg-teal-100 text-teal-700',
};

const statusIcons: Record<string, React.ElementType> = {
  DRAFT: FileText,
  PENDING: Clock,
  UNDER_REVIEW: Eye,
  INTERVIEW_SCHEDULED: Calendar,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  WAITLISTED: AlertCircle,
  ENROLLED: GraduationCap,
};

export default function ApplicationsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const response = await fetch(`/api/applications?${params}`);
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, newStatus: string, notes?: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reviewNotes: notes }),
      });

      if (response.ok) {
        fetchApplications();
        if (selectedApplication?.id === id) {
          const updatedApp = await response.json();
          setSelectedApplication(updatedApp);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const convertToStudent = async (id: string) => {
    if (!confirm('Convert this application to a student record? This cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/applications/${id}/convert`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Success! Student enrolled with number: ${data.student.studentNumber}`);
        fetchApplications();
        setShowModal(false);
      } else {
        alert(data.error || 'Failed to convert application');
      }
    } catch (err) {
      alert('Failed to convert application');
    } finally {
      setUpdating(false);
    }
  };

  const exportToPDF = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Applications Report - Advent Hope Academy</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 10mm; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #1f2937;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 15px;
            }
            .header h1 {
              font-size: 24px;
              color: #1e40af;
              margin: 0 0 5px 0;
            }
            .header p {
              color: #6b7280;
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px 10px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 600;
              color: #374151;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .status {
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-approved { background: #d1fae5; color: #065f46; }
            .status-rejected { background: #fee2e2; color: #991b1b; }
            .status-review { background: #dbeafe; color: #1e40af; }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Advent Hope Academy</h1>
            <p>Student Applications Report</p>
            <p>Generated on: ${new Date().toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</p>
          </div>
          ${printContent}
          <div class="footer">
            <p>Total Applications: ${total} | Page 1 of 1</p>
            <p>This report is confidential and for internal use only.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const exportSingleToPDF = (app: Application) => {
    const guardian = app.guardianInfo as Guardian;
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Application ${app.applicationNumber} - Advent Hope Academy</title>
          <style>
            @media print {
              @page { size: A4; margin: 15mm; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 12px;
              line-height: 1.6;
              color: #1f2937;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .header h1 {
              font-size: 28px;
              color: #1e40af;
              margin: 0 0 5px 0;
            }
            .header h2 {
              font-size: 18px;
              color: #374151;
              margin: 10px 0 5px 0;
              font-weight: normal;
            }
            .app-number {
              font-size: 14px;
              color: #6b7280;
              background: #f3f4f6;
              padding: 5px 15px;
              border-radius: 20px;
              display: inline-block;
              margin-top: 10px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #1e40af;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px 30px;
            }
            .info-item {
              margin-bottom: 8px;
            }
            .info-label {
              font-size: 10px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              font-size: 13px;
              color: #111827;
              font-weight: 500;
            }
            .status-badge {
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              display: inline-block;
            }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-approved { background: #d1fae5; color: #065f46; }
            .status-rejected { background: #fee2e2; color: #991b1b; }
            .status-review { background: #dbeafe; color: #1e40af; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 10px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Advent Hope Academy</h1>
            <h2>Student Application Form</h2>
            <div class="app-number">Application #: ${app.applicationNumber}</div>
          </div>

          <div class="section">
            <div class="section-title">Application Status</div>
            <span class="status-badge status-${app.status.toLowerCase().replace('_', '-')}">${app.status.replace('_', ' ')}</span>
            <span style="margin-left: 20px; color: #6b7280;">Submitted: ${new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div class="section">
            <div class="section-title">Student Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${app.firstName} ${app.middleName || ''} ${app.lastName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">${new Date(app.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${app.gender}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${app.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${app.phone || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Address</div>
                <div class="info-value">${app.address || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Academic Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Applying For</div>
                <div class="info-value">${app.applyingForClass.replace('_', ' ')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Curriculum</div>
                <div class="info-value">${app.curriculum}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Previous School</div>
                <div class="info-value">${app.previousSchool || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Parent/Guardian Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">${guardian?.name || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Relationship</div>
                <div class="info-value">${guardian?.relationship || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${guardian?.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${guardian?.phone || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Occupation</div>
                <div class="info-value">${guardian?.occupation || 'N/A'}</div>
              </div>
            </div>
          </div>

          ${app.reviewNotes ? `
          <div class="section">
            <div class="section-title">Review Notes</div>
            <p style="color: #374151;">${app.reviewNotes}</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</p>
            <p>This document is confidential and for internal use only.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Applications</h1>
        <p className="text-gray-600 mt-1">Manage and review student applications</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or application number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="ENROLLED">Enrolled</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Approved', value: applications.filter(a => a.status === 'APPROVED').length, color: 'bg-green-50 text-green-700' },
          { label: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length, color: 'bg-red-50 text-red-700' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applying For
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Guardian
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No applications found</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const StatusIcon = statusIcons[app.status] || FileText;
                  const guardian = app.guardianInfo as Guardian;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-blue-600">
                          {app.applicationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {app.firstName[0]}{app.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {app.firstName} {app.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{app.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {app.email && (
                            <p className="text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {app.email}
                            </p>
                          )}
                          {app.phone && (
                            <p className="text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {app.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {app.applyingForClass.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">{app.curriculum}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{guardian?.name}</p>
                          <p className="text-gray-500">{guardian?.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedApplication(app); setShowModal(true); }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => exportSingleToPDF(app)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Export PDF"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} applications
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Print Content */}
      <div ref={printRef} className="hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>App #</th>
              <th>Student Name</th>
              <th>Contact</th>
              <th>Class</th>
              <th>Guardian</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const guardian = app.guardianInfo as Guardian;
              return (
                <tr key={app.id}>
                  <td>{app.applicationNumber}</td>
                  <td>{app.firstName} {app.lastName}</td>
                  <td>{app.email || app.phone || 'N/A'}</td>
                  <td>{app.applyingForClass.replace('_', ' ')}</td>
                  <td>{guardian?.name} ({guardian?.phone})</td>
                  <td>
                    <span className={`status status-${app.status.toLowerCase().replace('_', '-')}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{formatDate(app.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Application Details</h3>
                    <p className="text-blue-100 text-sm">{selectedApplication.applicationNumber}</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                {/* Status Badge */}
                <div className="mb-6">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedApplication.status]}`}>
                    {React.createElement(statusIcons[selectedApplication.status] || FileText, { className: 'h-4 w-4' })}
                    {selectedApplication.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Student Info */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Student Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedApplication.firstName} {selectedApplication.middleName || ''} {selectedApplication.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-medium">{formatDate(selectedApplication.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium">{selectedApplication.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{selectedApplication.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium">{selectedApplication.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium">{selectedApplication.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500">Applying For</p>
                      <p className="font-medium">{selectedApplication.applyingForClass.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Curriculum</p>
                      <p className="font-medium">{selectedApplication.curriculum}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Previous School</p>
                      <p className="font-medium">{selectedApplication.previousSchool || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Guardian Info */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Guardian Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    {(() => {
                      const guardian = selectedApplication.guardianInfo as Guardian;
                      return (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="font-medium">{guardian?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Relationship</p>
                            <p className="font-medium">{guardian?.relationship || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium">{guardian?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-medium">{guardian?.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Occupation</p>
                            <p className="font-medium">{guardian?.occupation || 'N/A'}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Review Notes */}
                {selectedApplication.reviewNotes && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Review Notes</h4>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedApplication.reviewNotes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-2 justify-between items-center border-t">
                <div className="flex gap-2">
                  <button
                    onClick={() => exportSingleToPDF(selectedApplication)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>
                <div className="flex gap-2">
                  {selectedApplication.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'UNDER_REVIEW')}
                        disabled={updating}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" />
                        Mark Under Review
                      </button>
                    </>
                  )}
                  {(selectedApplication.status === 'PENDING' || selectedApplication.status === 'UNDER_REVIEW') && (
                    <>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'APPROVED')}
                        disabled={updating}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            updateApplicationStatus(selectedApplication.id, 'REJECTED', reason);
                          }
                        }}
                        disabled={updating}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {selectedApplication.status === 'APPROVED' && !selectedApplication.id.includes('converted') && (
                    <button
                      onClick={() => convertToStudent(selectedApplication.id)}
                      disabled={updating}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
                    >
                      <GraduationCap className="h-5 w-5" />
                      {updating ? 'Converting...' : 'Convert to Student & Enroll'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
