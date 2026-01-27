'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  GraduationCap,
  Users,
  Wallet,
  BookOpen,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  Star,
  Trophy,
  Heart,
  Shield,
  Target,
  Lightbulb,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Send,
  ChevronRight,
} from 'lucide-react';

// Navigation Links
const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Admissions', href: '#admissions' },
  { name: 'Contact', href: '#contact' },
];

// Features data
const features = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Comprehensive student information system tracking academic progress, attendance, and personal development.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Wallet,
    title: 'Financial Tracking',
    description: 'Transparent fee management, online payments, and detailed financial reporting for parents and administrators.',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Heart,
    title: 'Parent Portal',
    description: 'Stay connected with your child\'s education through real-time updates, grades, and direct communication with teachers.',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
  },
  {
    icon: Award,
    title: 'Academic Excellence',
    description: 'Dual curriculum offering both Cambridge and ZIMSEC pathways, ensuring global competitiveness.',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
  },
];

// Statistics data
const statistics = [
  { icon: Users, value: '1,200+', label: 'Students Enrolled', suffix: '' },
  { icon: GraduationCap, value: '85', label: 'Qualified Teachers', suffix: '+' },
  { icon: Trophy, value: '15', label: 'Years of Excellence', suffix: '' },
  { icon: Star, value: '98', label: 'Success Rate', suffix: '%' },
];

// Footer links
const footerLinks = {
  quickLinks: [
    { name: 'About Us', href: '#about' },
    { name: 'Admissions', href: '#admissions' },
    { name: 'Academic Programs', href: '#academics' },
    { name: 'Contact Us', href: '#contact' },
  ],
  resources: [
    { name: 'Student Portal', href: '/portal/login' },
    { name: 'Parent Portal', href: '/portal/login' },
    { name: 'Staff Login', href: '/auth/login' },
    { name: 'Online Application', href: '/apply' },
  ],
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Structured Data for SEO (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Advent Hope Academy",
    "alternateName": "AHA",
    "url": "https://adventhopeacademy.com",
    "logo": "https://adventhopeacademy.com/uploads/logo.png",
    "description": "Premier Christian educational institution in Zimbabwe offering Cambridge and ZIMSEC curricula with comprehensive school management system.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ZW",
      "addressLocality": "Zimbabwe"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+263773102003",
      "email": "info@adventhope.ac.zw",
      "contactType": "Admissions",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://facebook.com/adventhopeacademy",
      "https://twitter.com/adventhopeacademy",
      "https://linkedin.com/company/adventhopeacademy"
    ]
  };

  return (
    <main className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Announcement Banner */}
      <div className="bg-slate-900 text-white py-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <a href="tel:+263773102003" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">+263 773 102 003</span>
            </a>
            <a href="mailto:info@adventhope.ac.zw" className="hidden md:flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Mail className="h-4 w-4" />
              <span>info@adventhope.ac.zw</span>
            </a>
          </div>
          <Link href="/apply" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Admissions Open for 2026 →
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image 
                  src="/uploads/logo.png" 
                  alt="Advent Hope Academy Logo" 
                  width={48} 
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Advent Hope Academy</h1>
                <p className="text-xs text-slate-500">Excellence in Christian Education</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-slate-700 hover:text-slate-900 font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors border-2 border-orange-600 hover:border-orange-700 rounded-lg"
              >
                📝 Register
              </Link>
              <Link
                href="/portal/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                <Users className="h-4 w-4" />
                <span className="hidden lg:inline">Parent</span>
              </Link>
              <Link
                href="/portal/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="hidden lg:inline">Student</span>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                <span>Staff</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-blue-600"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-100">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-3 text-slate-600 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-blue-50 via-white to-emerald-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-emerald-100 border border-blue-200 rounded-full text-slate-800 text-sm font-semibold mb-8 shadow-sm">
                <Award className="h-4 w-4 text-blue-600" />
                Cambridge & ZIMSEC Accredited
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-900 bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
                Advent Hope Academy
              </h1>

              {/* Description */}
              <p className="text-xl text-slate-700 mb-10 leading-relaxed">
                Excellence in Christian Education. Nurturing minds and shaping futures through quality education rooted in Christian values.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  📝 Create Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Apply for Admission
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              {/* Portal Logins */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/portal/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Users className="h-5 w-5" />
                  Parent Login
                </Link>
                <Link
                  href="/portal/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                >
                  <GraduationCap className="h-5 w-5" />
                  Student Login
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                >
                  <BookOpen className="h-5 w-5" />
                  Admin Login
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center gap-8 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Accredited Institution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Safe Environment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>International Standards</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">Primary School</h3>
                  <p className="text-sm text-slate-700 font-medium">ECD - Grade 7</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">Secondary</h3>
                  <p className="text-sm text-slate-700 font-medium">Form 1 - 6</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg">
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">Cambridge</h3>
                  <p className="text-sm text-slate-700 font-medium">IGCSE & A-Level</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">ZIMSEC</h3>
                  <p className="text-sm text-slate-700 font-medium">O & A Level</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Shield className="h-4 w-4" />
              Why Choose Us
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-6">
              Comprehensive School Management
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our platform brings together all aspects of education management in one unified system
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="admissions" className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
              <Trophy className="h-4 w-4" />
              Our Track Record
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Over 15 Years of Excellence
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Building futures, one student at a time
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-5xl lg:text-6xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-blue-100 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              Apply for Admission
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contact Info */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
                Contact Us
              </h2>
              <p className="text-lg text-slate-600 mb-10">
                Have questions about admissions, programs, or our school management system? 
                We're here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Phone</h3>
                    <a href="tel:+263773102003" className="text-slate-600 hover:text-blue-600 transition-colors">
                      +263 773 102 003
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Email</h3>
                    <a href="mailto:info@adventhope.ac.zw" className="text-slate-600 hover:text-blue-600 transition-colors">
                      info@adventhope.ac.zw
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Address</h3>
                    <p className="text-slate-600">
                      Advent Hope Academy<br />
                      Harare, Zimbabwe
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Office Hours</h3>
                    <p className="text-slate-600">
                      Monday - Friday: 7:30am - 4:30pm<br />
                      Saturday: 8:00am - 12:00pm
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-10">
                <p className="text-sm font-semibold text-slate-800 mb-4">Follow Us</p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-sky-500 hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-700 hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Access Card */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Quick Access Portals</h3>
                <p className="text-blue-100 mb-8 text-lg">
                  Access your portal to view grades, fees, announcements, and more.
                </p>

                <div className="space-y-4">
                  <Link
                    href="/portal/login"
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all group border border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <GraduationCap className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Student Portal</p>
                        <p className="text-sm text-blue-100">Access your dashboard</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    href="/portal/login"
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all group border border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Users className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Parent Portal</p>
                        <p className="text-sm text-blue-100">Track your child's progress</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    href="/auth/login"
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all group border border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <BookOpen className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Staff Portal</p>
                        <p className="text-sm text-blue-100">Teacher resources</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    href="/apply"
                    className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all group mt-6 shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Send className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Apply Now</p>
                        <p className="text-sm text-amber-50">Start your application</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Advent Hope</h3>
                  <p className="text-sm text-slate-400">Academy</p>
                </div>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Excellence in Christian Education. Nurturing minds and shaping futures since 2010.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-lg mb-6">Portals</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-lg mb-6">Contact Info</h3>
              <ul className="space-y-4">
                <li>
                  <a href="tel:+263773102003" className="text-slate-400 hover:text-white transition-colors flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-400" />
                    +263 773 102 003
                  </a>
                </li>
                <li>
                  <a href="mailto:info@adventhope.ac.zw" className="text-slate-400 hover:text-white transition-colors flex items-center gap-3">
                    <Mail className="h-5 w-5 text-emerald-400" />
                    info@adventhope.ac.zw
                  </a>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <MapPin className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>Harare, Zimbabwe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-slate-500 text-sm">
                  &copy; {new Date().getFullYear()} Advent Hope Academy. All rights reserved.
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  Designed by <span className="text-blue-400 font-medium">LeeTec Solutions Systems</span> • <a href="tel:+263784031310" className="text-emerald-400 hover:text-emerald-300 transition-colors">+263 784 031 310</a>
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-500 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
