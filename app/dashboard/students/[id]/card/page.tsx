'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Printer,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  User,
  Calendar,
  Heart,
  QrCode,
} from 'lucide-react';

interface StudentCard {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  curriculum: string;
  status: string;
  photo?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  isBoarding: boolean;
  school?: {
    name: string;
    logo?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  currentClass?: {
    name: string;
  };
  account?: {
    balance: number;
  };
  parents?: Array<{
    relationship: string;
    isPrimary: boolean;
    parent: {
      user: {
        name: string;
        phone?: string;
        email?: string;
      };
    };
  }>;
}

export default function StudentCardPage() {
  const params = useParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [student, setStudent] = useState<StudentCard | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handlePrint = () => {
    // Use improved print functionality
    if (cardRef.current) {
      const printContent = cardRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    } else {
      window.print();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  const primaryParent = student.parents?.find(p => p.isPrimary)?.parent.user;
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Page Header - Hidden on Print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/students/${student.id}`}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Student Registration Card</h1>
            <p className="text-slate-600 mt-1">
              {student.firstName} {student.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 font-medium"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Registration Card */}
      <div className="flex justify-center print:block">
        <div
          ref={cardRef}
          className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg print:shadow-none print:border print:max-w-none"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{student.school?.name || 'Advent Hope Academy'}</h2>
                  <p className="text-blue-100">Student Registration Card</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Academic Year</p>
                <p className="text-xl font-bold">{currentYear}</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Photo Section */}
              <div className="text-center">
                <div className="w-32 h-40 mx-auto bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200 overflow-hidden">
                  {student.photo ? (
                    <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <User className="h-16 w-16 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 mt-1">Photo</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 p-2 bg-slate-100 rounded">
                  <p className="text-xs text-slate-600">Student No.</p>
                  <p className="font-mono font-bold text-slate-800">{student.studentNumber}</p>
                </div>
              </div>

              {/* Student Info */}
              <div className="md:col-span-2 space-y-4">
                {/* Name */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Full Name</p>
                  <p className="text-xl font-bold text-slate-800">
                    {student.firstName} {student.middleName} {student.lastName}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Date of Birth</p>
                    <p className="font-semibold text-slate-800">{formatDate(student.dateOfBirth)}</p>
                    <p className="text-sm text-slate-600">({calculateAge(student.dateOfBirth)} years)</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Gender</p>
                    <p className="font-semibold text-slate-800">{student.gender}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Class/Form</p>
                    <p className="font-semibold text-slate-800">{student.currentClass?.name || 'Not Assigned'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Curriculum</p>
                    <p className="font-semibold text-slate-800">{student.curriculum}</p>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    student.isBoarding 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {student.isBoarding ? 'Boarding Student' : 'Day Scholar'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    student.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-dashed border-slate-300"></div>

            {/* Medical & Parent Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Medical Info */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Medical Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-slate-50 rounded">
                    <span className="text-slate-600">Blood Group:</span>
                    <span className="font-semibold text-slate-800">{student.bloodGroup || 'Not Recorded'}</span>
                  </div>
                  {student.allergies && (
                    <div className="p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs text-red-600 font-medium">Allergies:</p>
                      <p className="text-red-700">{student.allergies}</p>
                    </div>
                  )}
                  {student.medicalConditions && (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs text-amber-600 font-medium">Medical Conditions:</p>
                      <p className="text-amber-700">{student.medicalConditions}</p>
                    </div>
                  )}
                  {!student.allergies && !student.medicalConditions && (
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                      <p className="text-emerald-700 text-sm">No known allergies or conditions</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent/Guardian Info */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Parent/Guardian Contact
                </h3>
                {primaryParent ? (
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-semibold text-slate-800">{primaryParent.name}</p>
                    </div>
                    {primaryParent.phone && (
                      <div className="p-2 bg-slate-50 rounded flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-800">{primaryParent.phone}</span>
                      </div>
                    )}
                    {primaryParent.email && (
                      <div className="p-2 bg-slate-50 rounded flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-800 text-xs">{primaryParent.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No parent contact on record</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-dashed border-slate-300"></div>

            {/* Fee Status */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Current Fee Balance</p>
                  <p className={`text-2xl font-bold ${
                    (student.account?.balance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {formatCurrency(student.account?.balance || 0)}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  (student.account?.balance || 0) >= 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {(student.account?.balance || 0) >= 0 ? 'Paid Up' : 'Outstanding'}
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-slate-100 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600">
                <p>Issued: {new Date().toLocaleDateString()}</p>
                {student.school?.phone && <p>School Tel: {student.school.phone}</p>}
              </div>
              <div className="text-right text-slate-500 text-xs">
                <p>This card is property of {student.school?.name || 'Advent Hope Academy'}</p>
                <p>If found, please return to the school</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            page-break-inside: avoid;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          /* Ensure proper printing of cards */
          .print\\:block .bg-gradient-to-r {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Remove shadows and borders for print */
          .print\\:block .shadow-lg {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
