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
  Briefcase,
  GraduationCap,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  School,
} from 'lucide-react';

interface StaffDetail {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender: string;
  nationalId?: string;
  photo?: string;
  phone?: string;
  email?: string;
  address?: string;
  position: string;
  department?: string;
  employmentType: string;
  hireDate: string;
  terminationDate?: string;
  salary?: number;
  qualifications?: any;
  isActive: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin?: string;
  };
  school?: {
    id: string;
    name: string;
  };
  classTeacher?: Array<{
    id: string;
    name: string;
    level: string;
  }>;
}

export default function StaffDetailPage() {
  const params = useParams();
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, [params.id]);

  const fetchStaff = async () => {
    try {
      const response = await fetch(`/api/staff/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setStaff(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Staff member not found</h2>
        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/staff"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
              {staff.photo ? (
                <img src={staff.photo} alt={staff.firstName} className="w-full h-full object-cover" />
              ) : (
                <>{staff.firstName[0]}{staff.lastName[0]}</>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {staff.firstName} {staff.middleName} {staff.lastName}
              </h1>
              <p className="text-slate-600 font-mono">{staff.employeeNumber}</p>
              <div className="flex items-center gap-3 mt-2">
                {staff.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </span>
                )}
                <span className="text-sm text-slate-500">{staff.position}</span>
                {staff.department && (
                  <span className="text-sm text-slate-500">{staff.department}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/staff/${staff.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
          >
            <Edit className="h-4 w-4" />
            Edit Staff
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Employment Type</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{staff.employmentType}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Salary</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(staff.salary)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Hire Date</p>
              <p className="text-xl font-bold text-purple-600 mt-1">{formatDate(staff.hireDate).split(',')[0]}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Classes Assigned</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{staff.classTeacher?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <School className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Full Name</p>
                <p className="font-medium text-slate-800">
                  {staff.firstName} {staff.middleName} {staff.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Date of Birth</p>
                <p className="font-medium text-slate-800">{formatDate(staff.dateOfBirth)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Gender</p>
                <p className="font-medium text-slate-800">{staff.gender}</p>
              </div>
            </div>
            {staff.nationalId && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">National ID</p>
                  <p className="font-medium text-slate-800">{staff.nationalId}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h2>
          <div className="space-y-4">
            {staff.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-800">{staff.email}</p>
                </div>
              </div>
            )}
            {staff.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium text-slate-800">{staff.phone}</p>
                </div>
              </div>
            )}
            {staff.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Address</p>
                  <p className="font-medium text-slate-800">{staff.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Employment Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Position</p>
                <p className="font-medium text-slate-800">{staff.position}</p>
              </div>
            </div>
            {staff.department && (
              <div className="flex items-start gap-3">
                <School className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Department</p>
                  <p className="font-medium text-slate-800">{staff.department}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Employment Type</p>
                <p className="font-medium text-slate-800">{staff.employmentType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">Hire Date</p>
                <p className="font-medium text-slate-800">{formatDate(staff.hireDate)}</p>
              </div>
            </div>
            {staff.terminationDate && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Termination Date</p>
                  <p className="font-medium text-slate-800">{formatDate(staff.terminationDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        {staff.user && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Portal Email</p>
                  <p className="font-medium text-slate-800">{staff.user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Role</p>
                  <p className="font-medium text-slate-800">{staff.user.role}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Account Status</p>
                  <p className="font-medium text-slate-800">
                    {staff.user.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              {staff.user.lastLogin && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Last Login</p>
                    <p className="font-medium text-slate-800">{formatDate(staff.user.lastLogin)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classes Assigned */}
        {staff.classTeacher && staff.classTeacher.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Classes Assigned</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.classTeacher.map((classItem) => (
                <div key={classItem.id} className="p-4 border border-slate-200 rounded-lg">
                  <p className="font-medium text-slate-800">{classItem.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{classItem.level}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

