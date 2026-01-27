'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  BookOpen,
} from 'lucide-react';

interface ApplicationStatus {
  applicationNumber: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ENROLLED';
  studentName: string;
  gradeApplying: string;
  curriculum: string;
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export default function ApplicationStatusPage() {
  const [applicationNumber, setApplicationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationNumber || !email) {
      setError('Please enter both application number and email');
      return;
    }

    setLoading(true);
    setError('');
    setApplicationStatus(null);

    try {
      const response = await fetch(`/api/apply?applicationNumber=${encodeURIComponent(applicationNumber)}&email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Application not found');
      }

      setApplicationStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bg: 'bg-amber-100',
          border: 'border-amber-200',
          label: 'Pending Review',
          description: 'Your application has been received and is waiting to be reviewed.',
        };
      case 'UNDER_REVIEW':
        return {
          icon: Search,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          border: 'border-blue-200',
          label: 'Under Review',
          description: 'Your application is currently being reviewed by our admissions team.',
        };
      case 'APPROVED':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-100',
          border: 'border-emerald-200',
          label: 'Approved',
          description: 'Congratulations! Your application has been approved. Please proceed with enrollment.',
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          border: 'border-red-200',
          label: 'Not Approved',
          description: 'Unfortunately, your application has not been approved at this time.',
        };
      case 'ENROLLED':
        return {
          icon: GraduationCap,
          color: 'text-purple-600',
          bg: 'bg-purple-100',
          border: 'border-purple-200',
          label: 'Enrolled',
          description: 'Student has been enrolled successfully.',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-slate-600',
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          label: 'Unknown',
          description: 'Unable to determine application status.',
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const gradeLabels: Record<string, string> = {
    'ECD_A': 'ECD A',
    'ECD_B': 'ECD B',
    'GRADE_1': 'Grade 1',
    'GRADE_2': 'Grade 2',
    'GRADE_3': 'Grade 3',
    'GRADE_4': 'Grade 4',
    'GRADE_5': 'Grade 5',
    'GRADE_6': 'Grade 6',
    'GRADE_7': 'Grade 7',
    'FORM_1': 'Form 1',
    'FORM_2': 'Form 2',
    'FORM_3': 'Form 3',
    'FORM_4': 'Form 4',
    'LOWER_6': 'Lower 6 (AS Level)',
    'UPPER_6': 'Upper 6 (A Level)',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Advent Hope Academy</h1>
                <p className="text-xs text-slate-500">Application Status</p>
              </div>
            </Link>
            <Link
              href="/apply"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              New Application
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Check Application Status</h1>
          <p className="text-slate-600">Enter your application details to view the current status</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Application Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg"
                placeholder="e.g., APP2024000001"
              />
              <p className="mt-1 text-sm text-slate-500">
                This was provided when you submitted your application
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Parent/Guardian Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter the email used in your application"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Check Status
                </>
              )}
            </button>
          </form>
        </div>

        {/* Status Result */}
        {applicationStatus && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Status Header */}
            {(() => {
              const config = getStatusConfig(applicationStatus.status);
              return (
                <div className={`p-6 ${config.bg} ${config.border} border-b`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${config.bg} rounded-full flex items-center justify-center border-2 ${config.border}`}>
                      <config.icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Application Status</p>
                      <h2 className={`text-xl font-bold ${config.color}`}>{config.label}</h2>
                    </div>
                  </div>
                  <p className="mt-4 text-slate-700">{config.description}</p>
                </div>
              );
            })()}

            {/* Application Details */}
            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <FileText className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Application Number</p>
                    <p className="font-mono font-semibold text-slate-800">{applicationStatus.applicationNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <User className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Student Name</p>
                    <p className="font-semibold text-slate-800">{applicationStatus.studentName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <BookOpen className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Applying For</p>
                    <p className="font-semibold text-slate-800">
                      {gradeLabels[applicationStatus.gradeApplying] || applicationStatus.gradeApplying} ({applicationStatus.curriculum})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Submitted On</p>
                    <p className="font-semibold text-slate-800">{formatDate(applicationStatus.submittedAt)}</p>
                  </div>
                </div>
              </div>

              {applicationStatus.reviewedAt && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700">
                    <strong>Last Updated:</strong> {formatDate(applicationStatus.reviewedAt)}
                  </p>
                </div>
              )}

              {applicationStatus.notes && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm font-semibold text-amber-800 mb-1">Notes from Admissions:</p>
                  <p className="text-amber-800">{applicationStatus.notes}</p>
                </div>
              )}

              {/* Next Steps based on Status */}
              {applicationStatus.status === 'APPROVED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <h3 className="font-semibold text-emerald-800 mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside text-emerald-800 space-y-1">
                    <li>Visit the school to complete enrollment paperwork</li>
                    <li>Bring original copies of required documents</li>
                    <li>Pay the registration and first term fees</li>
                    <li>Collect your student ID and uniform details</li>
                  </ol>
                </div>
              )}

              {applicationStatus.status === 'REJECTED' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="font-semibold text-slate-800 mb-2">What Now?</h3>
                  <p className="text-slate-600">
                    If you believe there has been an error or would like more information about this decision, 
                    please contact our admissions office at{' '}
                    <a href="mailto:admissions@adventhopeacademy.ac.zw" className="text-blue-600 hover:underline">
                      admissions@adventhopeacademy.ac.zw
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition-colors"
              >
                Print Status
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-slate-600">
            Having trouble finding your application?{' '}
            <a href="mailto:admissions@adventhopeacademy.ac.zw" className="text-blue-600 hover:underline">
              Contact Admissions
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
