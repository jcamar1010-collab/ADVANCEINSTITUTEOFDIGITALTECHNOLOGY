import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import {
  InstituteSettings,
  Course,
  Student,
  MarksRecord,
  CertificateRecord,
  MarksheetRecord,
  Franchise,
  AuditLog,
  CertificateTemplateConfig,
  MarksheetTemplateConfig,
  NoticeItem,
} from '../types/index.ts';
import { CertificateDocument } from './CertificateDocument.tsx';
import { MarksheetDocument } from './MarksheetDocument.tsx';
import { DigitalSignaturePad } from './DigitalSignaturePad.tsx';
import { PhotoUploader } from './PhotoUploader.tsx';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileCheck,
  Award,
  FileSpreadsheet,
  Palette,
  Settings,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  PenTool,
  Type,
  Image as ImageIcon,
  Megaphone,
  Flame,
  Clock,
  Upload,
} from 'lucide-react';

interface Props {
  settings: InstituteSettings;
  onSettingsUpdate: (settings: InstituteSettings) => void;
}

export const AdminPortal: React.FC<Props> = ({ settings, onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'admissions'
    | 'franchises'
    | 'marks'
    | 'certificates'
    | 'marksheets'
    | 'templates'
    | 'signatures'
    | 'notices'
    | 'settings'
    | 'audit-logs'
  >('dashboard');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marksList, setMarksList] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [templates, setTemplates] = useState<{
    certificateTemplates: CertificateTemplateConfig[];
    marksheetTemplates: MarksheetTemplateConfig[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Notice Form State
  const [newNoticeForm, setNewNoticeForm] = useState({
    title: '',
    content: '',
    linkText: '',
    linkUrl: 'admission',
    priority: 'normal' as 'normal' | 'urgent' | 'highlight',
    isActive: true,
  });
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // Preview Modals
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [previewMark, setPreviewMark] = useState<MarksheetRecord | null>(null);

  // Revoke Dialog
  const [revokeDialog, setRevokeDialog] = useState<{
    type: 'certificate' | 'marksheet';
    id: string;
    number: string;
    isOpen: boolean;
  }>({ type: 'certificate', id: '', number: '', isOpen: false });
  const [revokeReason, setRevokeReason] = useState('');

  // Editable settings form
  const [editSettings, setEditSettings] = useState<InstituteSettings>(settings);

  // Template edit state
  const [editCertTemplate, setEditCertTemplate] = useState<CertificateTemplateConfig | null>(null);
  const [editMarksheetTemplate, setEditMarksheetTemplate] = useState<MarksheetTemplateConfig | null>(null);
  const [templateTab, setTemplateTab] = useState<'certificate' | 'marksheet'>('certificate');

  // Student Photo Edit Modal
  const [photoEditStudent, setPhotoEditStudent] = useState<Student | null>(null);
  const [photoEditUrl, setPhotoEditUrl] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dash, stuList, mList, franList, logs, tmpls, ntsList] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminStudents(),
        api.getAdminMarks(),
        api.getFranchises(),
        api.getAuditLogs(),
        api.getTemplates(),
        api.getNotices(),
      ]);

      setDashboardData(dash);
      setStudents(stuList);
      setMarksList(mList);
      setFranchises(franList);
      setAuditLogs(logs);
      setTemplates(tmpls);
      if (ntsList) setNoticesList(ntsList);
      if (tmpls.certificateTemplates && tmpls.certificateTemplates[0]) {
        setEditCertTemplate(tmpls.certificateTemplates[0]);
      }
      if (tmpls.marksheetTemplates && tmpls.marksheetTemplates[0]) {
        setEditMarksheetTemplate(tmpls.marksheetTemplates[0]);
      }
    } catch (err) {
      showToast('Error loading administrative data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Notice Board Operations
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeForm.title.trim() || !newNoticeForm.content.trim()) {
      showToast('Notice Title and Content are required.', 'error');
      return;
    }
    try {
      const res = await api.addNotice(newNoticeForm);
      if (res.success) {
        showToast('Notice published successfully to the website.');
        setNewNoticeForm({
          title: '',
          content: '',
          linkText: '',
          linkUrl: 'admission',
          priority: 'normal',
          isActive: true,
        });
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to create notice.', 'error');
    }
  };

  const handleUpdateNotice = async (id: string, updates: Partial<NoticeItem>) => {
    try {
      const res = await api.updateNotice(id, updates);
      if (res.success) {
        showToast('Notice updated successfully.');
        setEditingNoticeId(null);
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to update notice.', 'error');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this notice?')) return;
    try {
      const res = await api.deleteNotice(id);
      if (res.success) {
        showToast('Notice deleted.');
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to delete notice.', 'error');
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Admission Approval
  const handleAdmissionReview = async (studentId: string, status: string) => {
    try {
      const res = await api.reviewAdmission(studentId, status);
      if (res.success) {
        showToast(`Admission for student marked as ${status}.`);
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to update admission status.', 'error');
    }
  };

  // Handle Marks Approval / Rejection
  const handleMarksReview = async (
    marksId: string,
    action: 'APPROVE' | 'REJECT' | 'RETURN_FOR_CORRECTION',
    remarks?: string
  ) => {
    try {
      const res = await api.reviewMarks(marksId, action, remarks);
      if (res.success) {
        showToast(
          action === 'APPROVE'
            ? 'Marks Approved! Official Marksheet & Certificate can now be generated.'
            : `Marks record marked as ${action}.`
        );
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to review marks record.', 'error');
    }
  };

  // Generate Certificate
  const handleGenerateCertificate = async (studentId: string) => {
    try {
      const res = await api.generateCertificate(studentId);
      if (res.success) {
        showToast(`Certificate ${res.certificate.certificateNumber} generated and published!`);
        setPreviewCert(res.certificate);
        loadAllData();
      } else {
        showToast(res.error || 'Failed to generate certificate.', 'error');
      }
    } catch (e) {
      showToast('Error during certificate generation.', 'error');
    }
  };

  // Generate Marksheet
  const handleGenerateMarksheet = async (studentId: string) => {
    try {
      const res = await api.generateMarksheet(studentId);
      if (res.success) {
        showToast(`Marksheet ${res.marksheet.marksheetNumber} generated and published!`);
        setPreviewMark(res.marksheet);
        loadAllData();
      } else {
        showToast(res.error || 'Failed to generate marksheet.', 'error');
      }
    } catch (e) {
      showToast('Error during marksheet generation.', 'error');
    }
  };

  // Revoke Document
  const handleConfirmRevoke = async () => {
    if (!revokeReason.trim()) {
      showToast('Please state a reason for revocation.', 'error');
      return;
    }
    try {
      const res = await api.revokeDocument(revokeDialog.type, revokeDialog.id, revokeReason);
      if (res.success) {
        showToast(`Document ${revokeDialog.number} REVOKED successfully.`);
        setRevokeDialog({ ...revokeDialog, isOpen: false });
        setRevokeReason('');
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to revoke document.', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(editSettings);
      if (res.success) {
        onSettingsUpdate(res.settings);
        showToast('Institute settings and branding updated successfully!');
      }
    } catch (e) {
      showToast('Failed to save settings.', 'error');
    }
  };

  // Save Certificate Template
  const handleSaveCertTemplate = async () => {
    if (!editCertTemplate) return;
    try {
      const res = await api.updateCertTemplate(editCertTemplate);
      if (res.success) {
        showToast(`Certificate Template updated to Version ${res.template.version}`);
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to update template.', 'error');
    }
  };

  // Save Marksheet Template
  const handleSaveMarksheetTemplate = async () => {
    if (!editMarksheetTemplate) return;
    try {
      const res = await api.updateMarksheetTemplate(editMarksheetTemplate);
      if (res.success) {
        showToast(`Marksheet Template updated to Version ${res.template.version}`);
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to update marksheet template.', 'error');
    }
  };

  // Save Director Signature (Drawn or Uploaded)
  const handleSaveDirectorSignature = async (dataUrl: string) => {
    const updated = { ...editSettings, directorSignatureUrl: dataUrl };
    setEditSettings(updated);
    try {
      const res = await api.updateSettings(updated);
      if (res.success) {
        onSettingsUpdate(res.settings);
        showToast('Director digital signature updated successfully and applied to documents!');
      }
    } catch (e) {
      showToast('Failed to update signature.', 'error');
    }
  };

  // Save Institute Official Stamp / Seal
  const handleSaveInstituteStamp = async (dataUrl: string) => {
    const updated = { ...editSettings, instituteStampUrl: dataUrl };
    setEditSettings(updated);
    try {
      const res = await api.updateSettings(updated);
      if (res.success) {
        onSettingsUpdate(res.settings);
        showToast('Official Institute Seal updated successfully and applied to documents!');
      }
    } catch (e) {
      showToast('Failed to update official seal.', 'error');
    }
  };

  // Save Student Photo from Admin
  const handleSaveStudentPhoto = async () => {
    if (!photoEditStudent || !photoEditUrl) return;
    try {
      const res = await api.updateStudentPhoto(photoEditStudent.id, photoEditUrl);
      if (res.success) {
        showToast(`Student photo updated for ${photoEditStudent.fullName}!`);
        setPhotoEditStudent(null);
        setPhotoEditUrl('');
        loadAllData();
      }
    } catch (e) {
      showToast('Failed to update student photo.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0f2942] text-white shrink-0 p-4 border-r border-[#1a3d60]">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#1a3d60]">
          <img src={settings.logoUrl || '/logo.svg'} alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-amber-400">
              Admin Portal
            </h2>
            <div className="text-sm font-semibold text-white leading-tight">
              {settings.directorName}
            </div>
            <div className="text-[10px] text-slate-300">Director &amp; Founder</div>
          </div>
        </div>

        <nav className="space-y-1 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
          </button>

          <button
            onClick={() => setActiveTab('admissions')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'admissions' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4" /> Student Admissions
            </span>
            {dashboardData?.pendingAdmissions > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 font-bold rounded-full text-[10px]">
                {dashboardData.pendingAdmissions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('marks')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'marks' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4" /> Marks Verification
            </span>
            {dashboardData?.pendingMarks > 0 && (
              <span className="px-1.5 py-0.5 bg-red-400 text-slate-900 font-bold rounded-full text-[10px]">
                {dashboardData.pendingMarks}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'certificates' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <Award className="w-4 h-4" /> Certificate Management
          </button>

          <button
            onClick={() => setActiveTab('marksheets')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'marksheets' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Marksheet Management
          </button>

          <button
            onClick={() => setActiveTab('franchises')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'franchises' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <Building2 className="w-4 h-4" /> Franchise Centers
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'templates' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <Palette className="w-4 h-4" /> Document Templates &amp; Text
          </button>

          <button
            onClick={() => setActiveTab('signatures')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'signatures' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <PenTool className="w-4 h-4" /> Signatures &amp; Seals
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'notices' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Megaphone className="w-4 h-4" /> Notice Board &amp; Ticker
            </span>
            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 font-bold rounded-full text-[10px]">
              {noticesList.filter((n) => n.isActive).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <Settings className="w-4 h-4" /> Institute Settings
          </button>

          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'audit-logs' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Security Audit Log
          </button>
        </nav>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Notification Toast */}
        {feedback && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-slate-500 hover:text-slate-800">
              ✕
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
                <p className="text-xs text-slate-500">
                  Real-time operational metrics for Advance Institute of Digital Technology
                </p>
              </div>
              <button
                onClick={loadAllData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Students</span>
                <div className="text-2xl font-extrabold text-[#0f2942] mt-1">{dashboardData.totalStudents}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/40">
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">Pending Admissions</span>
                <div className="text-2xl font-extrabold text-amber-700 mt-1">{dashboardData.pendingAdmissions}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs bg-red-50/40">
                <span className="text-[10px] text-red-700 uppercase font-bold tracking-wider">Pending Marks</span>
                <div className="text-2xl font-extrabold text-red-700 mt-1">{dashboardData.pendingMarks}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/40">
                <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Approved Certs</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">{dashboardData.approvedCertificates}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/40">
                <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider">Approved Marks</span>
                <div className="text-2xl font-extrabold text-blue-700 mt-1">{dashboardData.approvedMarksheets}</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Centers</span>
                <div className="text-2xl font-extrabold text-slate-800 mt-1">{dashboardData.activeFranchises}</div>
              </div>
            </div>

            {/* Quick Action Alerts & Workflow Notice */}
            <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-blue-950 mb-0.5">
                  Institutional Security &amp; Approval Mandate (Active)
                </h4>
                <p className="leading-relaxed">
                  Every marksheet and certificate follows the strict 7-stage pipeline:
                  <strong> Draft → Submitted → Pending Admin Verification → Admin Approved → Generated → Published → Downloadable</strong>.
                  Neither Franchise nor Student can publish or download official records prior to your explicit verification.
                </p>
              </div>
            </div>

            {/* Recent Students Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">Recent Student Admissions</h3>
                <button
                  onClick={() => setActiveTab('admissions')}
                  className="text-xs text-blue-800 font-semibold hover:underline"
                >
                  View All Students →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Enrollment / Reg No</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Center</th>
                      <th className="p-3">Admission</th>
                      <th className="p-3">Academic State</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.slice(0, 5).map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{stu.fullName}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {stu.enrollmentNumber}
                        </td>
                        <td className="p-3 text-slate-700">{stu.courseName}</td>
                        <td className="p-3 text-slate-600">{stu.franchiseCode}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              stu.admissionStatus === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : stu.admissionStatus === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {stu.admissionStatus}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">
                          {stu.academicStatus}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setActiveTab('admissions')}
                            className="text-blue-800 hover:text-blue-900 font-semibold text-[11px]"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: ADMISSIONS MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'admissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Student Admissions Roster</h2>
                <p className="text-xs text-slate-500">
                  Verify applicant identity and assign approved enrollment status
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-3">Photo</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Father's Name</th>
                      <th className="p-3">Registration &amp; Enrollment</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <img
                            src={stu.photoUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        </td>
                        <td className="p-3 font-bold text-slate-900">{stu.fullName}</td>
                        <td className="p-3 text-slate-600">{stu.fatherName}</td>
                        <td className="p-3 font-mono text-[11px]">
                          <div>{stu.registrationNumber}</div>
                          <div className="text-slate-500 text-[10px]">{stu.enrollmentNumber}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{stu.courseName}</td>
                        <td className="p-3 text-slate-600">{stu.mobile}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              stu.admissionStatus === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : stu.admissionStatus === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {stu.admissionStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoEditStudent(stu);
                              setPhotoEditUrl(stu.photoUrl);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                            title="Update Student Passport Photo"
                          >
                            📷 Photo
                          </button>
                          {stu.admissionStatus !== 'Approved' && (
                            <button
                              onClick={() => handleAdmissionReview(stu.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded text-[11px] hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          )}
                          {stu.admissionStatus !== 'Rejected' && (
                            <button
                              onClick={() => handleAdmissionReview(stu.id, 'Rejected')}
                              className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 font-semibold rounded text-[11px] hover:bg-red-100"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: MARKS VERIFICATION & APPROVAL WORKFLOW */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'marks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Marks Verification &amp; Approval Gateway
                </h2>
                <p className="text-xs text-slate-500">
                  Review submitted marks by study centers. Documents generate ONLY after Admin approval.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {marksList.length === 0 ? (
                <div className="p-8 bg-white border rounded-xl text-center text-slate-500 text-xs">
                  No marks submissions found.
                </div>
              ) : (
                marksList.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                      <div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Center: {m.franchiseCode || m.submittedBy} • Record ID: {m.id}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          {m.studentName} — {m.courseName}
                        </h3>
                        <div className="text-xs text-slate-600 font-mono">
                          Enrollment: <strong>{m.enrollmentNumber}</strong> | Reg: {m.registrationNumber}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${
                            m.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : m.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {m.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Subject-Wise Matrix */}
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold">
                          <tr>
                            <th className="p-2.5">Subject</th>
                            <th className="p-2.5 text-center">Max Marks</th>
                            <th className="p-2.5 text-center">Theory</th>
                            <th className="p-2.5 text-center">Practical</th>
                            <th className="p-2.5 text-center">Internal</th>
                            <th className="p-2.5 text-center font-bold">Obtained</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {m.subjects.map((sub: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-medium text-slate-800">{sub.subjectName}</td>
                              <td className="p-2.5 text-center text-slate-600">{sub.maxMarks}</td>
                              <td className="p-2.5 text-center text-slate-600">{sub.theoryMarks}</td>
                              <td className="p-2.5 text-center text-slate-600">{sub.practicalMarks}</td>
                              <td className="p-2.5 text-center text-slate-600">{sub.internalMarks}</td>
                              <td className="p-2.5 text-center font-bold text-slate-900 bg-amber-50/40">
                                {sub.obtainedMarks}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-bold">
                            <td className="p-2.5 uppercase text-slate-700">Calculated Totals</td>
                            <td className="p-2.5 text-center">{m.totalMaxMarks}</td>
                            <td colSpan={3} className="p-2.5 text-center text-slate-500">
                              Percentage: {m.percentage}% | Grade: {m.grade}
                            </td>
                            <td className="p-2.5 text-center text-blue-900 text-sm">
                              {m.totalObtainedMarks} ({m.result})
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-slate-500">
                        {m.reviewedBy ? (
                          <span>
                            Reviewed by: <strong>{m.reviewedBy}</strong> on {m.reviewedAt?.split('T')[0]}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold">
                            ⚠️ Awaiting Admin Examination Board Decision
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {m.status !== 'APPROVED' ? (
                          <>
                            <button
                              onClick={() => handleMarksReview(m.id, 'APPROVE')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve Marks
                            </button>
                            <button
                              onClick={() =>
                                handleMarksReview(
                                  m.id,
                                  'RETURN_FOR_CORRECTION',
                                  'Please re-verify practical lab marks'
                                )
                              }
                              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded-lg"
                            >
                              Return for Correction
                            </button>
                            <button
                              onClick={() => handleMarksReview(m.id, 'REJECT', 'Discrepancy in marks')}
                              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-xs font-semibold rounded-lg"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleGenerateMarksheet(m.studentId)}
                              className="px-3 py-1.5 bg-[#1e3a8a] text-white text-xs font-semibold rounded hover:bg-blue-900"
                            >
                              1-Click Generate Marksheet
                            </button>
                            <button
                              onClick={() => handleGenerateCertificate(m.studentId)}
                              className="px-3 py-1.5 bg-[#0f2942] text-white text-xs font-semibold rounded hover:bg-[#1a3d60]"
                            >
                              1-Click Generate Certificate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: CERTIFICATES MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Certificate Registry</h2>
                <p className="text-xs text-slate-500">
                  Approved, sequential certificates issued by Director Amar Soni
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="p-3">Certificate Number</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((stu) => {
                    const cert = stu ? (dashboardData?.recentStudents || []).find((s: any) => s.id === stu.id) : null;
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-amber-900">
                          ACI/CERT/2026/{stu.id === 'stu-01' ? '000001' : 'PENDING'}
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{stu.fullName}</td>
                        <td className="p-3 text-slate-700">{stu.courseName}</td>
                        <td className="p-3 text-slate-600">2026-01-15</td>
                        <td className="p-3 font-bold text-emerald-700">A+ (89.5%)</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              stu.id === 'stu-01'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {stu.id === 'stu-01' ? 'APPROVED' : 'NOT GENERATED'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {stu.id === 'stu-01' ? (
                            <>
                              <button
                                onClick={async () => {
                                  const data = await api.verifyCertificate('ACI/CERT/2026/000001');
                                  if (data.certificate) setPreviewCert(data.certificate);
                                }}
                                className="px-2.5 py-1 bg-[#0f2942] text-white rounded text-[11px] font-semibold hover:bg-[#1a3d60]"
                              >
                                Live Preview
                              </button>
                              <button
                                onClick={() =>
                                  setRevokeDialog({
                                    type: 'certificate',
                                    id: 'cert-01',
                                    number: 'ACI/CERT/2026/000001',
                                    isOpen: true,
                                  })
                                }
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-semibold"
                              >
                                Revoke
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleGenerateCertificate(stu.id)}
                              className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold hover:bg-amber-700"
                            >
                              Generate Certificate
                            </button>
                          )}
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
        {/* TAB 5: MARKSHEETS MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'marksheets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Marksheet Registry</h2>
                <p className="text-xs text-slate-500">
                  Manage official student transcripts with secure QR verification
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="p-3">Marksheet Number</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-900">
                        ACI/MARK/2026/{stu.id === 'stu-01' ? '000001' : 'PENDING'}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{stu.fullName}</td>
                      <td className="p-3 text-slate-700">{stu.courseName}</td>
                      <td className="p-3 text-slate-800">89.5%</td>
                      <td className="p-3 font-bold text-emerald-700">DISTINCTION</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            stu.id === 'stu-01'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {stu.id === 'stu-01' ? 'APPROVED' : 'NOT GENERATED'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {stu.id === 'stu-01' ? (
                          <>
                            <button
                              onClick={async () => {
                                const data = await api.verifyMarksheet('ACI/MARK/2026/000001');
                                if (data.marksheet) setPreviewMark(data.marksheet);
                              }}
                              className="px-2.5 py-1 bg-[#1e3a8a] text-white rounded text-[11px] font-semibold hover:bg-blue-900"
                            >
                              Live Preview
                            </button>
                            <button
                              onClick={() =>
                                setRevokeDialog({
                                  type: 'marksheet',
                                  id: 'mark-01',
                                  number: 'ACI/MARK/2026/000001',
                                  isOpen: true,
                                })
                              }
                              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-semibold"
                            >
                              Revoke
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleGenerateMarksheet(stu.id)}
                            className="px-2.5 py-1 bg-blue-700 text-white rounded text-[11px] font-semibold hover:bg-blue-800"
                          >
                            Generate Marksheet
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: FRANCHISE CENTERS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'franchises' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Franchise Study Centers</h2>
                <p className="text-xs text-slate-500">
                  Authorized affiliate training institutions and center directors
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {franchises.map((f) => (
                <div key={f.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        {f.centerCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{f.centerName}</h3>
                      <p className="text-xs text-slate-600 font-medium">Head: {f.ownerName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {f.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 border-t pt-2">
                    <div>📍 {f.address}, {f.district}, {f.state}</div>
                    <div>📞 {f.mobile} | ✉️ {f.email}</div>
                  </div>

                  <div className="pt-2 border-t flex justify-end gap-2">
                    {f.status !== 'approved' && (
                      <button
                        onClick={async () => {
                          await api.updateFranchiseStatus(f.id, 'approved');
                          showToast(`Center ${f.centerName} approved!`);
                          loadAllData();
                        }}
                        className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700"
                      >
                        Approve Center
                      </button>
                    )}
                    {f.status === 'approved' && (
                      <button
                        onClick={async () => {
                          await api.updateFranchiseStatus(f.id, 'suspended');
                          showToast(`Center ${f.centerName} suspended.`, 'error');
                          loadAllData();
                        }}
                        className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded hover:bg-red-100"
                      >
                        Suspend Center
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 7: DOCUMENT TEMPLATES & TEXT CUSTOMIZER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'templates' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Certificate &amp; Marksheet Text &amp; Watermark Customizer</h2>
                <p className="text-xs text-slate-500">
                  Directly edit document titles, body text citations, and configure the big central background watermark logo.
                </p>
              </div>

              {/* Sub-tab Switcher: Certificate vs Marksheet */}
              <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTemplateTab('certificate')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    templateTab === 'certificate' ? 'bg-[#0f2942] text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  📜 Certificate Template &amp; Wording
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateTab('marksheet')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    templateTab === 'marksheet' ? 'bg-[#1e3a8a] text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  📊 Marksheet Template &amp; Wording
                </button>
              </div>
            </div>

            {/* CERTIFICATE TEMPLATE & TEXT MODE */}
            {templateTab === 'certificate' && editCertTemplate && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Editor Inputs Column (5 cols) */}
                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 max-h-[820px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-amber-700" /> Certificate Text &amp; Wording
                    </span>
                    <button
                      onClick={handleSaveCertTemplate}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Wording
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Certificate Main Title *
                    </label>
                    <input
                      type="text"
                      value={editCertTemplate.certificateTitle}
                      onChange={(e) =>
                        setEditCertTemplate({ ...editCertTemplate, certificateTitle: e.target.value })
                      }
                      placeholder="e.g. Certificate of Proficiency"
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Citation Prefix Text *
                    </label>
                    <input
                      type="text"
                      value={editCertTemplate.certificationText}
                      onChange={(e) =>
                        setEditCertTemplate({ ...editCertTemplate, certificationText: e.target.value })
                      }
                      placeholder="e.g. This is to officially certify that"
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course Completion Citation Wording *
                    </label>
                    <textarea
                      rows={3}
                      value={editCertTemplate.completionText}
                      onChange={(e) =>
                        setEditCertTemplate({ ...editCertTemplate, completionText: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Header Institute Title
                      </label>
                      <input
                        type="text"
                        value={editCertTemplate.headerText}
                        onChange={(e) =>
                          setEditCertTemplate({ ...editCertTemplate, headerText: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Director Title
                      </label>
                      <input
                        type="text"
                        value={editCertTemplate.directorTitle}
                        onChange={(e) =>
                          setEditCertTemplate({ ...editCertTemplate, directorTitle: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sub-Header / Affiliation Notice
                    </label>
                    <input
                      type="text"
                      value={editCertTemplate.subHeaderText}
                      onChange={(e) =>
                        setEditCertTemplate({ ...editCertTemplate, subHeaderText: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs"
                    />
                  </div>

                  {/* Big Background Logo Watermark Customizer */}
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-amber-950 block uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-700" /> Big Background Logo Watermark
                    </span>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Watermark Logo Image URL / Path:
                      </label>
                      <input
                        type="text"
                        value={editCertTemplate.watermarkLogoUrl || '/aidt-logo.svg'}
                        onChange={(e) =>
                          setEditCertTemplate({ ...editCertTemplate, watermarkLogoUrl: e.target.value })
                        }
                        className="w-full px-2.5 py-1 bg-white border rounded text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span>Watermark Diameter:</span>
                          <span className="font-mono">{editCertTemplate.watermarkSize || 450}px</span>
                        </div>
                        <input
                          type="range"
                          min="280"
                          max="600"
                          step="10"
                          value={editCertTemplate.watermarkSize || 450}
                          onChange={(e) =>
                            setEditCertTemplate({
                              ...editCertTemplate,
                              watermarkSize: Number(e.target.value),
                            })
                          }
                          className="w-full accent-amber-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span>Watermark Opacity:</span>
                          <span className="font-mono">
                            {Math.round((editCertTemplate.watermarkOpacity ?? 0.09) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.03"
                          max="0.30"
                          step="0.01"
                          value={editCertTemplate.watermarkOpacity ?? 0.09}
                          onChange={(e) =>
                            setEditCertTemplate({
                              ...editCertTemplate,
                              watermarkOpacity: Number(e.target.value),
                            })
                          }
                          className="w-full accent-amber-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Border and Colors */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Border Frame Style
                      </label>
                      <select
                        value={editCertTemplate.borderStyle}
                        onChange={(e) =>
                          setEditCertTemplate({ ...editCertTemplate, borderStyle: e.target.value as any })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-50 border rounded text-xs"
                      >
                        <option value="ornate-gold">Guilloche Ornate Gold Foil</option>
                        <option value="classic-navy">Institutional Classic Navy</option>
                        <option value="modern-double">Modern Academic Double Rule</option>
                        <option value="royal-crest">Royal Crest Filigree</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={editCertTemplate.themeColor}
                        onChange={(e) =>
                          setEditCertTemplate({ ...editCertTemplate, themeColor: e.target.value })
                        }
                        className="w-full h-8 p-0.5 border rounded bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    <button
                      onClick={handleSaveCertTemplate}
                      className="w-full py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Save Certificate Wording &amp; Watermark (Version {editCertTemplate.version + 1})
                    </button>
                  </div>
                </div>

                {/* Real-Time Live Preview Column (7 cols) */}
                <div className="lg:col-span-7 bg-slate-200 p-4 rounded-xl border border-slate-300 overflow-x-auto flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Live Certificate Visual Preview (Real-Time Synchronized)
                  </div>
                  <div className="scale-[0.68] origin-top w-full">
                    <CertificateDocument
                      certificate={{
                        id: 'sample-preview',
                        certificateNumber: 'AIDT/CERT/2026/SAMPLE',
                        studentId: 'stu-preview',
                        studentName: 'Amit Kumar Verma',
                        fatherName: 'Ram Shanker Verma',
                        courseName: 'Advanced Diploma in Computer Applications',
                        duration: '12 Months',
                        session: '2025-2026',
                        enrollmentNumber: 'AIDT/ENR/2026/000001',
                        registrationNumber: 'AIDT/REG/2026/000001',
                        centerName: 'Advance Institute of Digital Technology Main Campus',
                        issueDate: '2026-01-15',
                        grade: 'A+',
                        percentage: 89.5,
                        status: 'APPROVED',
                        templateVersion: editCertTemplate.version,
                        qrCodeDataUrl: '',
                        qrTargetUrl: '',
                        generatedAt: '',
                      }}
                      settings={settings}
                      template={editCertTemplate}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MARKSHEET TEMPLATE & TEXT MODE */}
            {templateTab === 'marksheet' && editMarksheetTemplate && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 max-h-[820px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-blue-700" /> Marksheet Text &amp; Watermark
                    </span>
                    <button
                      onClick={handleSaveMarksheetTemplate}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Marksheet
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Marksheet Transcript Title *
                    </label>
                    <input
                      type="text"
                      value={editMarksheetTemplate.marksheetTitle}
                      onChange={(e) =>
                        setEditMarksheetTemplate({
                          ...editMarksheetTemplate,
                          marksheetTitle: e.target.value,
                        })
                      }
                      placeholder="e.g. Statement of Marks / Academic Transcript"
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sub-Header / Examination Authority Title *
                    </label>
                    <input
                      type="text"
                      value={editMarksheetTemplate.subHeaderTitle}
                      onChange={(e) =>
                        setEditMarksheetTemplate({
                          ...editMarksheetTemplate,
                          subHeaderTitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Footer Verification Notice *
                    </label>
                    <textarea
                      rows={2}
                      value={editMarksheetTemplate.footerNotice}
                      onChange={(e) =>
                        setEditMarksheetTemplate({
                          ...editMarksheetTemplate,
                          footerNotice: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-800"
                    />
                  </div>

                  {/* Big Background Logo Watermark for Marksheet */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-blue-950 block uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-700" /> Marksheet Big Background Logo Watermark
                    </span>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span>Logo Diameter:</span>
                          <span className="font-mono">{editMarksheetTemplate.watermarkSize || 390}px</span>
                        </div>
                        <input
                          type="range"
                          min="250"
                          max="550"
                          step="10"
                          value={editMarksheetTemplate.watermarkSize || 390}
                          onChange={(e) =>
                            setEditMarksheetTemplate({
                              ...editMarksheetTemplate,
                              watermarkSize: Number(e.target.value),
                            })
                          }
                          className="w-full accent-blue-700"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span>Watermark Opacity:</span>
                          <span className="font-mono">
                            {Math.round((editMarksheetTemplate.watermarkOpacity ?? 0.08) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.03"
                          max="0.30"
                          step="0.01"
                          value={editMarksheetTemplate.watermarkOpacity ?? 0.08}
                          onChange={(e) =>
                            setEditMarksheetTemplate({
                              ...editMarksheetTemplate,
                              watermarkOpacity: Number(e.target.value),
                            })
                          }
                          className="w-full accent-blue-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    <button
                      onClick={handleSaveMarksheetTemplate}
                      className="w-full py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Save Marksheet Wording &amp; Watermark
                    </button>
                  </div>
                </div>

                {/* Real-time Marksheet Preview */}
                <div className="lg:col-span-7 bg-slate-200 p-4 rounded-xl border border-slate-300 overflow-x-auto flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Live Marksheet Visual Preview (Real-Time Synchronized)
                  </div>
                  <div className="scale-[0.62] origin-top w-full">
                    <MarksheetDocument
                      marksheet={{
                        id: 'mark-sample',
                        marksheetNumber: 'AIDT/MARK/2026/SAMPLE',
                        studentId: 'stu-preview',
                        studentName: 'Amit Kumar Verma',
                        fatherName: 'Ram Shanker Verma',
                        motherName: 'Sunita Devi',
                        courseName: 'Advanced Diploma in Computer Applications',
                        duration: '12 Months',
                        session: '2025-2026',
                        enrollmentNumber: 'AIDT/ENR/2026/000001',
                        registrationNumber: 'AIDT/REG/2026/000001',
                        centerName: 'Advance Institute of Digital Technology Main Campus',
                        marksRecordId: 'marks-01',
                        subjects: [
                          { subjectName: 'Computer Fundamentals & OS', maxMarks: 100, minMarks: 40, theoryMarks: 62, practicalMarks: 18, internalMarks: 9, obtainedMarks: 89 },
                          { subjectName: 'Office Automation (Word, Excel, PPT)', maxMarks: 100, minMarks: 40, theoryMarks: 54, practicalMarks: 28, internalMarks: 9, obtainedMarks: 91 },
                          { subjectName: 'Financial Accounting with Tally Prime', maxMarks: 100, minMarks: 40, theoryMarks: 45, practicalMarks: 36, internalMarks: 9, obtainedMarks: 90 },
                          { subjectName: 'Web Designing (HTML, CSS, JS)', maxMarks: 100, minMarks: 40, theoryMarks: 52, practicalMarks: 27, internalMarks: 9, obtainedMarks: 88 },
                        ],
                        totalMax: 400,
                        totalObtained: 358,
                        percentage: 89.5,
                        grade: 'A+',
                        result: 'PASS (DISTINCTION)',
                        issueDate: '2026-01-15',
                        status: 'APPROVED',
                        templateVersion: editMarksheetTemplate.version,
                        qrCodeDataUrl: '',
                        qrTargetUrl: '',
                        generatedAt: '',
                      }}
                      settings={settings}
                      template={editMarksheetTemplate}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 8: DIGITAL SIGNATURES & OFFICIAL SEALS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'signatures' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Digital Signatures &amp; Institutional Stamp Authority
              </h2>
              <p className="text-xs text-slate-500">
                Draw your signature on screen, upload transparent signature images, or configure official institute stamps.
              </p>
            </div>

            <DigitalSignaturePad
              directorSignature={editSettings.directorSignatureUrl}
              onSaveDirectorSignature={handleSaveDirectorSignature}
              instituteStamp={editSettings.instituteStampUrl}
              onSaveInstituteStamp={handleSaveInstituteStamp}
              directorName={editSettings.directorName}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 9: NOTICE BOARD & ANNOUNCEMENTS MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-600" />
                  Website Notice Board &amp; Announcements
                </h2>
                <p className="text-xs text-slate-500">
                  Manage alternating news ticker, urgent alerts, and admission circulars displayed at the top of the Home Page.
                </p>
              </div>
              <button
                onClick={loadAllData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {/* Add / Edit Notice Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{editingNoticeId ? 'Edit Existing Notice' : 'Publish New Notice to Home Page'}</span>
              </h3>

              <form onSubmit={handleCreateNotice} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Notice Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newNoticeForm.title}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                      placeholder="e.g. Special 20% Scholarship on ADCA & Python Courses"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Badge Priority
                    </label>
                    <select
                      value={newNoticeForm.priority}
                      onChange={(e) =>
                        setNewNoticeForm({
                          ...newNoticeForm,
                          priority: e.target.value as 'normal' | 'urgent' | 'highlight',
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    >
                      <option value="urgent">🔴 URGENT (Red Pulse)</option>
                      <option value="highlight">🟡 FEATURED (Gold)</option>
                      <option value="normal">🔵 ANNOUNCEMENT (Blue)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notice Description / Full Message *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newNoticeForm.content}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, content: e.target.value })}
                    placeholder="Enter detailed notice text that will alternate in the top home page marquee..."
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Button / Link Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={newNoticeForm.linkText}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, linkText: e.target.value })}
                      placeholder="e.g. Apply Online / View Details"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Action Destination
                    </label>
                    <select
                      value={newNoticeForm.linkUrl}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, linkUrl: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    >
                      <option value="admission">Open Admission Modal</option>
                      <option value="courses">Scroll to Courses Section</option>
                      <option value="franchise">Open Franchise Affiliation</option>
                      <option value="verify">Go to QR Verification</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newNoticeForm.isActive}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, isActive: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Publish as Active on Website immediately</span>
                  </label>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Publish Notice</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Notices List */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-800">
                Active &amp; Archived Notices ({noticesList.length})
              </h3>

              {noticesList.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-500">
                  No notices published yet. Use the form above to add a notice to the home page ticker.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {noticesList.map((notice) => (
                    <div
                      key={notice.id}
                      className={`p-4 rounded-xl border transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        notice.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-300 opacity-60'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {notice.priority === 'urgent' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold rounded">
                              URGENT
                            </span>
                          )}
                          {notice.priority === 'highlight' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold rounded">
                              FEATURED
                            </span>
                          )}
                          {notice.priority === 'normal' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-semibold rounded">
                              ANNOUNCEMENT
                            </span>
                          )}

                          <span className="font-bold text-sm text-slate-900">{notice.title}</span>

                          {notice.isActive ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                              ● Live on Website
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-semibold rounded-full">
                              ○ Hidden / Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600">{notice.content}</p>

                        {notice.linkText && (
                          <div className="text-[11px] text-amber-700 font-semibold">
                            Link: "{notice.linkText}" &rarr; {notice.linkUrl}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateNotice(notice.id, { isActive: !notice.isActive })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            notice.isActive
                              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {notice.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                          title="Delete notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 10: INSTITUTE BRANDING & SETTINGS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Institute Master Settings</h2>
              <p className="text-xs text-slate-500">
                Authorized identity for Advance Institute of Digital Technology, Director Mr. Amar Soni (MCA, Data Science)
              </p>
            </div>

            {/* Special Offer & Countdown Controls Card */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-amber-950 text-sm">
                    Admission Offer Ticker &amp; 14-Hour Countdown Clock
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={editSettings.offerTickerEnabled !== false}
                    onChange={(e) =>
                      setEditSettings({ ...editSettings, offerTickerEnabled: e.target.checked })
                    }
                    className="rounded text-amber-600"
                  />
                  <span>Show Ticker at Website Top</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Offer Headline Text
                </label>
                <input
                  type="text"
                  value={editSettings.offerTickerText || ''}
                  onChange={(e) =>
                    setEditSettings({ ...editSettings, offerTickerText: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-amber-800">
                  Active countdown clock displays 14 hours and remains synced across visitors and logins.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('aidt_offer_deadline_v1', (Date.now() + 14 * 60 * 60 * 1000).toString());
                    showToast('14-Hour Countdown Clock has been reset to full 14 hours!');
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 14h Clock</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institute Name *
                  </label>
                  <input
                    type="text"
                    value={editSettings.instituteName}
                    onChange={(e) => setEditSettings({ ...editSettings, instituteName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Director &amp; Founder Name *
                  </label>
                  <input
                    type="text"
                    value={editSettings.directorName}
                    onChange={(e) => setEditSettings({ ...editSettings, directorName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Director Academic Qualification *
                  </label>
                  <input
                    type="text"
                    value={editSettings.directorQualification}
                    onChange={(e) =>
                      setEditSettings({ ...editSettings, directorQualification: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Contact Numbers *
                  </label>
                  <input
                    type="text"
                    value={editSettings.mobile}
                    onChange={(e) => setEditSettings({ ...editSettings, mobile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    value={editSettings.email}
                    onChange={(e) => setEditSettings({ ...editSettings, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Authorized Domain URL
                  </label>
                  <input
                    type="text"
                    value={editSettings.website}
                    onChange={(e) => setEditSettings({ ...editSettings, website: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ayodhya Cantt Registered Address *
                </label>
                <textarea
                  rows={2}
                  value={editSettings.address}
                  onChange={(e) => setEditSettings({ ...editSettings, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              {/* Graphic Assets Controls */}
              <div className="pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {/* Director Desk Picture (from PHOOT.png) */}
                <div className="p-3 border rounded-lg bg-slate-50 flex flex-col justify-between items-center">
                  <div className="w-16 h-20 rounded-lg overflow-hidden border border-amber-400 bg-black/30 mb-1 flex items-center justify-center">
                    <img
                      src={editSettings.directorPhotoUrl || '/director-amar-soni.svg'}
                      alt="Director"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/director-amar-soni.svg';
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 block">Director Photo</span>
                  <label className="mt-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-bold cursor-pointer transition-colors">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            setEditSettings((prev) => ({ ...prev, directorPhotoUrl: dataUrl }));
                            showToast('Director photo updated. Click Save Master Branding to keep.');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="p-3 border rounded-lg bg-slate-50 flex flex-col justify-between items-center">
                  <img src={editSettings.logoUrl} alt="Logo" className="w-12 h-12 mx-auto object-contain mb-1" />
                  <span className="text-[11px] font-bold text-slate-700 block">Institute Logo</span>
                  <span className="text-[9px] text-slate-500">Vector SVG</span>
                </div>

                <div className="p-3 border rounded-lg bg-slate-50 flex flex-col justify-between items-center">
                  <img src={editSettings.instituteStampUrl} alt="Seal" className="w-12 h-12 mx-auto object-contain mb-1" />
                  <span className="text-[11px] font-bold text-slate-700 block">Official Seal</span>
                  <span className="text-[9px] text-slate-500">Circular Stamp</span>
                </div>

                <div className="p-3 border rounded-lg bg-slate-50 flex flex-col justify-between items-center">
                  <img
                    src={editSettings.directorSignatureUrl}
                    alt="Signature"
                    className="h-8 mx-auto object-contain mb-1"
                  />
                  <span className="text-[11px] font-bold text-slate-700 block">Director Signature</span>
                  <span className="text-[9px] text-slate-500">Transparent PNG</span>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0f2942] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d60] transition-colors cursor-pointer"
                >
                  Save Master Branding
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 9: SECURITY AUDIT LOGS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'audit-logs' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">System Security Audit Log</h2>
              <p className="text-xs text-slate-500">
                Chronological immutable record of document generation, approvals, edits and revocations
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User &amp; Role</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800">{log.userEmail}</span>
                        <span className="ml-1 text-[10px] text-slate-500 uppercase">({log.userRole})</span>
                      </td>
                      <td className="p-3 font-bold text-blue-900">{log.action}</td>
                      <td className="p-3 text-slate-700">{log.entity}</td>
                      <td className="p-3 text-slate-600 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Revoke Document Modal */}
      {revokeDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-900">Revoke Official Document</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to permanently revoke <strong>{revokeDialog.number}</strong>?
              Public verification will immediately show "DOCUMENT REVOKED".
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Revocation Reason *
              </label>
              <textarea
                rows={3}
                required
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Document cancelled due to administrative discrepancy or re-examination..."
                className="w-full p-2 border rounded text-xs bg-slate-50"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevokeDialog({ ...revokeDialog, isOpen: false })}
                className="px-4 py-1.5 text-xs text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Certificate Modal */}
      {previewCert && (
        <CertificateDocument
          certificate={previewCert}
          settings={settings}
          isModal={true}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* Live Marksheet Modal */}
      {previewMark && (
        <MarksheetDocument
          marksheet={previewMark}
          settings={settings}
          isModal={true}
          onClose={() => setPreviewMark(null)}
        />
      )}
    </div>
  );
};
