import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { InstituteSettings, Course, Student, MarksRecord, Franchise } from '../types/index.ts';
import { CertificateDocument } from './CertificateDocument.tsx';
import { MarksheetDocument } from './MarksheetDocument.tsx';
import { PhotoUploader } from './PhotoUploader.tsx';
import {
  Building2,
  Users,
  FileCheck,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Lock,
  Printer,
  User,
  KeyRound,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Props {
  settings: InstituteSettings;
  franchiseId?: string;
}

export const FranchisePortal: React.FC<Props> = ({ settings, franchiseId = 'fran-02' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'add-student' | 'marks-entry' | 'approved-docs'>('overview');
  const [data, setData] = useState<{
    franchise: Franchise;
    students: Student[];
    marks: MarksRecord[];
    approvedCertificates: any[];
    approvedMarksheets: any[];
    courses: Course[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '2004-01-01',
    gender: 'Male',
    mobile: '',
    email: '',
    address: '',
    courseId: 'course-adca',
    photoUrl: '',
  });

  // Marks Entry Form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [marksSubjects, setMarksSubjects] = useState<any[]>([]);

  // Preview Modals
  const [previewCert, setPreviewCert] = useState<any | null>(null);
  const [previewMark, setPreviewMark] = useState<any | null>(null);

  // Password Change State
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [changingPwd, setChangingPwd] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
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
        referenceId: data?.franchise?.id,
        currentPassword: currentPwd,
        newPassword: newPwd,
        role: 'franchise',
      });
      if (res.success) {
        setPwdSuccess('Center password updated successfully!');
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

  const loadFranchiseData = async () => {
    setLoading(true);
    try {
      const res = await api.getFranchiseData(franchiseId);
      setData(res);
      if (res.students && res.students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(res.students[0].id);
      }
    } catch (e) {
      showToast('Error loading franchise portal data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFranchiseData();
  }, [franchiseId]);

  // Update marks entry subject list whenever selected student changes
  useEffect(() => {
    if (!data || !selectedStudentId) return;
    const student = data.students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const course = data.courses.find((c) => c.id === student.courseId);
    if (!course) return;

    // Check if marks already exist
    const existing = data.marks.find((m) => m.studentId === student.id);
    if (existing && existing.subjects) {
      setMarksSubjects(existing.subjects);
    } else {
      const initial = course.subjects.map((s) => ({
        subjectName: s.name,
        maxMarks: s.maxMarks,
        minMarks: s.minMarks,
        theoryMarks: 60,
        practicalMarks: 25,
        internalMarks: 8,
        obtainedMarks: 93,
      }));
      setMarksSubjects(initial);
    }
  }, [selectedStudentId, data]);

  // Handle Add Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addFranchiseStudent({
        ...newStudent,
        franchiseId,
      });
      if (res.success) {
        showToast(`Student ${res.student.fullName} added successfully (${res.student.enrollmentNumber})!`);
        setNewStudent({
          fullName: '',
          fatherName: '',
          motherName: '',
          dob: '2004-01-01',
          gender: 'Male',
          mobile: '',
          email: '',
          address: '',
          courseId: 'course-adca',
          photoUrl: '',
        });
        loadFranchiseData();
        setActiveTab('students');
      }
    } catch (e) {
      showToast('Failed to add student.', 'error');
    }
  };

  // Handle Marks Submit for Admin Verification
  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || marksSubjects.length === 0) return;

    try {
      const res = await api.submitFranchiseMarks({
        studentId: selectedStudentId,
        subjects: marksSubjects,
        franchiseCode: data?.franchise.centerCode,
      });

      if (res.success) {
        showToast(
          'Marks successfully submitted! Status is now PENDING ADMIN VERIFICATION. Document generation is locked until Admin approval.'
        );
        loadFranchiseData();
        setActiveTab('students');
      }
    } catch (e) {
      showToast('Error submitting marks for verification.', 'error');
    }
  };

  const handleSubjectMarkChange = (index: number, field: string, value: number) => {
    const updated = [...marksSubjects];
    updated[index][field] = value;
    const theory = Number(updated[index].theoryMarks) || 0;
    const practical = Number(updated[index].practicalMarks) || 0;
    const internal = Number(updated[index].internalMarks) || 0;
    updated[index].obtainedMarks = theory + practical + internal;
    setMarksSubjects(updated);
  };

  if (!data) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mb-2" />
        <div>Loading Authorized Center Portal...</div>
      </div>
    );
  }

  const { franchise, students, marks, approvedCertificates, approvedMarksheets } = data;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0f2942] text-white shrink-0 p-4 border-r border-[#1a3d60]">
        <div className="pb-4 mb-4 border-b border-[#1a3d60]">
          <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
            {franchise.centerCode}
          </span>
          <h2 className="font-bold text-sm text-white mt-1 leading-tight">
            {franchise.centerName}
          </h2>
          <div className="text-xs text-slate-300 font-medium">Head: {franchise.ownerName}</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-1">● Authorized Study Center</div>
        </div>

        <nav className="space-y-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <Building2 className="w-4 h-4" /> Center Dashboard
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'students' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4" /> Center Students
            </span>
            <span className="font-mono font-bold text-[10px]">{students.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('add-student')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'add-student' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Add New Student
          </button>

          <button
            onClick={() => setActiveTab('marks-entry')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'marks-entry' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Enter Student Marks
          </button>

          <button
            onClick={() => setActiveTab('approved-docs')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'approved-docs' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Download className="w-4 h-4" /> Approved Documents
            </span>
            <span className="font-mono font-bold text-[10px] text-emerald-300">
              {approvedCertificates.length}
            </span>
          </button>

          <div className="pt-3 border-t border-[#1a3d60] mt-3">
            <button
              onClick={() => {
                setIsPwdModalOpen(true);
                setPwdError(null);
                setPwdSuccess(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-amber-300 hover:bg-[#1a3d60] border border-amber-500/20 cursor-pointer text-xs"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Change Password</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-6 overflow-y-auto">
        {feedback && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs font-semibold shadow-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Franchise Center Operations</h1>
              <p className="text-xs text-slate-500">
                Official branch portal for {franchise.centerName} ({franchise.centerCode})
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Center Students</span>
                <div className="text-2xl font-extrabold text-[#0f2942] mt-1">{students.length}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/50">
                <span className="text-[10px] text-amber-800 font-bold uppercase">Pending Verification</span>
                <div className="text-2xl font-extrabold text-amber-700 mt-1">
                  {marks.filter((m) => m.status === 'PENDING_ADMIN_VERIFICATION').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/50">
                <span className="text-[10px] text-emerald-800 font-bold uppercase">Approved Marks</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {marks.filter((m) => m.status === 'APPROVED').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/50">
                <span className="text-[10px] text-blue-800 font-bold uppercase">Approved Certificates</span>
                <div className="text-2xl font-extrabold text-blue-800 mt-1">
                  {approvedCertificates.length}
                </div>
              </div>
            </div>

            {/* Policy Enforcement Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sm text-amber-950">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Strict Examination Board Workflow Notice</span>
              </div>
              <p className="leading-relaxed">
                As an authorized franchise, you can submit student marks for verification.
                <strong>
                  {' '}Franchises cannot approve their own marks or generate certificates.
                </strong>{' '}
                All submitted marks remain in <em>PENDING ADMIN VERIFICATION</em> until Director Mr. Amar Soni
                and the examination authority review and grant final approval.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: STUDENTS ROSTER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Enrolled Students at {franchise.centerCode}</h2>
                <p className="text-xs text-slate-500">
                  Track admission and academic verification progress
                </p>
              </div>
              <button
                onClick={() => setActiveTab('add-student')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2942] text-white text-xs font-semibold rounded hover:bg-[#1a3d60]"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Student
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="p-3">Photo</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Enrollment / Reg No</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Admission</th>
                    <th className="p-3">Academic Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((stu) => {
                    const studentMarks = marks.find((m) => m.studentId === stu.id);
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          {stu.photoUrl ? (
                            <img
                              src={stu.photoUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{stu.fullName}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {stu.enrollmentNumber}
                        </td>
                        <td className="p-3 text-slate-800">{stu.courseName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {stu.admissionStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              studentMarks?.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : studentMarks?.status === 'PENDING_ADMIN_VERIFICATION'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {studentMarks?.status ? studentMarks.status.replace(/_/g, ' ') : 'MARKS PENDING'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentId(stu.id);
                              setActiveTab('marks-entry');
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded font-semibold text-[11px] hover:bg-blue-100"
                          >
                            {studentMarks ? 'Edit / View Marks' : 'Enter Marks'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ADD NEW STUDENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'add-student' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Register New Student</h2>
              <p className="text-xs text-slate-500">
                Enrolls candidate directly under franchise center: {franchise.centerName}
              </p>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.fullName}
                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                    placeholder="e.g. Rakesh Kumar"
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.fatherName}
                    onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                    placeholder="e.g. Shri Surendra Kumar"
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={newStudent.motherName}
                    onChange={(e) => setNewStudent({ ...newStudent, motherName: e.target.value })}
                    placeholder="e.g. Smt. Asha Devi"
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={newStudent.dob}
                    onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudent.mobile}
                    onChange={(e) => setNewStudent({ ...newStudent, mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Course *
                  </label>
                  <select
                    value={newStudent.courseId}
                    onChange={(e) => setNewStudent({ ...newStudent, courseId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50"
                  >
                    {data.courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.duration})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Passport Photo Upload */}
              <div className="pt-1">
                <PhotoUploader
                  photoUrl={newStudent.photoUrl}
                  onChange={(url) => setNewStudent({ ...newStudent, photoUrl: url })}
                  required={true}
                  label="Student Passport Photograph (Required for Official Certificate)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={newStudent.address}
                  onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  placeholder="Village/Mohalla, Post, Ayodhya, UP"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0f2942] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d60]"
                >
                  Confirm &amp; Register Student
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: MARKS ENTRY SYSTEM */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'marks-entry' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Academic Marks Entry Gateway</h2>
              <p className="text-xs text-slate-500">
                Input Theory, Practical, and Internal scores, then submit for Admin examination review.
              </p>
            </div>

            {/* Student Selector */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
              <label className="text-xs font-bold text-slate-700">Select Student:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 border rounded-lg text-xs font-semibold bg-slate-50 flex-1 max-w-md"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.enrollmentNumber}) — {s.courseName}
                  </option>
                ))}
              </select>
            </div>

            {/* Marks Matrix Form */}
            {selectedStudentId && marksSubjects.length > 0 && (
              <form onSubmit={handleSubmitMarks} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0f2942] text-white font-semibold text-center">
                      <tr>
                        <th className="p-2.5 text-left">Subject Description</th>
                        <th className="p-2.5 w-20">Max</th>
                        <th className="p-2.5 w-20">Min</th>
                        <th className="p-2.5 w-28">Theory</th>
                        <th className="p-2.5 w-28">Practical</th>
                        <th className="p-2.5 w-28">Internal</th>
                        <th className="p-2.5 w-24">Obtained</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {marksSubjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">{sub.subjectName}</td>
                          <td className="p-2.5 text-center font-mono text-slate-600">{sub.maxMarks}</td>
                          <td className="p-2.5 text-center font-mono text-slate-600">{sub.minMarks}</td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={sub.theoryMarks}
                              onChange={(e) =>
                                handleSubjectMarkChange(idx, 'theoryMarks', Number(e.target.value))
                              }
                              className="w-20 px-2 py-1 border rounded text-center font-mono font-semibold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={sub.practicalMarks}
                              onChange={(e) =>
                                handleSubjectMarkChange(idx, 'practicalMarks', Number(e.target.value))
                              }
                              className="w-20 px-2 py-1 border rounded text-center font-mono font-semibold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={sub.internalMarks}
                              onChange={(e) =>
                                handleSubjectMarkChange(idx, 'internalMarks', Number(e.target.value))
                              }
                              className="w-20 px-2 py-1 border rounded text-center font-mono font-semibold"
                            />
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-blue-900 bg-amber-50/50">
                            {sub.obtainedMarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Submit Action Strip */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Calculated Aggregate: <strong>
                      {marksSubjects.reduce((acc, s) => acc + (Number(s.obtainedMarks) || 0), 0)} /{' '}
                      {marksSubjects.reduce((acc, s) => acc + (Number(s.maxMarks) || 100), 0)}
                    </strong>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> SUBMIT FOR ADMIN VERIFICATION
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: APPROVED DOCUMENTS & DOWNLOAD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'approved-docs' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Approved Official Documents</h2>
              <p className="text-xs text-slate-500">
                Official certificates and marksheets approved by Advance Institute of Digital Technology Director Amar Soni
              </p>
            </div>

            {approvedCertificates.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-500">
                No approved documents ready for download yet. Documents appear here once approved by Admin.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedCertificates.map((cert) => (
                  <div key={cert.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                          {cert.certificateNumber}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{cert.studentName}</h3>
                        <p className="text-xs text-slate-600">{cert.courseName}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        APPROVED
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex justify-between border-t pt-2 font-mono">
                      <span>Enrollment: {cert.enrollmentNumber}</span>
                      <span>Grade: {cert.grade}</span>
                    </div>

                    <div className="pt-2 border-t flex justify-end gap-2">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2942] text-white text-xs font-semibold rounded hover:bg-[#1a3d60]"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Certificate Modal */}
      {previewCert && (
        <CertificateDocument
          certificate={previewCert}
          settings={settings}
          isModal={true}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* Marksheet Modal */}
      {previewMark && (
        <MarksheetDocument
          marksheet={previewMark}
          settings={settings}
          isModal={true}
          onClose={() => setPreviewMark(null)}
        />
      )}

      {/* Change Center Password Modal */}
      {isPwdModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Change Franchise Center Password</h3>
              </div>
              <button
                onClick={() => setIsPwdModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
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
                    placeholder="Enter current center password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Center Password *
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
                    {changingPwd ? 'Updating...' : 'Save Center Password'}
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
