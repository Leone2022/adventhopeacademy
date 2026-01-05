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
    { name: 'Student Portal', href: '/auth/login' },
    { name: 'Parent Portal', href: '/auth/login' },
    { name: 'Staff Login', href: '/auth/login' },
    { name: 'Online Application', href: '/apply' },
  ],
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 text-center">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
          <span className="animate-bounce text-xl">📚</span>
          <p className="text-sm sm:text-base font-medium">
            <span className="hidden sm:inline">Admissions Open for 2026! </span>
            <Link href="/apply" className="underline font-bold hover:text-yellow-300 transition-colors">
              Register Your Child Now →
            </Link>
          </p>
          <span className="animate-bounce text-xl">🎓</span>
        </div>
      </div>

      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-2.5 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a href="tel:+263773102003" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">+263 773 102 003</span>
              </a>
              <a href="mailto:info@adventhope.ac.zw" className="hidden md:flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail className="h-4 w-4" />
                <span>info@adventhope.ac.zw</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4" />
                <span>Mon - Fri: 7:30am - 4:30pm</span>
              </div>
              <div className="flex gap-3 ml-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl shadow-lg ring-2 ring-blue-100 overflow-hidden">
                <Image 
                  src="/uploads/logo.png" 
                  alt="Advent Hope Academy Logo" 
                  width={56} 
                  height={56}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">Advent Hope Academy</h1>
                <p className="text-xs text-blue-600 font-medium">Excellence in Christian Education</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
              >
                <span className="hidden sm:inline">Portal Access</span>
                <span className="sm:hidden">Portal</span>
                <ArrowRight className="h-4 w-4" />
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
      <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-300 text-sm font-medium mb-8 border border-white/20">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Cambridge & ZIMSEC Accredited
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Advent Hope
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                  Academy
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl sm:text-2xl text-blue-200 font-light mb-4">
                Excellence in Christian Education
              </p>

              {/* Description */}
              <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Nurturing minds and shaping futures through quality education rooted in Christian values. 
                We develop the whole child - spiritually, academically, physically, and socially.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/apply"
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 animate-pulse"
                >
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                  </span>
                  🎓 Register Now - No Login Required!
                  <Send className="h-5 w-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  Portal Access
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-teal-400" />
                  <span className="text-sm">Accredited Institution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">Safe Learning Environment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm">International Standards</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl blur-2xl opacity-20" />
                
                {/* Main Card */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                  {/* Logo Display */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                      <div className="text-center">
                        <GraduationCap className="h-12 w-12 text-blue-600 mx-auto" />
                        <span className="text-xs font-bold text-slate-700 mt-1 block">AHA</span>
                      </div>
                    </div>
                  </div>

                  {/* Program Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <BookOpen className="h-8 w-8 mb-3 opacity-80" />
                      <p className="font-semibold">Primary School</p>
                      <p className="text-sm opacity-80">ECD - Grade 7</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                      <Target className="h-8 w-8 mb-3 opacity-80" />
                      <p className="font-semibold">Secondary</p>
                      <p className="text-sm opacity-80">Form 1 - 6</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                      <Lightbulb className="h-8 w-8 mb-3 opacity-80" />
                      <p className="font-semibold">Cambridge</p>
                      <p className="text-sm opacity-80">IGCSE & A-Level</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                      <Award className="h-8 w-8 mb-3 opacity-80" />
                      <p className="font-semibold">ZIMSEC</p>
                      <p className="text-sm opacity-80">O & A Level</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
              Our Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our comprehensive school management system brings together all aspects of education management
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl ${feature.bgColor} hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-200`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group"
            >
              Explore All Features
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="admissions" className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-blue-300 text-sm font-semibold rounded-full mb-4 backdrop-blur-sm">
              By The Numbers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              For over 15 years, we have been committed to providing quality education and shaping future leaders
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.value}
                  <span className="text-blue-400">{stat.suffix}</span>
                </div>
                <p className="text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <a
              href="https://adventhope.ac.zw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all shadow-xl"
            >
              Apply for Admission
              <ArrowRight className="h-5 w-5" />
            </a>
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
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Quick Access Portals</h3>
              <p className="text-slate-300 mb-8">
                Access your portal to view grades, fees, announcements, and more.
              </p>

              <div className="space-y-4">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Student Portal</p>
                      <p className="text-sm text-slate-400">Access your dashboard</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/auth/login"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Parent Portal</p>
                      <p className="text-sm text-slate-400">Track your child's progress</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/auth/login"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Staff Portal</p>
                      <p className="text-sm text-slate-400">Teacher resources</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>

                <a
                  href="https://adventhope.ac.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-colors group mt-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Send className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Apply Now</p>
                      <p className="text-sm text-white/80">Start your application</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-all" />
                </a>
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
              <p className="text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Advent Hope Academy. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-500 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Register Button (Mobile) */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Link
          href="/apply"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold shadow-2xl animate-bounce hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          <span>Register Now</span>
          <Send className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
