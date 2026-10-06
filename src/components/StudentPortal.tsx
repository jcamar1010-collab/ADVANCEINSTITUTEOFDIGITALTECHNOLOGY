import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import {
  InstituteSettings,
  Student,
  CertificateRecord,
  MarksheetRecord,
  PdfNote,
  PdfDownloadRequest,
  MCQQuestion,
} from '../types/index.ts';
import { CertificateDocument } from './CertificateDocument.tsx';
import { MarksheetDocument } from './MarksheetDocument.tsx';
import {
  GraduationCap,
  Award,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Eye,
  CheckCircle2,
  Lock,
  BookOpen,
  BrainCircuit,
  FileText,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Check,
  XCircle,
  KeyRound,
  X,
} from 'lucide-react';

interface Props {
  settings: InstituteSettings;
  studentId?: string;
}

export const StudentPortal: React.FC<Props> = ({ settings, studentId = 'stu-01' }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'mcq' | 'notes'>('documents');
  const [profileData, setProfileData] = useState<{
    student: Student;
    marksRecord: any | null;
    marksStatus: string;
    certificate: CertificateRecord | null;
    marksheet: MarksheetRecord | null;
    isVerifiedAndApproved: boolean;
  } | null>(null);

  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [previewMark, setPreviewMark] = useState<MarksheetRecord | null>(null);

  // Password Change State
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [changingPwd, setChangingPwd] = useState(false);

  // PDF Notes state for Student
  const [notesList, setNotesList] = useState<PdfNote[]>([]);
  const [myRequests, setMyRequests] = useState<PdfDownloadRequest[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [requestModalNote, setRequestModalNote] = useState<PdfNote | null>(null);
  const [reqName, setReqName] = useState('');
  const [reqMobile, setReqMobile] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqMessage, setReqMessage] = useState<string | null>(null);

  // MCQ State for Student
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);
  const [mcqCategory, setMcqCategory] = useState<string>('ALL');
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [mcqLoading, setMcqLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getStudentProfile(studentId);
        setProfileData(res);
        if (res?.student) {
          setReqName(res.student.fullName);
          setReqMobile(res.student.mobile || '');
          // Load PDF requests for this student's mobile
          if (res.student.mobile) {
            checkStudentPdfApprovals(res.student.mobile);
          }
        }
      } catch (e) {
        console.error('Failed to load student profile', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  // Load Notes
  const loadNotes = async () => {
    setNotesLoading(true);
    try {
      const data = await api.getPdfNotes();
      setNotesList(data);
    } catch (e) {
      console.error('Failed to load pdf notes', e);
    } finally {
      setNotesLoading(false);
    }
  };

  // Load MCQs
  const loadMCQs = async (cat?: string) => {
    setMcqLoading(true);
    try {
      const data = await api.getMCQs(cat === 'ALL' ? undefined : cat);
      setMcqs(data);
    } catch (e) {
      console.error('Failed to load MCQs', e);
    } finally {
      setMcqLoading(false);
    }
  };

  const checkStudentPdfApprovals = async (mob: string) => {
    try {
      const res = await api.checkPdfApproval(mob);
      if (res && res.requests) {
        setMyRequests(res.requests);
      }
    } catch (e) {
      console.error('Failed to check approvals', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'notes') {
      loadNotes();
      if (profileData?.student?.mobile) {
        checkStudentPdfApprovals(profileData.student.mobile);
      }
    } else if (activeTab === 'mcq') {
      loadMCQs(mcqCategory);
    }
  }, [activeTab, mcqCategory]);

  const handleOpenRequest = (note: PdfNote) => {
    setRequestModalNote(note);
    setReqName(profileData?.student?.fullName || '');
    setReqMobile(profileData?.student?.mobile || '');
    setReqMessage(null);
  };

  const handleSubmitDownloadRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalNote) return;
    setSubmittingReq(true);
    setReqMessage(null);
    try {
      const res = await api.requestPdfDownload({
        pdfId: requestModalNote.id,
        studentName: reqName,
        mobile: reqMobile,
      });
      if (res.success) {
        setReqMessage(res.message);
        if (reqMobile) {
          checkStudentPdfApprovals(reqMobile);
        }
      } else {
        setReqMessage(res.error || 'Failed to submit request.');
      }
    } catch (err: any) {
      setReqMessage('Failed to submit request. Please try again.');
    } finally {
      setSubmittingReq(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPwd || newPwd.length < 4) {
      setPwdError('New password must be at least 4 characters long.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match. Please re-enter.');
      return;
    }

    setChangingPwd(true);
    setPwdError(null);
    setPwdSuccess(null);

    try {
      const res = await api.changePassword({
        referenceId: profileData?.student?.id,
        currentPassword: currentPwd,
        newPassword: newPwd,
        role: 'student',
      });
      if (res.success) {
        setPwdSuccess('Your password has been updated successfully!');
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
        setTimeout(() => {
          setIsPwdModalOpen(false);
          setPwdSuccess(null);
        }, 2200);
      } else {
        setPwdError(res.error || 'Failed to update password. Verify current password.');
      }
    } catch (err: any) {
      setPwdError('Connection error while changing password.');
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-3 border-[#0f2942] border-t-transparent rounded-full animate-spin mb-2" />
        <div>Loading Student Dashboard...</div>
      </div>
    );
  }

  const { student, marksRecord, marksStatus, certificate, marksheet, isVerifiedAndApproved } = profileData;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-28 border-2 border-slate-300 p-0.5 rounded shadow-xs bg-white shrink-0 overflow-hidden">
            <img
              src={student.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
              alt={student.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold rounded-full">
                <GraduationCap className="w-3.5 h-3.5" /> Enrolled Student
              </div>

              <button
                onClick={() => {
                  setIsPwdModalOpen(true);
                  setPwdError(null);
                  setPwdSuccess(null);
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Change Password</span>
              </button>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{student.fullName}</h1>
            <p className="text-xs text-slate-600 font-medium">
              Father's Name: <strong className="text-slate-800">{student.fatherName}</strong> | Center: <strong>{student.franchiseName}</strong>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Enrollment Number</span>
                <span className="font-bold text-[#0f2942]">{student.enrollmentNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Registration Number</span>
                <span className="font-bold text-slate-800">{student.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Course</span>
                <span className="font-sans font-semibold text-slate-800">{student.courseName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Academic Status</span>
                <span className="font-sans font-bold text-emerald-700">{student.academicStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Portal Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-[#0f2942] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Academic Credentials &amp; Documents</span>
        </button>

        <button
          onClick={() => setActiveTab('mcq')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'mcq'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-amber-400" />
          <span>MCQ Practice Tests (CCC / O'Level)</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-300" />
          <span>PDF Notes &amp; Downloads</span>
          {myRequests.filter((r) => r.status === 'APPROVED').length > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold">
              {myRequests.filter((r) => r.status === 'APPROVED').length} Ready
            </span>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ACADEMIC CREDENTIALS & DOCUMENTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Official Status Tracker Banner */}
          {!isVerifiedAndApproved ? (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 text-center space-y-3 shadow-xs">
              <Clock className="w-12 h-12 text-amber-600 mx-auto animate-pulse" />
              <h2 className="text-lg font-bold text-amber-950">
                Document Pending Admin Verification
              </h2>
              <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
                Your admission and examination records are currently undergoing verification by Director Mr. Amar Soni and the examination authority.
                In compliance with Advance Institute of Digital Technology regulations, official marksheets and certificates will only become available for viewing and download once approved.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" /> Official Documents Locked
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-emerald-950">
                    Official Academic Credentials Approved &amp; Published
                  </h2>
                  <p className="text-xs text-emerald-800">
                    Your certificate and statement of marks have been officially signed and sealed by Director Mr. Amar Soni.
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold uppercase tracking-wider">
                Verified
              </div>
            </div>
          )}

          {/* Official Document Cards (Only accessible when approved) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certificate Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Official Certificate of Proficiency</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Official parchment credential with high-resolution ornate border, Director Amar Soni signature, authorized institute stamp, and QR verification code.
                </p>
                {certificate ? (
                  <div className="p-3 bg-slate-50 border rounded text-xs space-y-1 font-mono">
                    <div>Certificate No: <strong>{certificate.certificateNumber}</strong></div>
                    <div>Issued: <strong>{certificate.issueDate}</strong></div>
                    <div>Grade: <strong className="text-emerald-700">{certificate.grade}</strong></div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border rounded text-xs text-slate-500 italic">
                    Awaiting final generation from Admin examination panel.
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                {certificate ? (
                  <button
                    onClick={() => setPreviewCert(certificate)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> View &amp; Download Certificate
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                  >
                    Certificate Not Available Yet
                  </button>
                )}
              </div>
            </div>

            {/* Marksheet Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Official Statement of Marks</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authorized academic transcript with subject-wise marks, Theory &amp; Practical breakdown, grand total, aggregate percentage, and official seal.
                </p>
                {marksheet ? (
                  <div className="p-3 bg-slate-50 border rounded text-xs space-y-1 font-mono">
                    <div>Marksheet No: <strong>{marksheet.marksheetNumber}</strong></div>
                    <div>Aggregate Score: <strong>{marksheet.totalObtained} / {marksheet.totalMax}</strong></div>
                    <div>Percentage: <strong className="text-blue-900">{marksheet.percentage}%</strong></div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border rounded text-xs text-slate-500 italic">
                    Awaiting approval by the Director and Examination Controller.
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                {marksheet ? (
                  <button
                    onClick={() => setPreviewMark(marksheet)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> View &amp; Download Marksheet
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                  >
                    Marksheet Not Available Yet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: MCQ PRACTICE TESTS (CCC, O'LEVEL, COMPETITIVE) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'mcq' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Interactive Student Examination Mock Portal</span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">
                MCQ Practice Tests for CCC, O'Level &amp; Competitive Exams
              </h2>
              <p className="text-xs text-amber-100 max-w-xl mt-1">
                Test your conceptual knowledge with official exam-aligned multiple choice questions, timer mock tests, and instant explanations.
              </p>
            </div>
            <button
              onClick={() => {
                setMcqAnswers({});
                setShowExplanation({});
                loadMCQs(mcqCategory);
              }}
              className="px-3.5 py-2 bg-white text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-amber-50 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Modules' },
              { id: 'CCC', label: 'CCC (NIELIT)' },
              { id: 'O_LEVEL', label: "O'Level (IT Tools & Python)" },
              { id: 'COMPETITIVE', label: 'Competitive Computer Awareness' },
              { id: 'ADCA_DCA', label: 'ADCA / DCA & Tally' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setMcqCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mcqCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Questions List */}
          {mcqLoading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="inline-block w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mb-2" />
              <div>Loading examination questions...</div>
            </div>
          ) : mcqs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              No questions found for this category yet.
            </div>
          ) : (
            <div className="space-y-4">
              {mcqs.map((q, qIdx) => {
                const selectedOpt = mcqAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = isAnswered && selectedOpt === q.correctAnswerIndex;

                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                      isAnswered
                        ? isCorrect
                          ? 'border-emerald-300 ring-1 ring-emerald-200'
                          : 'border-red-300 ring-1 ring-red-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px] uppercase tracking-wide">
                        {q.categoryName || q.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Question #{qIdx + 1}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-4 leading-relaxed">
                      {q.question}
                    </h3>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700';

                        if (isAnswered) {
                          if (optIdx === q.correctAnswerIndex) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                          } else if (optIdx === selectedOpt && !isCorrect) {
                            btnStyle = 'border-red-500 bg-red-50 text-red-950 font-bold';
                          } else {
                            btnStyle = 'border-slate-200 bg-slate-50 opacity-60 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswered}
                            onClick={() => {
                              setMcqAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                              setShowExplanation((prev) => ({ ...prev, [q.id]: true }));
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                          >
                            <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isAnswered && optIdx === q.correctAnswerIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {isAnswered && optIdx === selectedOpt && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {isAnswered && q.explanation && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
                        <strong className="text-blue-900 block mb-0.5">Explanation &amp; Reference:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: PDF NOTES & DOWNLOADS WITH ADMIN APPROVAL */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border-b-2 border-amber-500">
            <div>
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Institute Curriculum Notes &amp; PDF Handouts</span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">
                Download Official Study Material &amp; Syllabus Notes
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                Curated by Director Mr. Amar Soni. Click "Request Download" to submit your request to the Admin portal. Once Admin approves ("Admin OK"), you can download the PDF directly!
              </p>
            </div>
            <button
              onClick={() => {
                loadNotes();
                if (student.mobile) checkStudentPdfApprovals(student.mobile);
              }}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/20 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Notes Grid */}
          {notesLoading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="inline-block w-6 h-6 border-2 border-[#0f2942] border-t-transparent rounded-full animate-spin mb-2" />
              <div>Loading notes repository...</div>
            </div>
          ) : notesList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              No PDF notes uploaded by Admin yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notesList.map((note) => {
                const req = myRequests.find((r) => r.pdfId === note.id);
                const isApproved = req?.status === 'APPROVED';
                const isPending = req?.status === 'PENDING';
                const isRejected = req?.status === 'REJECTED';

                return (
                  <div
                    key={note.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-bold text-[10px] uppercase tracking-wide">
                          {note.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {note.fileSize || '5 MB'} • {note.pages || 40} pages
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {note.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3">
                        {note.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* Approval Status Badge */}
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Admin
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Pending for Admin Approval
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Request Rejected
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Admin Verification Required
                        </span>
                      )}

                      {/* Action Button */}
                      {isApproved ? (
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={note.title}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      ) : isPending ? (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold cursor-not-allowed"
                        >
                          Pending Admin OK
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenRequest(note)}
                          className="px-3.5 py-1.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Request Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Request Download Modal */}
          {requestModalNote && (
            <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in border border-slate-200">
                <div className="flex items-center justify-between pb-3 mb-4 border-b">
                  <div className="flex items-center gap-2 text-[#0f2942]">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-base text-slate-900">Request PDF Download</h3>
                  </div>
                  <button
                    onClick={() => setRequestModalNote(null)}
                    className="text-slate-400 hover:text-slate-700 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4 p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                  <div className="font-bold text-slate-800">{requestModalNote.title}</div>
                  <div className="text-slate-500 font-medium">Category: {requestModalNote.category}</div>
                </div>

                {reqMessage ? (
                  <div className="space-y-4 text-center py-2">
                    <div className="p-3 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                      {reqMessage}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      This request has been logged on the <strong>Admin Portal</strong> as <strong>PENDING</strong>. As soon as the Admin clicks <strong>OK / Approve</strong>, your download button will turn green and active!
                    </p>
                    <button
                      onClick={() => setRequestModalNote(null)}
                      className="w-full py-2 bg-[#0f2942] text-white rounded-lg text-xs font-bold"
                    >
                      Close &amp; Check Status
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitDownloadRequest} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-3 py-2 border rounded-lg font-medium bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Mobile Number (10 digits) *
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={reqMobile}
                        onChange={(e) => setReqMobile(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2 border rounded-lg font-mono font-medium bg-slate-50 focus:bg-white"
                      />
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Admin will receive your name and number to verify and approve your download access.
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRequestModalNote(null)}
                        className="px-4 py-2 border rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReq}
                        className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        {submittingReq ? 'Submitting...' : 'Submit Request to Admin'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {previewCert && (
        <CertificateDocument
          certificate={previewCert}
          settings={settings}
          studentPhoto={student.photoUrl}
          isModal={true}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* Marksheet Modal */}
      {previewMark && (
        <MarksheetDocument
          marksheet={previewMark}
          settings={settings}
          studentPhoto={student.photoUrl}
          isModal={true}
          onClose={() => setPreviewMark(null)}
        />
      )}

      {/* Change Password Modal */}
      {isPwdModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Change Student Account Password</h3>
              </div>
              <button
                onClick={() => setIsPwdModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwdSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Success!</h4>
                <p className="text-xs text-slate-700">{pwdSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3.5">
                {pwdError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{pwdError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Password (If known)
                  </label>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPwdModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPwd}
                    className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {changingPwd ? 'Updating...' : 'Save New Password'}
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
