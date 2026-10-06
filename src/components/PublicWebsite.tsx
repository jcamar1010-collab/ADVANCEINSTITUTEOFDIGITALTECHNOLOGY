import React, { useState } from 'react';
import { InstituteSettings, Course, Franchise, NoticeItem } from '../types/index.ts';
import { NoticeBoardTicker } from './NoticeBoardTicker.tsx';
import {
  ShieldCheck,
  Award,
  FileCheck,
  UserPlus,
  Building2,
  Search,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Clock,
  Briefcase,
  Cpu,
  Flame,
  BrainCircuit,
  FileText,
  ArrowRight,
  Play,
  Video,
  Edit3,
  ExternalLink,
} from 'lucide-react';

function getYouTubeEmbedUrl(url?: string): string {
  if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  if (url.includes('/embed/')) return url;
  const matchWatch = url.match(/[?&]v=([^&#]+)/);
  if (matchWatch && matchWatch[1]) {
    return `https://www.youtube.com/embed/${matchWatch[1]}`;
  }
  const matchShort = url.match(/youtu\.be\/([^?&#]+)/);
  if (matchShort && matchShort[1]) {
    return `https://www.youtube.com/embed/${matchShort[1]}`;
  }
  const matchShorts = url.match(/\/shorts\/([^?&#]+)/);
  if (matchShorts && matchShorts[1]) {
    return `https://www.youtube.com/embed/${matchShorts[1]}`;
  }
  return url;
}

interface Props {
  settings: InstituteSettings;
  courses: Course[];
  franchises: Franchise[];
  notices?: NoticeItem[];
  onOpenAdmission: (courseId?: string) => void;
  onOpenFranchise: () => void;
  onNavigateVerification: (type: 'certificate' | 'marksheet', query?: string) => void;
  onOpenAdminNotices?: () => void;
  onOpenMCQ?: () => void;
  onOpenNotes?: () => void;
  isAdmin?: boolean;
}

export const PublicWebsite: React.FC<Props> = ({
  settings,
  courses,
  franchises,
  notices = [],
  onOpenAdmission,
  onOpenFranchise,
  onNavigateVerification,
  onOpenAdminNotices,
  onOpenMCQ,
  onOpenNotes,
  isAdmin,
}) => {
  const [quickSearch, setQuickSearch] = useState('');
  const [searchType, setSearchType] = useState<'certificate' | 'marksheet'>('certificate');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    onNavigateVerification(searchType, quickSearch.trim());
  };

  return (
    <div className="space-y-16 pb-16">
      {/* ------------------------------------------------------------- */}
      {/* NOTICE BOARD TICKER (Transition / Alternate) */}
      {/* ------------------------------------------------------------- */}
      <NoticeBoardTicker
        notices={notices}
        onOpenAdmission={() => onOpenAdmission()}
        onOpenFranchise={onOpenFranchise}
        onNavigateVerification={onNavigateVerification}
        onOpenAdminNotices={onOpenAdminNotices}
        isAdmin={isAdmin}
      />

      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative bg-gradient-to-b from-[#0b1b3d] via-[#0f2942] to-[#07132c] text-white pt-14 pb-20 px-4 overflow-hidden border-b-4 border-[#d4af37]">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Government / ISO Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>ISO 9001:2015 Certified IT Institute • Autonomous Skill Examination Board</span>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 drop-shadow-sm">
              ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY
            </h1>
            <p className="text-amber-200/90 font-medium text-sm sm:text-base max-w-2xl mx-auto font-serif italic">
              Empowering Students &amp; Professionals with Practical IT, Programming, Accounting &amp; Data Science
            </p>
          </div>

          {/* Director & Location Card */}
          <div className="inline-block bg-white/10 backdrop-blur-md border border-white/15 px-6 py-2.5 rounded-lg shadow-lg text-xs sm:text-sm text-slate-200">
            <span className="text-amber-300 font-bold">Director &amp; Founder:</span>{' '}
            <strong className="text-white font-semibold">{settings.directorName}</strong>{' '}
            <span className="text-slate-300">({settings.directorQualification})</span>
            <div className="text-[11px] text-slate-300 mt-0.5">
              📍 Kaushalpuri Phase 1, Near Grammar Academy Chauraha, Ayodhya Cantt – 224001, UP
            </div>
          </div>

          {/* Quick Verification Search Box */}
          <div className="max-w-2xl mx-auto bg-white/95 text-slate-900 p-5 rounded-2xl shadow-2xl border-2 border-[#d4af37] text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0f2942] flex items-center gap-1.5">
                <Search className="w-4 h-4 text-amber-600" /> Instant Credential Verification
              </span>
              <div className="flex rounded-md bg-slate-200 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSearchType('certificate')}
                  className={`px-3 py-1 rounded font-semibold transition-all ${
                    searchType === 'certificate' ? 'bg-[#0f2942] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('marksheet')}
                  className={`px-3 py-1 rounded font-semibold transition-all ${
                    searchType === 'marksheet' ? 'bg-[#1e3a8a] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Marksheet
                </button>
              </div>
            </div>

            <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder={
                  searchType === 'certificate'
                    ? 'Enter Certificate No (e.g. ACI/CERT/2026/000001)'
                    : 'Enter Marksheet No (e.g. ACI/MARK/2026/000001)'
                }
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-[#0f2942] uppercase text-slate-800"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Verify Online
              </button>
            </form>
            <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Supports Certificate No, Marksheet No, Enrollment No &amp; QR verification</span>
              <span className="text-emerald-700 font-semibold">100% Genuine Database Record</span>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAdmission()}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Apply for Student Admission 2026</span>
            </button>

            <button
              onClick={onOpenFranchise}
              className="px-6 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-[#0f2942] hover:from-blue-950 hover:to-black text-white border-2 border-amber-400 font-bold text-xs rounded-lg transition-all flex items-center gap-2.5 shadow-xl backdrop-blur-xs transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Partner as Franchise Study Center</span>
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px] flex items-center gap-1 shadow-xs">
                <span className="line-through text-slate-600 font-medium">₹1,100</span>
                <span className="text-red-700 font-black">FREE ₹0</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4 CORE VALUE PILLARS */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Autonomous Certification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardized examinations and high-security serialized certificates issued directly under the seal of Director Amar Soni.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">7-Stage Admin Approval</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Franchise centers enter marks which remain locked in pending state until central administrator verification and publishing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Anti-Fraud QR Security</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every issued certificate and marksheet contains an authenticated QR code linked to advancecomputerinstitute.com public records.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Data Science &amp; IT Focus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Syllabus structured with MCA &amp; Data Science expertise covering Python, Office Automation, Tally Prime + GST, and Web Systems.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* STUDENT EXAMINATION & PREPARATION CORNER (MCQ & PDF NOTES) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: MCQ Practice Tests */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 border-2 border-amber-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-amber-600 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5" /> Exam Ready
                </span>
                <span className="text-[11px] font-bold text-amber-900">
                  CCC • O'Level • Competitive
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Online MCQ Practice Tests &amp; Mock Exams
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed">
                Prepare for NIELIT CCC, O'Level (IT Tools, Web Designing, Python), Railway NTPC, UPSSSC, and State SSC exams with official mock tests, timer simulations, and instant answers.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="px-2 py-0.5 bg-white border border-amber-200 rounded font-semibold text-amber-900">
                  ✓ NIELIT Pattern
                </span>
                <span className="px-2 py-0.5 bg-white border border-amber-200 rounded font-semibold text-amber-900">
                  ✓ Instant Score &amp; Explanations
                </span>
                <span className="px-2 py-0.5 bg-white border border-amber-200 rounded font-semibold text-amber-900">
                  ✓ 100% Free for Students
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">Self-Assessment Portal</span>
              <button
                onClick={onOpenMCQ}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Start MCQ Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: PDF Notes Download */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 border-2 border-blue-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-blue-700 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Official Notes
                </span>
                <span className="text-[11px] font-bold text-blue-900">
                  Curated by Director Amar Soni
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-tight">
                Curriculum PDF Handouts &amp; Study Notes
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed">
                Download verified comprehensive PDF revision books for CCC, O'Level Modules, Tally Prime + GST, and ADCA. Submit your name &amp; mobile to request download access approved by Admin!
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="px-2 py-0.5 bg-white border border-blue-200 rounded font-semibold text-blue-900">
                  ✓ Chapter-wise Handouts
                </span>
                <span className="px-2 py-0.5 bg-white border border-blue-200 rounded font-semibold text-blue-900">
                  ✓ Admin Verified Access
                </span>
                <span className="px-2 py-0.5 bg-white border border-blue-200 rounded font-semibold text-blue-900">
                  ✓ Instant Download Link
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950">Study Material Repository</span>
              <button
                onClick={onOpenNotes}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Browse PDF Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* OFFICIAL YOUTUBE VIDEO LECTURES & CAMPUS TOUR */}
      {/* ------------------------------------------------------------- */}
      {settings.youtubeSectionEnabled !== false && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl border-2 border-red-200/80 shadow-md p-6 sm:p-8 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Official Video Classroom &amp; Lectures</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-cinzel">
                  {settings.youtubeSectionTitle || 'Director Mr. Amar Soni Special Classes & Practical Tour'}
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {settings.youtubeSectionDescription || 'Watch computer practical lab demos, programming seminars, and course guidance directly by Founder & Director Mr. Amar Soni (MCA, Data Science).'}
                </p>
              </div>

              {isAdmin && onOpenAdminNotices && (
                <button
                  onClick={onOpenAdminNotices}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 self-start cursor-pointer transition-colors"
                  title="Admin can change video link in Institute Settings"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Video Link (Admin)</span>
                </button>
              )}
            </div>

            {/* Video Player Frame with 16:9 Aspect Ratio */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl bg-slate-950 border border-slate-300">
              <iframe
                src={getYouTubeEmbedUrl(settings.youtubeVideoUrl)}
                title="Advance Institute of Digital Technology Video Classes"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>Live Streaming Class Updates • Advance Institute of Digital Technology Ayodhya Cantt</span>
              </div>
              <span className="text-red-700 font-bold">Director: Mr. Amar Soni (MCA, Data Science)</span>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DIRECTOR'S DESK */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] text-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Director Official Identification (No Photo - Only Name, Designation, Qualification) */}
            <div className="shrink-0 w-full md:w-72 bg-gradient-to-b from-black/50 to-black/80 rounded-2xl border-2 border-[#d4af37] p-6 text-center shadow-xl space-y-3">
              <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                ★ Founder &amp; Director ★
              </div>
              <div className="space-y-1">
                <h3 className="font-cinzel font-bold text-2xl text-amber-300 tracking-wide">
                  Mr. Amar Soni
                </h3>
                <div className="text-sm font-bold text-white">
                  MCA, Data Science
                </div>
                <div className="text-xs font-semibold text-amber-200">
                  Designation: Founder &amp; Director
                </div>
                <div className="text-[10px] text-slate-300 uppercase tracking-widest pt-2 border-t border-white/15">
                  Advance Institute of Digital Technology
                </div>
                <div className="text-[10px] text-amber-300/80 font-mono">
                  Ayodhya Cantt, Uttar Pradesh
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center justify-center">
                <img
                  src={settings.directorSignatureUrl || '/signature-amar-soni.svg'}
                  alt="Director Signature"
                  className="h-9 object-contain invert brightness-0 opacity-90"
                />
                <span className="text-[9px] text-amber-300/70 font-mono mt-1">Authorized Signatory</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-4 flex-1">
              <div className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                From the Director's Desk
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                "Bridging the Gap Between Academic Education and Practical IT Excellence"
              </h2>
              <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-sans">
                At <strong>Advance Institute of Digital Technology (Ayodhya Cantt)</strong>, our founding commitment is to provide students, job aspirants, and local youth with rigorous, practical computer education. Having specialized in Computer Applications (MCA) and Data Science, I have personally designed our curriculum to emphasize real-world competencies: from foundational office automation and financial accounting to modern programming with Python and data analysis.
              </p>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                Our automated management and verification platform ensures total integrity: students earn credentials that employers and government bodies can authenticate in real time through QR codes and permanent database records.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-amber-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Official Institutional Message • Ayodhya Cantt Campus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* COURSE CATALOG */}
      {/* ------------------------------------------------------------- */}
      <section id="courses-section" className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>Limited Time Admission Concession • 20% Extra Off</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#0f2942] tracking-tight">
            Academic &amp; Professional Programs
          </h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto">
            Comprehensive career-oriented diplomas and certifications with hands-on lab training &amp; official ISO verified certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const origFee = course.originalFee || Math.round(course.fee * 1.5);
            const discount = course.originalFee ? Math.round(((course.originalFee - course.fee) / course.originalFee) * 100) : 40;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Discount Badge Ribbon */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-red-600 to-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-xs">
                  {course.badgeText || `${discount}% OFF`}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between pr-14">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-1 group-hover:text-blue-900 transition-colors">
                        {course.name}
                      </h3>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-700 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Duration: {course.duration}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>

                  {/* Modules breakdown */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">
                      Key Modules ({course.subjects.length} Subjects):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {course.subjects.slice(0, 4).map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {course.subjects.length > 4 && (
                        <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                          +{course.subjects.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div>Eligibility: <strong className="text-slate-700 block truncate">{course.eligibility}</strong></div>
                    <div>Session: <strong className="text-slate-700 block">{course.session}</strong></div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admission Fee</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-lg text-emerald-700">₹{course.fee.toLocaleString()}</span>
                      <span className="text-xs line-through text-slate-400 font-semibold">₹{origFee.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenAdmission(course.id)}
                    className="flex items-center gap-1 px-3.5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <span>Apply</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* AUTHORIZED FRANCHISE NETWORK */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Authorized Network</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#0f2942] tracking-tight">
            Study Centers &amp; Franchises
          </h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto">
            Accredited training centers operating under the guidelines of Advance Institute of Digital Technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {franchises.map((f) => (
            <div key={f.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    {f.centerCode}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{f.centerName}</h3>
                  <div className="text-xs text-slate-600 font-medium">Center Head: {f.ownerName}</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  VERIFIED CENTER
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t">
                <div>📍 {f.address}, {f.district}, {f.state}</div>
                <div>📞 Mobile: {f.mobile} | ✉️ {f.email}</div>
              </div>
            </div>
          ))}
        </div>

        {/* High-Impact Highlighted Free Franchise Offer Banner */}
        <div className="bg-gradient-to-br from-[#0f2942] via-[#1a3d60] to-[#0f2942] border-2 border-amber-400 p-6 sm:p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-yellow-300" />
                  <span>SPECIAL OFFER • 100% FREE FRANCHISE</span>
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-full text-[11px] font-extrabold uppercase">
                  ZERO AFFILIATION FEE
                </span>
              </div>

              {/* Title & Pricing Strikethrough */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight font-cinzel">
                  Start an Authorized Computer Study Center in Your Area!
                </h3>
                
                {/* 1100/- Strike through to 0 Free */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2">
                  <span className="text-xs sm:text-sm text-slate-300 font-semibold">Affiliation Fee:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-red-400 text-base sm:text-lg font-bold decoration-2">
                      ₹1,100/-
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                      ₹0 / FREE
                    </span>
                  </div>
                  <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    SAVE ₹1,100 (100% OFF)
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Partner with <strong>Advance Institute of Digital Technology</strong> under Founder &amp; Director Mr. Amar Soni. Get full autonomous portal access, syllabus books, student registration rights, and official verified QR marksheets &amp; certificates.
              </p>

              {/* Benefits Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Zero Initial Fee:</strong> No ₹1,100 charge (Completely Free)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Autonomous Verification:</strong> Director Amar Soni certified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Franchise Center Panel:</strong> Student admission &amp; marks portal</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Free Study Material:</strong> CCC, O'Level, ADCA &amp; Tally Prime</span>
                </div>
              </div>
            </div>

            {/* Action Card Button */}
            <div className="flex flex-col items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={onOpenFranchise}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Building2 className="w-5 h-5 text-slate-950" />
                <span>Claim Free Franchise (₹0 Fee) →</span>
              </button>
              <div className="text-[11px] text-amber-200 text-center font-medium">
                ⚡ Instant Application • Zero Security Deposit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CONTACT & CAMPUS INFORMATION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Official Campus
              </span>
              <h2 className="text-2xl font-black text-[#0f2942]">
                Advance Institute of Digital Technology — Ayodhya Cantt
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visit our central campus for course counseling, lab demonstrations, offline admission verification, or franchise inquiries.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Address</strong>
                    <span className="text-slate-600">
                      Near Grammar Academy Chauraha, Kaushalpuri Phase 1, Ayodhya Cantt, Ayodhya – 224001, Uttar Pradesh, India
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Official Helpline Numbers</strong>
                    <span className="font-mono text-slate-700 font-bold">6306242129 / 8382819908</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Email Correspondence</strong>
                    <span className="text-slate-700">advancecomputerinstitute2026@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Campus Highlight Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#0f2942]">Lab Facilities &amp; Working Hours</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Monday – Saturday</span>
                    <strong className="text-slate-800">08:00 AM – 06:30 PM</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Sunday</span>
                    <span className="text-amber-800 font-semibold">Special Practical Batches</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Computer Lab Ratio</span>
                    <strong className="text-slate-800">1:1 High-Speed Workstations</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Internet &amp; Power</span>
                    <strong className="text-emerald-700">Dedicated Fiber + Inverter Backup</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={() => onOpenAdmission()}
                  className="w-full py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white text-xs font-semibold rounded-lg text-center shadow-xs"
                >
                  Submit Admission Query
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
