'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Heart,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle,
  Home,
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  School,
  Trophy,
  BookOpen,
  Activity,
  DollarSign,
} from 'lucide-react';

interface UploadedFile {
  name: string;
  url: string;
  uploadedAt: string;
  type?: string;
}

interface ParentInfo {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  occupation?: string;
  employer?: string;
  address?: string;
  alternatePhone?: string;
  isPrimary: boolean;
  canPickup: boolean;
  emergencyContact: boolean;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 'MALE',
    nationalId: '',
    birthCertNumber: '',
    religion: '',
    
    // Contact Information
    email: '',
    phone: '',
    address: '',
    
    // Academic Information
    curriculum: 'ZIMSEC',
    grade: '',
    term: '',
    academicYear: new Date().getFullYear().toString(),
    admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    previousGrade: '',
    transferReason: '',
    
    // Medical Information
    bloodGroup: '',
    allergies: '',
    medicalConditions: '',
    
    // Accommodation
    isBoarding: false,
    roomNumber: '',
    bedId: '',

    // Photo
    photo: '',

    // Former Primary School
    formerPrimarySchool: '',
    formerPrimarySchoolAddress: '',
    formerPrimarySchoolContact: '',
    formerPrimaryGrade: '',

    // Recreational Activities
    recreationalActivities: [] as string[],
    specialTalents: '',
    clubsInterests: '',

    // Fee/Payment Information
    totalFees: '',
    initialDepositPercentage: '20',
    initialDepositAmount: '',
    paymentMethod: 'CASH',
    paymentReference: '',
    paymentProofUrl: '',
  });

  // Uploaded files state
  const [academicResults, setAcademicResults] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [paymentProofUploading, setPaymentProofUploading] = useState(false);
  
  // Hostel room selection state
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [loadingBeds, setLoadingBeds] = useState(false);

  // Computed balance
  const computedBalance = formData.totalFees && formData.initialDepositAmount 
    ? (parseFloat(formData.totalFees) - parseFloat(formData.initialDepositAmount)).toFixed(2)
    : '0.00';

  const [parentInfo, setParentInfo] = useState<ParentInfo[]>([
    {
      name: '',
      email: '',
      phone: '',
      relationship: 'Parent',
      occupation: '',
      employer: '',
      address: '',
      alternatePhone: '',
      isPrimary: true,
      canPickup: true,
      emergencyContact: true,
    },
  ]);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '', email: '' },
  ]);

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Contact Details', icon: Phone },
    { number: 3, title: 'Academic Info', icon: GraduationCap },
    { number: 4, title: 'Former Primary School', icon: School },
    { number: 5, title: 'Activities & Interests', icon: Trophy },
    { number: 6, title: 'Documents & Photo', icon: FileText },
    { number: 7, title: 'Medical Info', icon: Heart },
    { number: 8, title: 'Parents/Guardians', icon: Users },
    { number: 9, title: 'Fees & Payment', icon: DollarSign },
    { number: 10, title: 'Accommodation', icon: Home },
    { number: 11, title: 'Review & Submit', icon: CheckCircle },
  ];

  // Grade options based on curriculum
  const gradeOptions = {
    ZIMSEC: [
      { value: 'ECD_A', label: 'ECD A' },
      { value: 'ECD_B', label: 'ECD B' },
      { value: 'GRADE_1', label: 'Grade 1' },
      { value: 'GRADE_2', label: 'Grade 2' },
      { value: 'GRADE_3', label: 'Grade 3' },
      { value: 'GRADE_4', label: 'Grade 4' },
      { value: 'GRADE_5', label: 'Grade 5' },
      { value: 'GRADE_6', label: 'Grade 6' },
      { value: 'GRADE_7', label: 'Grade 7' },
      { value: 'FORM_1', label: 'Form 1' },
      { value: 'FORM_2', label: 'Form 2' },
      { value: 'FORM_3', label: 'Form 3' },
      { value: 'FORM_4', label: 'Form 4' },
      { value: 'LOWER_6', label: 'Lower 6 (AS Level)' },
      { value: 'UPPER_6', label: 'Upper 6 (A Level)' },
    ],
    CAMBRIDGE: [
      { value: 'YEAR_1', label: 'Year 1' },
      { value: 'YEAR_2', label: 'Year 2' },
      { value: 'YEAR_3', label: 'Year 3' },
      { value: 'YEAR_4', label: 'Year 4' },
      { value: 'YEAR_5', label: 'Year 5' },
      { value: 'YEAR_6', label: 'Year 6' },
      { value: 'YEAR_7', label: 'Year 7' },
      { value: 'YEAR_8', label: 'Year 8' },
      { value: 'YEAR_9', label: 'Year 9' },
      { value: 'YEAR_10', label: 'Year 10 (IGCSE)' },
      { value: 'YEAR_11', label: 'Year 11 (IGCSE)' },
      { value: 'YEAR_12', label: 'Year 12 (A Level)' },
      { value: 'YEAR_13', label: 'Year 13 (A Level)' },
    ],
  };

  const termOptions = [
    { value: '1', label: 'Term 1' },
    { value: '2', label: 'Term 2' },
    { value: '3', label: 'Term 3' },
  ];

  const religionOptions = [
    'Christianity',
    'Islam',
    'Hinduism',
    'Buddhism',
    'Judaism',
    'Traditional African Religion',
    'Other',
    'None',
  ];

  const recreationalOptions = [
    'Soccer', 'Basketball', 'Netball', 'Volleyball', 'Athletics', 'Swimming',
    'Cricket', 'Tennis', 'Rugby', 'Hockey', 'Chess', 'Debate', 'Drama',
    'Music', 'Choir', 'Dance', 'Art', 'Science Club', 'Math Club',
    'Computer Club', 'Environmental Club', 'Scripture Union', 'Cadets',
    'First Aid', 'Scouts', 'Girl Guides',
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'photo');
      formData.append('entityId', 'new-student');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, photo: data.url }));
      } else {
        setError(data.error || 'Failed to upload photo');
      }
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'result' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('entityId', 'new-student');
      formData.append('documentName', file.name);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const newFile: UploadedFile = {
          name: data.originalName,
          url: data.url,
          uploadedAt: data.uploadedAt,
          type: type,
        };
        if (type === 'result') {
          setAcademicResults(prev => [...prev, newFile]);
        } else {
          setDocuments(prev => [...prev, newFile]);
        }
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setFileUploading(false);
    }
  };

  const removeFile = (url: string, type: 'result' | 'document') => {
    if (type === 'result') {
      setAcademicResults(prev => prev.filter(f => f.url !== url));
    } else {
      setDocuments(prev => prev.filter(f => f.url !== url));
    }
  };

  const toggleRecreationalActivity = (activity: string) => {
    setFormData(prev => {
      const current = prev.recreationalActivities as string[];
      if (current.includes(activity)) {
        return { ...prev, recreationalActivities: current.filter(a => a !== activity) };
      } else {
        return { ...prev, recreationalActivities: [...current, activity] };
      }
    });
  };

  // Fetch available beds when boarding is selected
  useEffect(() => {
    const fetchAvailableBeds = async () => {
      if (formData.isBoarding && formData.gender) {
        setLoadingBeds(true);
        try {
          const response = await fetch(`/api/hostels/rooms?gender=${formData.gender}`);
          const data = await response.json();
          if (response.ok) {
            setAvailableBeds(data.rooms.filter((bed: any) => bed.isAvailable));
          }
        } catch (error) {
          console.error('Error fetching beds:', error);
        } finally {
          setLoadingBeds(false);
        }
      } else {
        setAvailableBeds([]);
        setFormData(prev => ({ ...prev, bedId: '' }));
      }
    };
    fetchAvailableBeds();
  }, [formData.isBoarding, formData.gender]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleParentChange = (index: number, field: string, value: any) => {
    setParentInfo(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addParent = () => {
    setParentInfo(prev => [
      ...prev,
      {
        name: '',
        email: '',
        phone: '',
        relationship: 'Guardian',
        occupation: '',
        employer: '',
        address: '',
        alternatePhone: '',
        isPrimary: false,
        canPickup: true,
        emergencyContact: true,
      },
    ]);
  };

  const removeParent = (index: number) => {
    if (parentInfo.length > 1) {
      setParentInfo(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleEmergencyChange = (index: number, field: string, value: string) => {
    setEmergencyContacts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addEmergencyContact = () => {
    setEmergencyContacts(prev => [
      ...prev,
      { name: '', relationship: '', phone: '', email: '' },
    ]);
  };

  const removeEmergencyContact = (index: number) => {
    if (emergencyContacts.length > 1) {
      setEmergencyContacts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const nextStep = () => {
    setError('');
    
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender) {
        setError('Please fill in all required personal information');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.curriculum || !formData.grade || !formData.term) {
        setError('Please fill in curriculum, grade, and term');
        return;
      }
    } else if (currentStep === 8) {
      const validParents = parentInfo.filter(p => p.name && p.email && p.phone);
      if (validParents.length === 0) {
        setError('Please add at least one parent/guardian');
        return;
      }
    } else if (currentStep === 9) {
      if (!formData.totalFees || parseFloat(formData.totalFees) <= 0) {
        setError('Please enter a valid total fee amount');
        return;
      }
      if (!formData.initialDepositAmount || parseFloat(formData.initialDepositAmount) < 0) {
        setError('Please enter a valid initial deposit amount');
        return;
      }
      if (parseFloat(formData.initialDepositAmount) > parseFloat(formData.totalFees)) {
        setError('Initial deposit cannot exceed total fees');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 11));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Filter out empty emergency contacts
      const validEmergencyContacts = emergencyContacts.filter(c => c.name && c.phone);

      // Filter out empty parent info
      const validParentInfo = parentInfo.filter(p => p.name && p.email && p.phone);

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          emergencyContacts: validEmergencyContacts,
          parentInfo: validParentInfo,
          academicResults: academicResults.length > 0 ? academicResults : null,
          documents: documents.length > 0 ? documents : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student');
      }

      setStudentNumber(data.studentNumber);
      setSuccess('Student registered successfully!');
      setCurrentStep(12); // Confirmation step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/students"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Register New Student</h1>
            <p className="text-slate-600 mt-1">Add a new student to the system</p>
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

      {/* Form */}
      {currentStep === 12 ? (
        /* Success Confirmation */
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Student Registered Successfully!</h2>
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-slate-500 mb-2">Student Number</p>
            <p className="text-3xl font-mono font-bold text-blue-600">{studentNumber}</p>
          </div>
          <p className="text-slate-600 mb-6">
            {formData.firstName} {formData.lastName} has been successfully registered to the system.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard/students"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Students
            </Link>
            <button
              onClick={() => {
                setCurrentStep(1);
                setFormData({
                  firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: 'MALE',
                  nationalId: '', birthCertNumber: '', religion: '', email: '', phone: '', address: '',
                  curriculum: 'ZIMSEC', grade: '', term: '', academicYear: new Date().getFullYear().toString(),
                  admissionDate: new Date().toISOString().split('T')[0], previousSchool: '', previousGrade: '',
                  transferReason: '', bloodGroup: '', allergies: '', medicalConditions: '', isBoarding: false,
                  roomNumber: '', photo: '', formerPrimarySchool: '', formerPrimarySchoolAddress: '',
                  formerPrimarySchoolContact: '', formerPrimaryGrade: '', recreationalActivities: [],
                  specialTalents: '', clubsInterests: '',
                  totalFees: '', initialDepositPercentage: '20', initialDepositAmount: '',
                  paymentMethod: 'CASH', paymentReference: '', paymentProofUrl: '',
                });
                setStudentNumber('');
              }}
              className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Register Another Student
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Progress Steps */}
            <div className="border-b border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center gap-2 ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep > step.number
                          ? 'bg-blue-600 text-white'
                          : currentStep === step.number
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {currentStep > step.number ? '✓' : step.number}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 lg:w-16 h-0.5 mx-1 ${
                        currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-slate-700 mt-4">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </p>
            </div>

            {/* Step Content */}
            <div className="p-6 lg:p-8 min-h-[400px]">{currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter surname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      National ID Number
                    </label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g., 63-123456-A-47"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Birth Certificate Number
                    </label>
                    <input
                      type="text"
                      name="birthCertNumber"
                      value={formData.birthCertNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter birth certificate number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Religion
                    </label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Religion</option>
                      {religionOptions.map(religion => (
                        <option key={religion} value={religion}>{religion}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Contact Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="student@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Residential Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Enter full residential address"
                    />
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-slate-800">Emergency Contacts</h4>
                    <button
                      type="button"
                      onClick={addEmergencyContact}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Contact
                    </button>
                  </div>
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-700">
                          Contact {index + 1}
                        </span>
                        {emergencyContacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmergencyContact(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleEmergencyChange(index, 'name', e.target.value)}
                          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Full Name"
                        />
                        <input
                          type="text"
                          value={contact.relationship}
                          onChange={(e) => handleEmergencyChange(index, 'relationship', e.target.value)}
                          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Relationship"
                        />
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => handleEmergencyChange(index, 'phone', e.target.value)}
                          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Phone Number"
                        />
                        <input
                          type="email"
                          value={contact.email || ''}
                          onChange={(e) => handleEmergencyChange(index, 'email', e.target.value)}
                          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Email (optional)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Academic Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Academic Information</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Curriculum <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="curriculum"
                      value={formData.curriculum}
                      onChange={(e) => {
                        handleInputChange(e);
                        setFormData(prev => ({ ...prev, grade: '' })); // Reset grade when curriculum changes
                      }}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="ZIMSEC">ZIMSEC</option>
                      <option value="CAMBRIDGE">Cambridge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Grade / Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Grade/Year</option>
                      {gradeOptions[formData.curriculum as keyof typeof gradeOptions].map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Term <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="term"
                      value={formData.term}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Term</option>
                      {termOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g., 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Previous Education */}
                <div className="mt-8">
                  <h4 className="text-md font-semibold text-slate-800 mb-4">Previous Secondary Education</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Previous School
                      </label>
                      <input
                        type="text"
                        name="previousSchool"
                        value={formData.previousSchool}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Name of previous school"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Previous Grade/Form
                      </label>
                      <input
                        type="text"
                        name="previousGrade"
                        value={formData.previousGrade}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., Grade 7, Form 2"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Reason for Transfer
                      </label>
                      <input
                        type="text"
                        name="transferReason"
                        value={formData.transferReason}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Former Primary School */}
            {/* Step 4: Former Primary School */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Former Primary School Information</h3>
                <p className="text-slate-600">Enter details about the student's previous primary school education</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Primary School Name
                    </label>
                    <input
                      type="text"
                      name="formerPrimarySchool"
                      value={formData.formerPrimarySchool}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g., Harare Primary School"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Grade Completed
                    </label>
                    <select
                      name="formerPrimaryGrade"
                      value={formData.formerPrimaryGrade}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Grade</option>
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      School Address
                    </label>
                    <textarea
                      name="formerPrimarySchoolAddress"
                      value={formData.formerPrimarySchoolAddress}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Full address of the primary school"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      School Contact (Phone/Email)
                    </label>
                    <input
                      type="text"
                      name="formerPrimarySchoolContact"
                      value={formData.formerPrimarySchoolContact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Phone number or email"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Recreational Activities & Interests */}
            {/* Step 5: Activities & Interests */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Recreational Activities & Interests</h3>
                <p className="text-slate-600">Select the activities the student is interested in or has participated in</p>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Select Activities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {recreationalOptions.map((activity) => (
                      <button
                        key={activity}
                        type="button"
                        onClick={() => toggleRecreationalActivity(activity)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          (formData.recreationalActivities as string[]).includes(activity)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Special Talents & Skills
                  </label>
                  <textarea
                    name="specialTalents"
                    value={formData.specialTalents}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="Describe any special talents, skills, or achievements (e.g., 'Won regional chess championship', 'Plays piano Grade 5')"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Clubs & Organizations
                  </label>
                  <textarea
                    name="clubsInterests"
                    value={formData.clubsInterests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="List any clubs or organizations the student would like to join or has been part of"
                  />
                </div>
              </div>
            )}

            {/* Documents & Academic Results */}
            {/* Step 6: Documents & Photo */}
            {currentStep === 6 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Student Photo</h3>
                  <p className="text-slate-600 mb-4">Upload a recent passport-size photo of the student</p>
                  
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-40 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden">
                      {formData.photo ? (
                        <img src={formData.photo} alt="Student photo" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                        <Upload className="h-4 w-4" />
                        {photoUploading ? 'Uploading...' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={photoUploading}
                        />
                      </label>
                      {formData.photo && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                          className="ml-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                      <p className="text-sm text-slate-500 mt-2">
                        Accepted formats: JPEG, PNG, WebP. Max size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800">Academic Results & Report Cards</h3>
                  <p className="text-slate-600 mb-4">Upload previous academic results, report cards, or certificates</p>
                  
                  <div className="space-y-3">
                    {academicResults.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="flex-1 text-sm text-slate-700 truncate">{file.name}</span>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => removeFile(file.url, 'result')}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <Plus className="h-4 w-4 text-slate-600" />
                      {fileUploading ? 'Uploading...' : 'Add Academic Result'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={(e) => handleFileUpload(e, 'result')}
                        className="hidden"
                        disabled={fileUploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800">Supporting Documents</h3>
                  <p className="text-slate-600 mb-4">Upload birth certificate, national ID, transfer letter, etc.</p>
                  
                  <div className="space-y-3">
                    {documents.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <span className="flex-1 text-sm text-slate-700 truncate">{file.name}</span>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => removeFile(file.url, 'document')}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <Plus className="h-4 w-4 text-slate-600" />
                      {fileUploading ? 'Uploading...' : 'Add Document'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={(e) => handleFileUpload(e, 'document')}
                        className="hidden"
                        disabled={fileUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Information */}
            {/* Step 7: Medical Information */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Medical Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Allergies
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="List any known allergies (food, medication, environmental, etc.)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="List any chronic conditions, disabilities, or special medical needs"
                  />
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Important Note</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Please ensure all medical information is accurate and up-to-date. 
                        This information is kept confidential and is only used for the student's safety and wellbeing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Parents/Guardians */}
            {/* Step 8: Parents/Guardians */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Parents/Guardians</h3>
                  <button
                    type="button"
                    onClick={addParent}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Parent/Guardian
                  </button>
                </div>

                {parentInfo.map((parent, index) => (
                  <div key={index} className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-800">
                        {parent.isPrimary ? 'Primary Contact' : `Parent/Guardian ${index + 1}`}
                      </h4>
                      {!parent.isPrimary && parentInfo.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParent(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={parent.name}
                          onChange={(e) => handleParentChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Parent/Guardian name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={parent.email}
                          onChange={(e) => handleParentChange(index, 'email', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="parent@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={parent.phone}
                          onChange={(e) => handleParentChange(index, 'phone', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="+263 77 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Relationship
                        </label>
                        <select
                          value={parent.relationship}
                          onChange={(e) => handleParentChange(index, 'relationship', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="Parent">Parent</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={parent.occupation || ''}
                          onChange={(e) => handleParentChange(index, 'occupation', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g., Teacher, Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Employer
                        </label>
                        <input
                          type="text"
                          value={parent.employer || ''}
                          onChange={(e) => handleParentChange(index, 'employer', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Company/Organization"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parent.isPrimary}
                          onChange={(e) => {
                            // Only one can be primary
                            if (e.target.checked) {
                              setParentInfo(prev => prev.map((p, i) => ({
                                ...p,
                                isPrimary: i === index,
                              })));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">Primary Contact</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parent.canPickup}
                          onChange={(e) => handleParentChange(index, 'canPickup', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">Authorized to Pick Up</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parent.emergencyContact}
                          onChange={(e) => handleParentChange(index, 'emergencyContact', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">Emergency Contact</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Former Primary School - already handled */}

            {/* Step 5: Activities - already handled */}

            {/* Step 6: Documents - already handled */}

            {/* Step 7: Medical - already handled */}

            {/* Step 8: Parents - already handled */}

            {/* Step 9: Accommodation */}
            {/* Step 9: Fees & Payment */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Fees & Payment Information</h3>
                <p className="text-sm text-slate-600 mb-6">Enter the fee structure and initial payment details</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Total Fees */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Total Fees for Term/Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        name="totalFees"
                        value={formData.totalFees}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Auto-calculate initial deposit
                          const total = parseFloat(e.target.value) || 0;
                          const percentage = parseFloat(formData.initialDepositPercentage) || 20;
                          const deposit = (total * percentage / 100).toFixed(2);
                          setFormData(prev => ({ ...prev, initialDepositAmount: deposit }));
                        }}
                        className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Initial Deposit Percentage */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Initial Deposit Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        name="initialDepositPercentage"
                        value={formData.initialDepositPercentage}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Auto-calculate initial deposit
                          const total = parseFloat(formData.totalFees) || 0;
                          const percentage = parseFloat(e.target.value) || 0;
                          const deposit = (total * percentage / 100).toFixed(2);
                          setFormData(prev => ({ ...prev, initialDepositAmount: deposit }));
                        }}
                        className="w-full pr-10 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                    </div>
                  </div>

                  {/* Initial Deposit Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Initial Deposit Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        name="initialDepositAmount"
                        value={formData.initialDepositAmount}
                        onChange={handleInputChange}
                        className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      You can manually adjust this amount
                    </p>
                  </div>

                  {/* Calculated Balance */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Balance After Deposit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="text"
                        value={computedBalance}
                        readOnly
                        className="w-full pl-8 pr-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="ECOCASH">EcoCash</option>
                      <option value="ONEMONEY">OneMoney</option>
                      <option value="INNBUCKS">InnBucks</option>
                      <option value="PAYNOW">PayNow</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="CARD">Card</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Payment Reference */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Reference Number
                    </label>
                    <input
                      type="text"
                      name="paymentReference"
                      value={formData.paymentReference}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Transaction/Receipt number"
                    />
                  </div>
                </div>

                {/* Proof of Payment Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Proof of Payment
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="payment-proof-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Validate file size (5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          setError('File size must be less than 5MB');
                          return;
                        }

                        setPaymentProofUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('type', 'payment');
                          formData.append('entityId', 'new-student');
                          formData.append('documentName', file.name);

                          const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                          });

                          const data = await response.json();
                          if (response.ok) {
                            setFormData(prev => ({ ...prev, paymentProofUrl: data.url }));
                            setError('');
                          } else {
                            setError(data.error || 'Failed to upload proof of payment');
                          }
                        } catch (err) {
                          setError('Failed to upload proof of payment');
                        } finally {
                          setPaymentProofUploading(false);
                        }
                      }}
                      className="hidden"
                    />
                    {!formData.paymentProofUrl ? (
                      <label htmlFor="payment-proof-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          {paymentProofUploading ? 'Uploading...' : 'Click to upload proof of payment'}
                        </p>
                        <p className="text-xs text-slate-500">
                          PDF, JPG, PNG up to 5MB
                        </p>
                      </label>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-slate-700">Proof of payment uploaded</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, paymentProofUrl: '' }))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The initial deposit will be recorded as the first payment. The remaining balance of ${computedBalance} will be tracked in the student's account.
                  </p>
                </div>
              </div>
            )}

            {/* Step 10: Accommodation */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Accommodation</h3>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isBoarding"
                      checked={formData.isBoarding}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-800">Boarding Student</span>
                      <p className="text-sm text-slate-600">
                        Check this if the student will be staying in the school hostel
                      </p>
                    </div>
                  </label>
                </div>

                {formData.isBoarding && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Select Room & Bed <span className="text-red-500">*</span>
                      </label>
                      {loadingBeds ? (
                        <div className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg bg-slate-50 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-slate-600">Loading available beds...</span>
                        </div>
                      ) : availableBeds.length === 0 ? (
                        <div className="w-full px-4 py-2.5 border-2 border-amber-300 rounded-lg bg-amber-50">
                          <p className="text-amber-800 text-sm">
                            {!formData.gender 
                              ? 'Please select gender first to see available beds'
                              : 'No available beds found for this gender. Please contact hostel manager.'}
                          </p>
                        </div>
                      ) : (
                        <select
                          name="bedId"
                          value={formData.bedId}
                          onChange={handleInputChange}
                          required={formData.isBoarding}
                          className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="">Select a bed...</option>
                          {availableBeds.map((bed) => (
                            <option key={bed.bedId} value={bed.bedId}>
                              {bed.displayName} {bed.isAvailable ? '✓ Available' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                      {formData.bedId && (
                        <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                          Bed selected successfully
                        </p>
                      )}
                      <p className="text-sm text-slate-500 mt-1">
                        Select an available bed for this student. Room allocation can be updated later by the hostel manager.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 11: Review & Submit */}
            {currentStep === 12 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Review Your Information</h3>
                <p className="text-slate-600 mb-6">Please review all the information before submitting the registration.</p>

                {/* Personal Information */}
                <div className="p-6 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-600">Full Name:</span> <span className="font-medium">{formData.firstName} {formData.middleName} {formData.lastName}</span></div>
                    <div><span className="text-slate-600">Date of Birth:</span> <span className="font-medium">{formData.dateOfBirth}</span></div>
                    <div><span className="text-slate-600">Gender:</span> <span className="font-medium">{formData.gender}</span></div>
                    <div><span className="text-slate-600">Religion:</span> <span className="font-medium">{formData.religion || 'Not specified'}</span></div>
                    <div><span className="text-slate-600">National ID:</span> <span className="font-medium">{formData.nationalId || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Birth Certificate:</span> <span className="font-medium">{formData.birthCertNumber || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-6 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Contact Information
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-600">Email:</span> <span className="font-medium">{formData.email || 'Not provided'}</span></div>
                    <div><span className="text-slate-600">Phone:</span> <span className="font-medium">{formData.phone || 'Not provided'}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-600">Address:</span> <span className="font-medium">{formData.address || 'Not provided'}</span></div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="p-6 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Academic Information
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-600">Curriculum:</span> <span className="font-medium">{formData.curriculum}</span></div>
                    <div><span className="text-slate-600">Grade:</span> <span className="font-medium">{formData.grade}</span></div>
                    <div><span className="text-slate-600">Term:</span> <span className="font-medium">{formData.term || 'Not specified'}</span></div>
                    <div><span className="text-slate-600">Academic Year:</span> <span className="font-medium">{formData.academicYear || 'Not specified'}</span></div>
                    <div><span className="text-slate-600">Admission Date:</span> <span className="font-medium">{formData.admissionDate}</span></div>
                    <div><span className="text-slate-600">Previous School:</span> <span className="font-medium">{formData.previousSchool || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Former Primary School */}
                {formData.formerPrimarySchool && (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <School className="h-5 w-5" />
                        Former Primary School
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="md:col-span-2"><span className="text-slate-600">School Name:</span> <span className="font-medium">{formData.formerPrimarySchool}</span></div>
                      <div className="md:col-span-2"><span className="text-slate-600">Address:</span> <span className="font-medium">{formData.formerPrimarySchoolAddress || 'N/A'}</span></div>
                      <div><span className="text-slate-600">Contact:</span> <span className="font-medium">{formData.formerPrimarySchoolContact || 'N/A'}</span></div>
                      <div><span className="text-slate-600">Grade Completed:</span> <span className="font-medium">{formData.formerPrimaryGrade || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Activities & Interests */}
                {((formData.recreationalActivities as string[]).length > 0 || formData.specialTalents || formData.clubsInterests) && (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Activities & Interests
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(5)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    {(formData.recreationalActivities as string[]).length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm text-slate-600">Recreational Activities:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(formData.recreationalActivities as string[]).map((activity, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.specialTalents && (
                      <div className="mb-3 text-sm">
                        <span className="text-slate-600">Special Talents:</span> <span className="font-medium">{formData.specialTalents}</span>
                      </div>
                    )}
                    {formData.clubsInterests && (
                      <div className="text-sm">
                        <span className="text-slate-600">Clubs & Interests:</span> <span className="font-medium">{formData.clubsInterests}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents & Photo */}
                {(formData.photo || documents.length > 0 || academicResults.length > 0) && (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents & Photo
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(6)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      {formData.photo && <div><span className="text-slate-600">Student Photo:</span> <span className="text-green-600 font-medium">✓ Uploaded</span></div>}
                      {documents.length > 0 && <div><span className="text-slate-600">Documents:</span> <span className="text-green-600 font-medium">{documents.length} file(s) uploaded</span></div>}
                      {academicResults.length > 0 && <div><span className="text-slate-600">Academic Results:</span> <span className="text-green-600 font-medium">{academicResults.length} file(s) uploaded</span></div>}
                    </div>
                  </div>
                )}

                {/* Medical Information */}
                {(formData.bloodGroup || formData.allergies || formData.medicalConditions) && (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Medical Information
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(7)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {formData.bloodGroup && <div><span className="text-slate-600">Blood Group:</span> <span className="font-medium">{formData.bloodGroup}</span></div>}
                      {formData.allergies && <div><span className="text-slate-600">Allergies:</span> <span className="font-medium">{formData.allergies}</span></div>}
                      {formData.medicalConditions && <div className="md:col-span-2"><span className="text-slate-600">Medical Conditions:</span> <span className="font-medium">{formData.medicalConditions}</span></div>}
                    </div>
                  </div>
                )}

                {/* Parents/Guardians */}
                {parentInfo.length > 0 && (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Parents/Guardians
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(8)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-4">
                      {parentInfo.map((parent, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                          <div className="font-medium text-slate-800 mb-2">
                            {parent.name}
                            {parent.isPrimary && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Primary</span>}
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                            <div>Relationship: {parent.relationship}</div>
                            <div>Phone: {parent.phone}</div>
                            {parent.email && <div>Email: {parent.email}</div>}
                            {parent.occupation && <div>Occupation: {parent.occupation}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fees & Payment */}
                {formData.totalFees && (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Fees & Payment
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(9)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-600">Total Fees:</span> <span className="font-medium">${parseFloat(formData.totalFees).toFixed(2)}</span></div>
                      <div><span className="text-slate-600">Initial Deposit:</span> <span className="font-medium">${parseFloat(formData.initialDepositAmount || '0').toFixed(2)}</span></div>
                      <div><span className="text-slate-600">Balance:</span> <span className="font-medium text-orange-600">${computedBalance}</span></div>
                      <div><span className="text-slate-600">Payment Method:</span> <span className="font-medium">{formData.paymentMethod.replace(/_/g, ' ')}</span></div>
                      {formData.paymentReference && <div className="md:col-span-2"><span className="text-slate-600">Reference:</span> <span className="font-medium">{formData.paymentReference}</span></div>}
                      {formData.paymentProofUrl && <div className="md:col-span-2"><span className="text-slate-600">Proof of Payment:</span> <span className="text-green-600 font-medium">✓ Uploaded</span></div>}
                    </div>
                  </div>
                )}

                {/* Accommodation */}
                <div className="p-6 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Accommodation
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(10)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm">
                    <div>
                      <span className="text-slate-600">Boarding Status:</span> 
                      <span className="font-medium ml-2">{formData.isBoarding ? 'Boarding Student' : 'Day Scholar'}</span>
                    </div>
                    {formData.isBoarding && formData.roomNumber && (
                      <div className="mt-2">
                        <span className="text-slate-600">Room:</span> 
                        <span className="font-medium ml-2">{formData.roomNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Once you submit this registration, a unique student number will be automatically generated and displayed on the confirmation screen.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
            ) : (
              <Link
                href="/dashboard/students"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
            )}
            
            {currentStep < 11 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
      )}
    </div>
  );
}
