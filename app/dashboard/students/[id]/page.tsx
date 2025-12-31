'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Heart,
  Users,
  Wallet,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  Printer,
  Plus,
  TrendingUp,
  TrendingDown,
  Home,
  CreditCard,
  Activity,
  BookOpen,
  Trophy,
  School,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

interface StudentDetail {
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
  address?: string;
  photo?: string;
  nationalId?: string;
  birthCertNumber?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  isBoarding: boolean;
  admissionDate: string;
  previousSchool?: string;
  previousGrade?: string;
  // Former Primary School
  formerPrimarySchool?: string;
  formerPrimarySchoolAddress?: string;
  formerPrimarySchoolContact?: string;
  formerPrimaryGrade?: string;
  // Recreational Activities
  recreationalActivities?: string[];
  specialTalents?: string;
  clubsInterests?: string;
  // Documents
  academicResults?: Array<{
    name: string;
    url: string;
    uploadedAt: string;
    type?: string;
  }>;
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: string;
    type?: string;
  }>;
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  school?: {
    name: string;
    logo?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  currentClass?: {
    id: string;
    name: string;
    academicYear?: {
      name: string;
    };
  };
  account?: {
    balance: number;
    lastPaymentDate?: string;
    lastPaymentAmount?: number;
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      processedAt: string;
      paymentMethod?: string;
    }>;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      total: number;
      amountPaid: number;
      amountDue: number;
      status: string;
      issueDate: string;
      dueDate: string;
    }>;
  };
  parents?: Array<{
    relationship: string;
    isPrimary: boolean;
    parent: {
      user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
      };
    };
  }>;
  hostelAllocation?: {
    bed: {
      bedNumber: string;
      room: {
        roomNumber: string;
        hostel: {
          name: string;
        };
      };
    };
  };
  grades?: Array<{
    id: string;
    assessmentType: string;
    assessmentName: string;
    score: number;
    maxScore: number;
    percentage: number;
    grade?: string;
    subject: {
      name: string;
    };
    term: {
      name: string;
    };
  }>;
  attendance?: Array<{
    date: string;
    status: string;
    remarks?: string;
  }>;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  GRADUATED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  TRANSFERRED: { bg: 'bg-amber-100', text: 'text-amber-700' },
  SUSPENDED: { bg: 'bg-red-100', text: 'text-red-700' },
  WITHDRAWN: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

export default function StudentDetailPage() {
  const params = useParams();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'activities', label: 'Activities', icon: Trophy },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'parents', label: 'Parents', icon: Users },
    { id: 'medical', label: 'Medical', icon: Heart },
  ];

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
        <p className="text-slate-600 mt-2">The student you're looking for doesn't exist.</p>
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

  const statusConfig = statusColors[student.status] || statusColors.ACTIVE;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/students"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
              {student.photo ? (
                <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
              ) : (
                <>{student.firstName[0]}{student.lastName[0]}</>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {student.firstName} {student.middleName} {student.lastName}
              </h1>
              <p className="text-slate-600 font-mono">{student.studentNumber}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  {student.status}
                </span>
                <span className="text-sm text-slate-500">
                  {student.currentClass?.name || 'No class assigned'}
                </span>
                <span className="text-sm text-slate-500">
                  {student.curriculum}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/students/${student.id}/card`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm hover:shadow active:scale-95"
          >
            <FileText className="h-4 w-4" />
            Print ID Card
          </Link>
          <Link
            href={`/dashboard/students/${student.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
          >
            <Edit className="h-4 w-4" />
            Edit Student
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Fee Balance</p>
              <p className={`text-2xl font-bold mt-1 ${
                (student.account?.balance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {formatCurrency(student.account?.balance || 0)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              (student.account?.balance || 0) < 0 ? 'bg-red-100' : 'bg-emerald-100'
            }`}>
              <Wallet className={`h-6 w-6 ${
                (student.account?.balance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'
              }`} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">95%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Age</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {calculateAge(student.dateOfBirth)} years
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Type</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {student.isBoarding ? 'Boarding' : 'Day'}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Full Name</p>
                      <p className="font-medium text-slate-800">
                        {student.firstName} {student.middleName} {student.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Date of Birth</p>
                      <p className="font-medium text-slate-800">
                        {formatDate(student.dateOfBirth)} ({calculateAge(student.dateOfBirth)} years old)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Gender</p>
                      <p className="font-medium text-slate-800">{student.gender}</p>
                    </div>
                  </div>
                  {student.nationalId && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">National ID</p>
                        <p className="font-medium text-slate-800">{student.nationalId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {student.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <a href={`mailto:${student.email}`} className="font-medium text-blue-600 hover:text-blue-700">
                          {student.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <a href={`tel:${student.phone}`} className="font-medium text-blue-600 hover:text-blue-700">
                          {student.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Address</p>
                        <p className="font-medium text-slate-800">{student.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Class</p>
                      <p className="font-medium text-slate-800">
                        {student.currentClass?.name || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Curriculum</p>
                      <p className="font-medium text-slate-800">{student.curriculum}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Admission Date</p>
                      <p className="font-medium text-slate-800">{formatDate(student.admissionDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accommodation */}
              {student.isBoarding && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Accommodation</h3>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Home className="h-10 w-10 text-purple-600" />
                      <div>
                        <p className="font-semibold text-slate-800">Boarding Student</p>
                        {student.hostelAllocation ? (
                          <p className="text-sm text-slate-600">
                            {student.hostelAllocation.bed.room.hostel.name} - 
                            Room {student.hostelAllocation.bed.room.roomNumber}, 
                            Bed {student.hostelAllocation.bed.bedNumber}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-600">No room allocation yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Recent Grades</h3>
              {student.grades && student.grades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Subject</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Assessment</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Score</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Grade</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Term</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {student.grades.map((grade) => (
                        <tr key={grade.id}>
                          <td className="px-4 py-3 text-slate-800">{grade.subject.name}</td>
                          <td className="px-4 py-3 text-slate-600">{grade.assessmentName}</td>
                          <td className="px-4 py-3">
                            <span className="font-medium">{grade.score}/{grade.maxScore}</span>
                            <span className="text-slate-500 ml-2">({grade.percentage}%)</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm font-medium">
                              {grade.grade || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{grade.term.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No grades recorded yet
                </div>
              )}

              {/* Former Primary School Info */}
              {student.formerPrimarySchool && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Former Primary School</h3>
                  <div className="p-5 bg-slate-50 rounded-xl">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">School Name</p>
                        <p className="font-medium text-slate-800">{student.formerPrimarySchool}</p>
                      </div>
                      {student.formerPrimaryGrade && (
                        <div>
                          <p className="text-sm text-slate-500">Grade Completed</p>
                          <p className="font-medium text-slate-800">{student.formerPrimaryGrade}</p>
                        </div>
                      )}
                      {student.formerPrimarySchoolAddress && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-slate-500">Address</p>
                          <p className="font-medium text-slate-800">{student.formerPrimarySchoolAddress}</p>
                        </div>
                      )}
                      {student.formerPrimarySchoolContact && (
                        <div>
                          <p className="text-sm text-slate-500">Contact</p>
                          <p className="font-medium text-slate-800">{student.formerPrimarySchoolContact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Recreational Activities & Interests</h3>
              
              {/* Activities */}
              {student.recreationalActivities && student.recreationalActivities.length > 0 ? (
                <div>
                  <h4 className="font-medium text-slate-700 mb-3">Activities</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.recreationalActivities.map((activity, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-50 rounded-xl text-center text-slate-500">
                  No recreational activities recorded
                </div>
              )}

              {/* Special Talents */}
              {student.specialTalents && (
                <div className="mt-6">
                  <h4 className="font-medium text-slate-700 mb-3">Special Talents & Skills</h4>
                  <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-purple-600 mt-0.5" />
                      <p className="text-purple-800">{student.specialTalents}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clubs & Interests */}
              {student.clubsInterests && (
                <div className="mt-6">
                  <h4 className="font-medium text-slate-700 mb-3">Clubs & Organizations</h4>
                  <div className="p-5 bg-teal-50 rounded-xl border border-teal-200">
                    <p className="text-teal-800">{student.clubsInterests}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-8">
              {/* Student Photo */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Photo</h3>
                <div className="w-40 h-52 bg-slate-100 border-2 border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {student.photo ? (
                    <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No photo uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Results */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Results & Report Cards</h3>
                {student.academicResults && student.academicResults.length > 0 ? (
                  <div className="space-y-3">
                    {student.academicResults.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-slate-800">{file.name}</p>
                            <p className="text-sm text-slate-500">
                              Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 rounded-xl text-center text-slate-500">
                    No academic results uploaded
                  </div>
                )}
              </div>

              {/* Supporting Documents */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Supporting Documents</h3>
                {student.documents && student.documents.length > 0 ? (
                  <div className="space-y-3">
                    {student.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="font-medium text-slate-800">{file.name}</p>
                            <p className="text-sm text-slate-500">
                              Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 rounded-xl text-center text-slate-500">
                    No supporting documents uploaded
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              {/* Balance Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600">Current Balance</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    (student.account?.balance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {formatCurrency(student.account?.balance || 0)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600">Last Payment</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {student.account?.lastPaymentAmount 
                      ? formatCurrency(student.account.lastPaymentAmount) 
                      : 'N/A'}
                  </p>
                  {student.account?.lastPaymentDate && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(student.account.lastPaymentDate)}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <Link
                    href={`/dashboard/students/${student.id}/payment`}
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                  >
                    <Plus className="h-5 w-5" />
                    Record Payment
                  </Link>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h3>
                {student.account?.transactions && student.account.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {student.account.transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            txn.type === 'PAYMENT' ? 'bg-emerald-100' : 'bg-red-100'
                          }`}>
                            {txn.type === 'PAYMENT' ? (
                              <TrendingUp className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{txn.description}</p>
                            <p className="text-sm text-slate-500">
                              {formatDate(txn.processedAt)} • {txn.paymentMethod || txn.type}
                            </p>
                          </div>
                        </div>
                        <span className={`font-semibold ${
                          txn.type === 'PAYMENT' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {txn.type === 'PAYMENT' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No transactions recorded yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parents Tab */}
          {activeTab === 'parents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Parents/Guardians</h3>
              {student.parents && student.parents.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {student.parents.map((parentLink, index) => (
                    <div key={index} className="p-5 bg-slate-50 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{parentLink.parent.user.name}</p>
                            <p className="text-sm text-slate-500">{parentLink.relationship}</p>
                          </div>
                        </div>
                        {parentLink.isPrimary && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a href={`mailto:${parentLink.parent.user.email}`} className="text-blue-600 hover:underline">
                            {parentLink.parent.user.email}
                          </a>
                        </div>
                        {parentLink.parent.user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <a href={`tel:${parentLink.parent.user.phone}`} className="text-blue-600 hover:underline">
                              {parentLink.parent.user.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No parent/guardian information recorded
                </div>
              )}

              {/* Emergency Contacts */}
              {student.emergencyContacts && student.emergencyContacts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Emergency Contacts</h3>
                  <div className="space-y-3">
                    {student.emergencyContacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div>
                          <p className="font-medium text-slate-800">{contact.name}</p>
                          <p className="text-sm text-slate-600">{contact.relationship}</p>
                        </div>
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-amber-700 font-medium">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medical Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Medical Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-xl">
                  <h4 className="font-medium text-slate-700 mb-2">Blood Group</h4>
                  <p className="text-lg font-semibold text-slate-800">
                    {student.bloodGroup || 'Not recorded'}
                  </p>
                </div>
              </div>

              {student.allergies && (
                <div className="p-5 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Allergies</h4>
                      <p className="text-red-700 mt-1">{student.allergies}</p>
                    </div>
                  </div>
                </div>
              )}

              {student.medicalConditions && (
                <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800">Medical Conditions</h4>
                      <p className="text-amber-700 mt-1">{student.medicalConditions}</p>
                    </div>
                  </div>
                </div>
              )}

              {!student.allergies && !student.medicalConditions && (
                <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <p className="text-emerald-700">No known allergies or medical conditions</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
