'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  FileText,
  HelpCircle,
  Send,
} from 'lucide-react';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ applicationNumber: string } | null>(null);

  const [formData, setFormData] = useState({
    // Student Information
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 'MALE',
    email: '',
    phone: '',
    address: '',
    
    // Academic Information
    curriculum: 'ZIMSEC',
    gradeApplyingFor: '',
    previousSchool: '',
    previousGrade: '',
    
    // Parent Information
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentRelationship: 'Parent',
    parentOccupation: '',
    
    // Medical Information
    bloodGroup: '',
    allergies: '',
    medicalConditions: '',
    
    // Additional
    isBoarding: false,
    specialNeeds: '',
    howDidYouHear: '',
    additionalNotes: '',
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '' },
  ]);

  const steps = [
    { number: 1, title: 'Student Info', icon: User },
    { number: 2, title: 'Academics', icon: GraduationCap },
    { number: 3, title: 'Parent/Guardian', icon: Users },
    { number: 4, title: 'Medical', icon: Heart },
    { number: 5, title: 'Review', icon: FileText },
  ];

  const gradeOptions = [
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
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleEmergencyChange = (index: number, field: string, value: string) => {
    setEmergencyContacts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addEmergencyContact = () => {
    setEmergencyContacts(prev => [...prev, { name: '', relationship: '', phone: '' }]);
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.gradeApplyingFor) {
        setError('Please select the grade you are applying for');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.parentName || !formData.parentEmail || !formData.parentPhone) {
        setError('Please fill in all parent/guardian information');
        return;
      }
    }
    
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validEmergencyContacts = emergencyContacts.filter(c => c.name && c.phone);

      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          emergencyContacts: validEmergencyContacts.length > 0 ? validEmergencyContacts : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess({ applicationNumber: data.applicationNumber });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Application Submitted!</h1>
            <p className="text-slate-600 mb-6">
              Thank you for applying to Advent Hope Academy. Your application has been received and is being reviewed.
            </p>
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <p className="text-sm text-slate-500 mb-2">Your Application Number</p>
              <p className="text-2xl font-mono font-bold text-blue-600">{success.applicationNumber}</p>
              <p className="text-sm text-slate-500 mt-4">
                Please save this number. You will need it to check your application status.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600">
                A confirmation email has been sent to <strong>{formData.parentEmail}</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Return Home
                </Link>
                <Link
                  href="/apply/status"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  Check Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Advent Hope Academy</h1>
                <p className="text-xs text-slate-500">Online Application</p>
              </div>
            </Link>
            <Link
              href="/apply/status"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Check Application Status
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep > step.number
                      ? 'bg-blue-600 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8">
              {/* Step 1: Student Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Student Information</h2>
                    <p className="text-slate-600">Please provide the student's personal details</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
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
                        placeholder="student@email.com (optional)"
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
                        placeholder="+263 77 123 4567 (optional)"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Residential Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="Enter full residential address"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Academic Information</h2>
                    <p className="text-slate-600">Tell us about your academic background and preferences</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Curriculum <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="curriculum"
                        value={formData.curriculum}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="ZIMSEC">ZIMSEC</option>
                        <option value="CAMBRIDGE">Cambridge</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Grade Applying For <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gradeApplyingFor"
                        value={formData.gradeApplyingFor}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select Grade/Form</option>
                        {gradeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
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
                        placeholder="e.g., Grade 6, Form 2"
                      />
                    </div>
                  </div>

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
                        <span className="font-medium text-slate-800">Apply for Boarding</span>
                        <p className="text-sm text-slate-600">
                          Check this if the student requires hostel accommodation
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Parent/Guardian Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Parent/Guardian Information</h2>
                    <p className="text-slate-600">Please provide parent or guardian contact details</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Parent/Guardian full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Relationship
                      </label>
                      <select
                        name="parentRelationship"
                        value={formData.parentRelationship}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Parent">Parent</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        required
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
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="+263 77 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="parentOccupation"
                        value={formData.parentOccupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., Teacher, Engineer"
                      />
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-800">Emergency Contacts</h3>
                      <button
                        type="button"
                        onClick={addEmergencyContact}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add Another
                      </button>
                    </div>
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="grid sm:grid-cols-3 gap-4 mb-4">
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Medical Information */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Medical Information</h2>
                    <p className="text-slate-600">Help us ensure your child's health and safety</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
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
                      Known Allergies
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Special Needs / Learning Requirements
                    </label>
                    <textarea
                      name="specialNeeds"
                      value={formData.specialNeeds}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Any special educational needs or accommodations required"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      How did you hear about us?
                    </label>
                    <select
                      name="howDidYouHear"
                      value={formData.howDidYouHear}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select an option</option>
                      <option value="friend">Friend/Family Referral</option>
                      <option value="social_media">Social Media</option>
                      <option value="website">School Website</option>
                      <option value="newspaper">Newspaper/Magazine</option>
                      <option value="event">School Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Review Your Application</h2>
                    <p className="text-slate-600">Please review your information before submitting</p>
                  </div>

                  {/* Student Info */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Student Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-500">Name:</span> {formData.firstName} {formData.middleName} {formData.lastName}</div>
                      <div><span className="text-slate-500">Date of Birth:</span> {formData.dateOfBirth}</div>
                      <div><span className="text-slate-500">Gender:</span> {formData.gender}</div>
                      <div><span className="text-slate-500">Email:</span> {formData.email || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Academic Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-500">Curriculum:</span> {formData.curriculum}</div>
                      <div><span className="text-slate-500">Applying for:</span> {gradeOptions.find(g => g.value === formData.gradeApplyingFor)?.label}</div>
                      <div><span className="text-slate-500">Previous School:</span> {formData.previousSchool || 'N/A'}</div>
                      <div><span className="text-slate-500">Boarding:</span> {formData.isBoarding ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* Parent Info */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Parent/Guardian Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-500">Name:</span> {formData.parentName}</div>
                      <div><span className="text-slate-500">Relationship:</span> {formData.parentRelationship}</div>
                      <div><span className="text-slate-500">Email:</span> {formData.parentEmail}</div>
                      <div><span className="text-slate-500">Phone:</span> {formData.parentPhone}</div>
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Medical Information
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div><span className="text-slate-500">Blood Group:</span> {formData.bloodGroup || 'Not specified'}</div>
                      <div><span className="text-slate-500">Allergies:</span> {formData.allergies || 'None specified'}</div>
                      <div><span className="text-slate-500">Medical Conditions:</span> {formData.medicalConditions || 'None specified'}</div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      By submitting this application, I confirm that all the information provided is accurate 
                      and complete to the best of my knowledge. I understand that providing false information 
                      may result in the rejection of this application.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
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
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </Link>
              )}
              
              {currentStep < 5 ? (
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
                  className="inline-flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
