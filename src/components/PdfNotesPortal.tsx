import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { PdfNote, PdfDownloadRequest, InstituteSettings } from '../types/index.ts';
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
  BookOpen,
  ShieldCheck,
  User,
  Phone,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Tag,
} from 'lucide-react';

interface Props {
  settings: InstituteSettings;
  onOpenMCQ?: () => void;
  onOpenAdmission?: () => void;
}

export const PdfNotesPortal: React.FC<Props> = ({ settings, onOpenMCQ, onOpenAdmission }) => {
  const [notes, setNotes] = useState<PdfNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Purchase & Request Download Dialog State
  const [activeNoteForRequest, setActiveNoteForRequest] = useState<PdfNote | null>(null);
  const [studentName, setStudentName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState<{
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    message: string;
    fileUrl?: string;
  } | null>(null);

  // Status Lookup Bar
  const [lookupMobile, setLookupMobile] = useState('');
  const [lookupResults, setLookupResults] = useState<PdfDownloadRequest[] | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Approved downloads cache in localStorage (mobile -> array of approved pdfIds)
  const [approvedPdfs, setApprovedPdfs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadNotes();
    // Load cached mobile if student previously looked up
    const savedMobile = localStorage.getItem('aidt_student_notes_mobile');
    if (savedMobile) {
      setMobileNumber(savedMobile);
      setLookupMobile(savedMobile);
      checkAllApprovals(savedMobile);
    }
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await api.getPdfNotes();
      setNotes(data);
    } catch (e) {
      console.error('Failed to load notes', e);
    } finally {
      setLoading(false);
    }
  };

  const checkAllApprovals = async (mobile: string) => {
    try {
      const res = await api.checkPdfApproval(mobile);
      if (res && res.requests) {
        const approvedMap: Record<string, boolean> = {};
        res.requests.forEach((r: PdfDownloadRequest) => {
          if (r.status === 'APPROVED') {
            approvedMap[r.pdfId] = true;
          }
        });
        setApprovedPdfs(approvedMap);
      }
    } catch (e) {
      console.error('Failed checking approvals', e);
    }
  };

  const handleOpenRequestModal = (note: PdfNote) => {
    setActiveNoteForRequest(note);
    setRequestFeedback(null);
    setUtrNumber('');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteForRequest || !studentName.trim() || !mobileNumber.trim()) {
      return;
    }

    if (!utrNumber.trim()) {
      alert('Please enter your 12-digit UPI Transaction / UTR Number after completing payment.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.requestPdfDownload({
        pdfId: activeNoteForRequest.id,
        studentName: studentName.trim(),
        mobile: mobileNumber.trim(),
        amountPaid: activeNoteForRequest.price || 49,
        utrNumber: utrNumber.trim(),
      });

      localStorage.setItem('aidt_student_notes_mobile', mobileNumber.trim());

      if (res.success) {
        setRequestFeedback({
          status: res.status,
          message: res.message,
          fileUrl: res.fileUrl,
        });

        if (res.status === 'APPROVED') {
          setApprovedPdfs((prev) => ({ ...prev, [activeNoteForRequest.id]: true }));
        }
      }
    } catch (err) {
      setRequestFeedback({
        status: 'PENDING',
        message: 'Network error submitting request. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUpi = () => {
    const upi = settings.upiId || '6306242129@upi';
    navigator.clipboard?.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleLookupStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupMobile.trim()) return;
    setLookupLoading(true);
    try {
      const res = await api.checkPdfApproval(lookupMobile.trim());
      setLookupResults(res.requests || []);
      localStorage.setItem('aidt_student_notes_mobile', lookupMobile.trim());
      checkAllApprovals(lookupMobile.trim());
    } catch (err) {
      console.error('Failed to lookup', err);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleDirectDownload = (fileUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || n.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#0b1b3d] via-[#0f2942] to-[#1e3a8a] text-white py-12 px-4 border-b-4 border-[#d4af37]">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-semibold">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Official Institute Curriculum &amp; Examination Notes</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">
            PDF Notes &amp; Study Materials
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto font-sans">
            Authored and uploaded by Director <strong>Mr. Amar Soni (MCA, Data Science)</strong>. Complete syllabus notes for CCC, O-Level, ADCA, Tally Prime + GST, and Competitive IT Exams.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-amber-200/90 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Copyrighted Institutional Handouts
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-amber-400" /> Admin Approval Protected Download
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Verification & Approval Notice Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                How PDF Notes Download Works (Two-Step Verification)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
                1. Click on <strong>"Request Download Access"</strong> on any PDF note &amp; submit your Name and Mobile Number.<br />
                2. Your request goes to the <strong>Admin Portal (Pending for Admin Approval)</strong>.<br />
                3. Once Director / Admin approves, your download unlocks automatically on this portal.
              </p>
            </div>
          </div>

          {onOpenMCQ && (
            <button
              onClick={onOpenMCQ}
              className="px-4 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <span>Practice MCQs First</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Check Status Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleLookupStatus} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 sm:w-60">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Already Requested? Check Approval:</span>
            </div>
            <div className="flex-1 relative">
              <input
                type="tel"
                placeholder="Enter your 10-digit mobile number to check approval status..."
                value={lookupMobile}
                onChange={(e) => setLookupMobile(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#0f2942]"
              />
            </div>
            <button
              type="submit"
              disabled={lookupLoading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {lookupLoading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {/* Lookup Results */}
          {lookupResults && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-600">
                Found {lookupResults.length} request(s) for mobile: <strong>{lookupMobile}</strong>
              </div>
              {lookupResults.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No previous requests found for this number. Click "Request Download Access" below.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lookupResults.map((r) => {
                    const matchedNote = notes.find((n) => n.id === r.pdfId);
                    return (
                      <div
                        key={r.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          r.status === 'APPROVED'
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            : r.status === 'REJECTED'
                            ? 'bg-red-50/70 border-red-300 text-red-950'
                            : 'bg-amber-50/70 border-amber-300 text-amber-950'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold truncate">{r.pdfTitle}</div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            Status:{' '}
                            <span className="font-bold uppercase">{r.status}</span>
                            {r.approvedAt && ` • Approved: ${r.approvedAt.split('T')[0]}`}
                          </div>
                        </div>

                        {r.status === 'APPROVED' && matchedNote ? (
                          <button
                            onClick={() => handleDirectDownload(matchedNote.fileUrl, r.pdfTitle)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        ) : (
                          <span className="px-2 py-1 bg-white/70 rounded text-[10px] font-bold shrink-0">
                            {r.status === 'PENDING' ? '⏳ Awaiting Admin' : '❌ Access Denied'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Subjects' },
              { id: 'CCC', label: 'CCC Notes' },
              { id: "O'Level", label: "O'Level NIELIT" },
              { id: 'Python', label: 'Python & Data Science' },
              { id: 'Tally', label: 'Tally Prime + GST' },
              { id: 'Competitive', label: 'Competitive IT' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0f2942] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0f2942]"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-2" />
            <div>Loading Official Notes Library...</div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-800">No Notes Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => {
              const isApproved = approvedPdfs[note.id] === true;

              return (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-semibold text-[10px]">
                        {note.category}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-mono">
                        {note.fileSize || 'PDF Format'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {note.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {note.description}
                    </p>

                    {/* Pricing with Strike-through & Discount */}
                    <div className="p-3 bg-gradient-to-r from-amber-50/80 via-emerald-50/40 to-slate-50 border border-amber-200/80 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Study Notes Fee</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xl font-black text-slate-950 font-mono">
                            ₹{note.price || 49}
                          </span>
                          <span className="text-xs text-slate-400 line-through font-mono">
                            ₹{note.originalPrice || 199}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{note.discountPercent || Math.round((((note.originalPrice || 199) - (note.price || 49)) / (note.originalPrice || 199)) * 100)}% OFF</span>
                        </span>
                        <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">Instant Digital Access</div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Pages: <strong>{note.pages || 50}</strong></span>
                      <span>By: <strong>{note.uploadedBy || 'Director Amar Soni'}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    {isApproved ? (
                      <button
                        onClick={() => handleDirectDownload(note.fileUrl, note.title)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF (Access Approved)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenRequestModal(note)}
                        className="w-full py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer group"
                      >
                        <QrCode className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>Purchase Notes • ₹{note.price || 49}</span>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                          Save ₹{(note.originalPrice || 199) - (note.price || 49)}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* MODAL: PURCHASE NOTES VIA QR CODE & SUBMIT PAYMENT */}
      {/* ============================================================= */}
      {activeNoteForRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-200 animate-in fade-in my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveNoteForRequest(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 text-[#0f2942]">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Purchase Official PDF Notes
                </h3>
                <p className="text-[11px] text-slate-500">
                  Advance Institute of Digital Technology • Official Payment Gateway
                </p>
              </div>
            </div>

            {/* Note & Price Summary */}
            <div className="p-3.5 bg-slate-50 border rounded-xl mb-4 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected Study Material:</span>
                  <div className="font-bold text-slate-900 text-sm">{activeNoteForRequest.title}</div>
                  <div className="text-slate-500 font-medium text-[11px]">Category: {activeNoteForRequest.category} ({activeNoteForRequest.pages} Pages)</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-500">Total Payable:</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">₹{activeNoteForRequest.price || 49}</span>
                  <span className="text-xs text-slate-400 line-through font-mono">₹{activeNoteForRequest.originalPrice || 199}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  Save ₹{(activeNoteForRequest.originalPrice || 199) - (activeNoteForRequest.price || 49)} ({activeNoteForRequest.discountPercent || 75}% Discount)
                </span>
              </div>
            </div>

            {requestFeedback ? (
              <div className="space-y-4 text-center py-3">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                    requestFeedback.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {requestFeedback.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <Clock className="w-8 h-8 animate-pulse" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {requestFeedback.status === 'APPROVED'
                      ? 'Payment Verified: Download Unlocked!'
                      : 'Payment Submitted: Pending Admin Verification'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {requestFeedback.message}
                  </p>
                </div>

                {requestFeedback.status === 'APPROVED' && requestFeedback.fileUrl ? (
                  <button
                    onClick={() => handleDirectDownload(requestFeedback.fileUrl!, activeNoteForRequest.title)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Notes Now</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 text-left space-y-1">
                    <div className="font-bold flex items-center gap-1 text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Admin Portal Verification in Progress</span>
                    </div>
                    <div className="text-[11px] leading-relaxed text-amber-800">
                      Your transaction details have been registered on Director Amar Soni's desk. Once verified in the Admin Portal, you can enter your registered mobile number ({mobileNumber}) in the <strong>"Check Approval Status"</strong> box above to download your notes at any time.
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveNoteForRequest(null)}
                  className="w-full py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
                {/* STEP 1: SCAN QR CODE TO PAY */}
                <div className="p-4 bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-700" />
                      <span>Step 1: Scan QR Code &amp; Pay ₹{activeNoteForRequest.price || 49}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                      Official UPI
                    </span>
                  </div>

                  {/* QR Image Container */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center max-w-[240px] mx-auto shadow-xs">
                    <div className="w-44 h-44 mx-auto rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50">
                      <img
                        src={settings.upiQrCodeUrl || '/upi-qr-aidt.svg'}
                        alt="Institute Payment QR Code"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/upi-qr-aidt.svg';
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-1.5">
                      Scan with Google Pay, PhonePe, Paytm, or BHIM
                    </span>
                  </div>

                  {/* Copy UPI ID */}
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-400 font-bold block">UPI ID:</span>
                      <span className="font-mono font-bold text-slate-900 truncate block">
                        {settings.upiId || '6306242129@upi'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* STEP 2: ENTER STUDENT & PAYMENT DETAILS */}
                <div className="space-y-3 pt-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Step 2: Submit Payment Details for Admin Verification</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Student Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amit Kumar Verma"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0f2942]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      WhatsApp / Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0f2942]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Used by Director Amar Soni to verify and dispatch download credentials.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      UPI Transaction ID / UTR Number (12 Digits) *
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 504938291048 or UPI Ref No from your payment app"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0f2942] font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Found in Google Pay, PhonePe, or Paytm payment receipt under "UPI Transaction ID" or "UTR".
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>
                    Your payment details will immediately appear in the <strong>Admin Portal</strong> for Director Amar Soni's verification. Once confirmed, you can download your complete PDF notes immediately.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveNoteForRequest(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>{submitting ? 'Submitting Details...' : `Confirm Payment & Request Access (₹${activeNoteForRequest.price || 49})`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
