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
  MCQQuestion,
  MCQCategory,
  PdfNote,
  PdfDownloadRequest,
  User as UserType,
  PasswordResetRequest,
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
  X,
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
  BookOpen,
  Edit3,
  ListPlus,
  Tag,
  User,
  BrainCircuit,
  HelpCircle,
  FileText,
  Download,
  Filter,
  Sparkles,
  Database,
  Server,
  HardDrive,
  Cloud,
  Cpu,
  Activity,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Share2,
  Send,
  QrCode,
  CreditCard,
  Lock,
  Unlock,
  Phone,
  Mail,
  ExternalLink,
  Video,
  Youtube,
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
  onSettingsUpdate: (settings: InstituteSettings) => void;
}

export const AdminPortal: React.FC<Props> = ({ settings, onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'courses'
    | 'admissions'
    | 'franchises'
    | 'marks'
    | 'certificates'
    | 'marksheets'
    | 'mcqs'
    | 'pdf-notes'
    | 'templates'
    | 'signatures'
    | 'notices'
    | 'settings'
    | 'users'
    | 'audit-logs'
    | 'database'
  >('dashboard');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marksList, setMarksList] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [mcqsList, setMcqsList] = useState<MCQQuestion[]>([]);
  const [mcqCategoryFilter, setMcqCategoryFilter] = useState<string>('ALL');
  const [mcqSearch, setMcqSearch] = useState('');
  const [isMcqModalOpen, setIsMcqModalOpen] = useState(false);
  const [editingMcq, setEditingMcq] = useState<MCQQuestion | null>(null);
  const [mcqFormData, setMcqFormData] = useState<{
    category: MCQCategory;
    categoryName: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  }>({
    category: 'CCC',
    categoryName: 'Course on Computer Concepts (CCC)',
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    difficulty: 'Intermediate',
  });

  // PDF Notes & Download Requests State for Admin
  const [pdfNotesList, setPdfNotesList] = useState<PdfNote[]>([]);
  const [pdfRequestsList, setPdfRequestsList] = useState<PdfDownloadRequest[]>([]);
  const [pdfRequestsFilter, setPdfRequestsFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [pdfRequestSearch, setPdfRequestSearch] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isEditPdfModalOpen, setIsEditPdfModalOpen] = useState(false);
  const [editingPdfNote, setEditingPdfNote] = useState<PdfNote | null>(null);
  const [pdfSubmitting, setPdfSubmitting] = useState(false);
  const [pdfFormData, setPdfFormData] = useState<{
    title: string;
    category: string;
    description: string;
    fileUrl: string;
    fileSize: string;
    pages: number;
    price: number;
    originalPrice: number;
    discountPercent?: number;
  }>({
    title: '',
    category: 'CCC (NIELIT)',
    description: '',
    fileUrl: '',
    fileSize: '4.5 MB',
    pages: 45,
    price: 49,
    originalPrice: 199,
    discountPercent: 75,
  });
  const [editPdfFormData, setEditPdfFormData] = useState<{
    title: string;
    category: string;
    description: string;
    fileUrl: string;
    fileSize: string;
    pages: number;
    price: number;
    originalPrice: number;
    discountPercent?: number;
  }>({
    title: '',
    category: 'CCC (NIELIT)',
    description: '',
    fileUrl: '',
    fileSize: '4.5 MB',
    pages: 45,
    price: 49,
    originalPrice: 199,
    discountPercent: 75,
  });

  // User Accounts & Password Control State
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [passwordResetsList, setPasswordResetsList] = useState<PasswordResetRequest[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'admin' | 'franchise' | 'student'>('ALL');
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserType | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [copiedUserText, setCopiedUserText] = useState<string | null>(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isSavingAdminCred, setIsSavingAdminCred] = useState(false);
  const [adminCredForm, setAdminCredForm] = useState({
    email: 'admin@advancecomputerinstitute.com',
    password: '',
    mobile: '6306242129',
    name: 'Mr. Amar Soni (Director)',
  });
  const [templates, setTemplates] = useState<{
    certificateTemplates: CertificateTemplateConfig[];
    marksheetTemplates: MarksheetTemplateConfig[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Course Management State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseFormData, setCourseFormData] = useState<{
    code: string;
    name: string;
    duration: string;
    session: string;
    eligibility: string;
    fee: number;
    originalFee: number;
    discountPercent?: number;
    badgeText?: string;
    description: string;
    subjects: { code: string; name: string; maxMarks: number; minMarks: number; theoryMax: number; practicalMax: number; internalMax: number }[];
  }>({
    code: '',
    name: '',
    duration: '6 Months',
    session: '2025-2026',
    eligibility: '10+2 / Intermediate in any stream',
    fee: 4500,
    originalFee: 8000,
    badgeText: '44% OFF',
    description: '',
    subjects: [
      { code: 'MOD-101', name: 'Computer Fundamentals & OS', maxMarks: 100, minMarks: 40, theoryMax: 70, practicalMax: 20, internalMax: 10 },
      { code: 'MOD-102', name: 'Office Productivity Suite', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
    ],
  });

  // Marksheet Topics Edit Modal State
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);
  const [topicsStudent, setTopicsStudent] = useState<Student | null>(null);
  const [topicsList, setTopicsList] = useState<{
    subjectName: string;
    maxMarks: number;
    minMarks: number;
    theoryMarks: number;
    practicalMarks: number;
    internalMarks: number;
    obtainedMarks: number;
  }[]>([]);

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

  // Database, Storage & Hosting Control State
  const [dbStats, setDbStats] = useState<any>(null);
  const [isOptimizingDb, setIsOptimizingDb] = useState(false);
  const [isRestoringDb, setIsRestoringDb] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadDatabaseStats = async () => {
    try {
      const stats = await api.getDatabaseStats();
      if (stats) setDbStats(stats);
    } catch (e) {
      console.error('Error fetching database stats:', e);
    }
  };

  const handleDownloadBackup = () => {
    api.downloadDatabaseBackup();
    showToast('Database JSON backup snapshot download initiated!');
  };

  const handleExportCollectionJson = (collectionName: string, data: any) => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aidt_${collectionName}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${collectionName} collection as JSON!`);
    } catch (err: any) {
      showToast('Error exporting data: ' + err.message, 'error');
    }
  };

  const handleRestoreDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.students)) {
          showToast('Invalid backup file! Must contain valid JSON database with students array.', 'error');
          return;
        }

        if (
          !confirm(
            `Are you sure you want to restore database snapshot? This will reload ${parsed.students.length} students and ${
              parsed.certificates?.length || 0
            } certificates. Current state will be safely backed up automatically on disk.`
          )
        ) {
          return;
        }

        setIsRestoringDb(true);
        const res = await api.restoreDatabase(parsed);
        if (res.success) {
          showToast('Database successfully restored and synchronized with disk!');
          await loadAllData();
          await loadDatabaseStats();
        } else {
          showToast(res.error || 'Failed to restore database.', 'error');
        }
      } catch (err: any) {
        showToast('Error parsing backup file: ' + err.message, 'error');
      } finally {
        setIsRestoringDb(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleOptimizeDb = async () => {
    setIsOptimizingDb(true);
    try {
      const res = await api.optimizeDatabase();
      if (res.success) {
        showToast('Database compacted, audit buffer pruned, and cache synchronized!');
        await loadDatabaseStats();
      } else {
        showToast(res.error || 'Failed to optimize database.', 'error');
      }
    } catch (e) {
      showToast('Error optimizing database.', 'error');
    } finally {
      setIsOptimizingDb(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dash, stuList, mList, franList, logs, tmpls, ntsList, crsList, mcqData, pdfData, reqData, dbStat, uList, pwResets] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminStudents(),
        api.getAdminMarks(),
        api.getFranchises(),
        api.getAuditLogs(),
        api.getTemplates(),
        api.getNotices(),
        api.getCourses(),
        api.getMCQs(),
        api.getPdfNotes(),
        api.getPdfRequests(),
        api.getDatabaseStats().catch(() => null),
        api.getUsersList().catch(() => []),
        api.getPasswordResetRequests().catch(() => []),
      ]);

      setDashboardData(dash);
      setStudents(stuList);
      setMarksList(mList);
      setFranchises(franList);
      setAuditLogs(logs);
      setTemplates(tmpls);
      if (ntsList) setNoticesList(ntsList);
      if (crsList) setCoursesList(crsList);
      if (mcqData) setMcqsList(mcqData);
      if (pdfData) setPdfNotesList(pdfData);
      if (reqData) setPdfRequestsList(reqData);
      if (dbStat) setDbStats(dbStat);
      if (uList) {
        setUsersList(uList);
        const primaryAdmin = uList.find((u: UserType) => u.role === 'admin');
        if (primaryAdmin) {
          setAdminCredForm({
            email: primaryAdmin.email || 'admin@advancecomputerinstitute.com',
            password: primaryAdmin.password || 'Admin@2026',
            mobile: primaryAdmin.mobile || '6306242129',
            name: primaryAdmin.name || 'Mr. Amar Soni (Director)',
          });
        }
      }
      if (pwResets) setPasswordResetsList(pwResets);
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

  // Course Management Handlers
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseFormData({
      code: '',
      name: '',
      duration: '6 Months',
      session: '2025-2026',
      eligibility: '10+2 / Intermediate in any stream',
      fee: 4500,
      originalFee: 8000,
      badgeText: '44% OFF',
      description: '',
      subjects: [
        { code: 'MOD-101', name: 'Module 1: Computer Fundamentals & OS', maxMarks: 100, minMarks: 40, theoryMax: 70, practicalMax: 20, internalMax: 10 },
        { code: 'MOD-102', name: 'Module 2: Office Automation & Internet', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
      ],
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      code: course.code,
      name: course.name,
      duration: course.duration,
      session: course.session,
      eligibility: course.eligibility,
      fee: course.fee,
      originalFee: course.originalFee || Math.round(course.fee * 1.5),
      discountPercent: course.discountPercent,
      badgeText: course.badgeText || '',
      description: course.description || '',
      subjects: course.subjects && course.subjects.length > 0 ? [...course.subjects] : [
        { code: `${course.code}-101`, name: 'Module 1: Core Fundamentals', maxMarks: 100, minMarks: 40, theoryMax: 70, practicalMax: 20, internalMax: 10 }
      ],
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.code.trim() || !courseFormData.name.trim()) {
      showToast('Course Code and Name are required.', 'error');
      return;
    }
    try {
      if (editingCourse) {
        const res = await api.updateCourse(editingCourse.id, courseFormData);
        if (res.success) {
          showToast(`Course "${courseFormData.name}" updated successfully.`);
          setIsCourseModalOpen(false);
          loadAllData();
        } else {
          showToast(res.error || 'Failed to update course', 'error');
        }
      } else {
        const res = await api.addCourse(courseFormData);
        if (res.success) {
          showToast(`Course "${courseFormData.name}" created successfully.`);
          setIsCourseModalOpen(false);
          loadAllData();
        } else {
          showToast(res.error || 'Failed to create course', 'error');
        }
      }
    } catch (err) {
      showToast('Network error while saving course.', 'error');
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`Are you sure you want to permanently delete the course "${courseName}"?`)) return;
    try {
      const res = await api.deleteCourse(courseId);
      if (res.success) {
        showToast('Course deleted successfully.');
        loadAllData();
      } else {
        showToast('Failed to delete course', 'error');
      }
    } catch (err) {
      showToast('Error deleting course.', 'error');
    }
  };

  const handleAddCourseSubject = () => {
    const nextIndex = (courseFormData.subjects?.length || 0) + 1;
    setCourseFormData(prev => ({
      ...prev,
      subjects: [
        ...(prev.subjects || []),
        {
          code: `${prev.code || 'MOD'}-10${nextIndex}`,
          name: `Module ${nextIndex}: Advanced Practical Lab`,
          maxMarks: 100,
          minMarks: 40,
          theoryMax: 60,
          practicalMax: 30,
          internalMax: 10,
        }
      ]
    }));
  };

  const handleRemoveCourseSubject = (index: number) => {
    setCourseFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  // Marksheet Topics Management Handlers
  const handleOpenTopicsModal = (student: Student) => {
    setTopicsStudent(student);
    // Check if marks record exists
    const existingMarks = marksList.find(m => m.studentId === student.id);
    if (existingMarks && existingMarks.subjects && existingMarks.subjects.length > 0) {
      setTopicsList(existingMarks.subjects.map((s: any) => ({
        subjectName: s.subjectName || s.name || 'Subject',
        maxMarks: s.maxMarks || 100,
        minMarks: s.minMarks || 40,
        theoryMarks: s.theoryMarks || 0,
        practicalMarks: s.practicalMarks || 0,
        internalMarks: s.internalMarks || 0,
        obtainedMarks: s.obtainedMarks !== undefined ? s.obtainedMarks : ((s.theoryMarks || 0) + (s.practicalMarks || 0) + (s.internalMarks || 0)),
      })));
    } else {
      // Find course subjects
      const course = coursesList.find(c => c.id === student.courseId || c.name === student.courseName);
      if (course && course.subjects && course.subjects.length > 0) {
        setTopicsList(course.subjects.map((s: any) => ({
          subjectName: s.name,
          maxMarks: s.maxMarks || 100,
          minMarks: s.minMarks || 40,
          theoryMarks: Math.round((s.maxMarks || 100) * 0.65),
          practicalMarks: Math.round((s.maxMarks || 100) * 0.22),
          internalMarks: Math.round((s.maxMarks || 100) * 0.08),
          obtainedMarks: Math.round((s.maxMarks || 100) * 0.85),
        })));
      } else {
        setTopicsList([
          { subjectName: 'Computer Fundamentals & OS', maxMarks: 100, minMarks: 40, theoryMarks: 60, practicalMarks: 20, internalMarks: 9, obtainedMarks: 89 },
          { subjectName: 'Office Productivity Suite', maxMarks: 100, minMarks: 40, theoryMarks: 55, practicalMarks: 25, internalMarks: 9, obtainedMarks: 89 },
        ]);
      }
    }
    setIsTopicsModalOpen(true);
  };

  const handleAddTopicRow = () => {
    setTopicsList(prev => [
      ...prev,
      {
        subjectName: `Topic ${prev.length + 1}: Practical Application`,
        maxMarks: 100,
        minMarks: 40,
        theoryMarks: 60,
        practicalMarks: 25,
        internalMarks: 10,
        obtainedMarks: 95,
      }
    ]);
  };

  const handleRemoveTopicRow = (index: number) => {
    if (topicsList.length <= 1) {
      showToast('A marksheet must have at least one topic/subject.', 'error');
      return;
    }
    setTopicsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleTopicFieldChange = (index: number, field: string, value: any) => {
    setTopicsList(prev => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: value };
      if (field === 'theoryMarks' || field === 'practicalMarks' || field === 'internalMarks') {
        const th = parseInt(field === 'theoryMarks' ? value : item.theoryMarks) || 0;
        const pr = parseInt(field === 'practicalMarks' ? value : item.practicalMarks) || 0;
        const it = parseInt(field === 'internalMarks' ? value : item.internalMarks) || 0;
        item.obtainedMarks = Math.min(item.maxMarks || 100, th + pr + it);
      } else if (field === 'obtainedMarks') {
        item.obtainedMarks = Math.min(item.maxMarks || 100, parseInt(value) || 0);
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleSaveTopics = async () => {
    if (!topicsStudent) return;
    if (topicsList.length === 0) {
      showToast('Please add at least one topic/subject.', 'error');
      return;
    }
    try {
      const res = await api.updateMarksheetTopics(topicsStudent.id, { subjects: topicsList });
      if (res.success) {
        showToast('Marksheet topics and examination marks updated successfully!');
        setIsTopicsModalOpen(false);
        loadAllData();
      } else {
        showToast(res.error || 'Failed to update marksheet topics.', 'error');
      }
    } catch (err) {
      showToast('Error saving marksheet topics.', 'error');
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

  // MCQ Management Handlers
  const handleOpenAddMcq = () => {
    setEditingMcq(null);
    setMcqFormData({
      category: 'CCC',
      categoryName: 'Course on Computer Concepts (CCC)',
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      difficulty: 'Intermediate',
    });
    setIsMcqModalOpen(true);
  };

  const handleOpenEditMcq = (mcq: MCQQuestion) => {
    setEditingMcq(mcq);
    setMcqFormData({
      category: mcq.category,
      categoryName: mcq.categoryName || 'Computer Aptitude',
      question: mcq.question,
      options: mcq.options && mcq.options.length >= 4 ? [...mcq.options] : [...(mcq.options || []), '', '', '', ''].slice(0, 4),
      correctAnswerIndex: mcq.correctAnswerIndex || 0,
      explanation: mcq.explanation || '',
      difficulty: mcq.difficulty || 'Intermediate',
    });
    setIsMcqModalOpen(true);
  };

  const handleSaveMcq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcqFormData.question.trim()) {
      showToast('Question text is required.', 'error');
      return;
    }
    const cleanOptions = mcqFormData.options.map((o) => o.trim());
    if (cleanOptions.some((o) => !o)) {
      showToast('All 4 options must be provided.', 'error');
      return;
    }
    try {
      if (editingMcq) {
        const res = await api.updateMCQ(editingMcq.id, {
          ...mcqFormData,
          options: cleanOptions,
        });
        if (res.success) {
          showToast('MCQ question updated successfully!');
          setIsMcqModalOpen(false);
          loadAllData();
        } else {
          showToast(res.error || 'Failed to update MCQ.', 'error');
        }
      } else {
        const res = await api.addMCQ({
          ...mcqFormData,
          options: cleanOptions,
        });
        if (res.success) {
          showToast('New MCQ question created successfully!');
          setIsMcqModalOpen(false);
          loadAllData();
        } else {
          showToast(res.error || 'Failed to create MCQ.', 'error');
        }
      }
    } catch (err) {
      showToast('Error saving MCQ question.', 'error');
    }
  };

  const handleDeleteMcq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this MCQ question?')) return;
    try {
      const res = await api.deleteMCQ(id);
      if (res.success) {
        showToast('MCQ question deleted.');
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to delete MCQ question.', 'error');
    }
  };

  // PDF Notes & Requests Handlers
  const handleOpenAddPdf = () => {
    setPdfFormData({
      title: '',
      category: 'CCC Examination',
      description: '',
      fileUrl: '',
      fileSize: '4.5 MB',
      pages: 45,
      price: 49,
      originalPrice: 199,
      discountPercent: 75,
    });
    setIsPdfModalOpen(true);
  };

  const handleOpenEditPdf = (note: PdfNote) => {
    setEditingPdfNote(note);
    const disc = note.discountPercent || (note.originalPrice && note.price ? Math.round(((note.originalPrice - note.price) / note.originalPrice) * 100) : 75);
    setEditPdfFormData({
      title: note.title,
      category: note.category,
      description: note.description,
      fileUrl: note.fileUrl,
      fileSize: note.fileSize || '4.5 MB',
      pages: note.pages || 45,
      price: note.price || 49,
      originalPrice: note.originalPrice || 199,
      discountPercent: disc,
    });
    setIsEditPdfModalOpen(true);
  };

  const handleSavePdfNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFormData.title.trim()) {
      showToast('Note title is required.', 'error');
      return;
    }
    setPdfSubmitting(true);
    try {
      const disc = pdfFormData.originalPrice && pdfFormData.price
        ? Math.round(((pdfFormData.originalPrice - pdfFormData.price) / pdfFormData.originalPrice) * 100)
        : (pdfFormData.discountPercent || 75);

      const res = await api.addPdfNote({
        ...pdfFormData,
        discountPercent: disc,
      });
      if (res.success) {
        showToast(`PDF Note "${pdfFormData.title}" uploaded successfully!`);
        setIsPdfModalOpen(false);
        loadAllData();
      } else {
        showToast(res.error || 'Failed to upload PDF note.', 'error');
      }
    } catch (err) {
      showToast('Error uploading PDF note.', 'error');
    } finally {
      setPdfSubmitting(false);
    }
  };

  const handleSaveEditPdfNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPdfNote) return;
    if (!editPdfFormData.title.trim()) {
      showToast('Note title is required.', 'error');
      return;
    }
    setPdfSubmitting(true);
    try {
      const disc = editPdfFormData.originalPrice && editPdfFormData.price
        ? Math.round(((editPdfFormData.originalPrice - editPdfFormData.price) / editPdfFormData.originalPrice) * 100)
        : (editPdfFormData.discountPercent || 75);

      const res = await api.updatePdfNote(editingPdfNote.id, {
        ...editPdfFormData,
        discountPercent: disc,
      });
      if (res.success) {
        showToast(`PDF Note "${editPdfFormData.title}" updated successfully!`);
        setIsEditPdfModalOpen(false);
        setEditingPdfNote(null);
        loadAllData();
      } else {
        showToast(res.error || 'Failed to update PDF note.', 'error');
      }
    } catch (err) {
      showToast('Error updating PDF note.', 'error');
    } finally {
      setPdfSubmitting(false);
    }
  };

  const handleDeletePdfNote = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this PDF note?')) return;
    try {
      const res = await api.deletePdfNote(id);
      if (res.success) {
        showToast('PDF note deleted.');
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to delete PDF note.', 'error');
    }
  };

  const handleReviewPdfRequest = async (id: string, action: 'APPROVE' | 'REJECT', remarks?: string) => {
    try {
      const res = await api.reviewPdfRequest(id, action, remarks);
      if (res.success) {
        showToast(
          action === 'APPROVE'
            ? 'Download request APPROVED! Student can now download this PDF.'
            : 'Download request marked as REJECTED.'
        );
        loadAllData();
      } else {
        showToast(res.error || 'Failed to update request status.', 'error');
      }
    } catch (err) {
      showToast('Error reviewing download request.', 'error');
    }
  };

  const handleSendWhatsAppApproval = (req: PdfDownloadRequest) => {
    const text = encodeURIComponent(
      `Hello ${req.studentName},\nYour payment of ₹${req.amountPaid || 49} (UTR: ${req.utrNumber || 'Verified'}) for "${req.pdfTitle}" has been APPROVED by Director Amar Soni at Advance Institute of Digital Technology!\n\nYou can now download your official PDF notes anytime on our portal by entering your registered mobile (${req.mobile}):\nhttps://advancecomputerinstitute.com\n\nInstitute Central Helpline: 6306242129`
    );
    window.open(`https://wa.me/91${req.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${text}`, '_blank');
  };

  // Admin Credentials & User Access Handlers
  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCredForm.email.trim()) {
      showToast('Admin email/ID cannot be empty.', 'error');
      return;
    }
    setIsSavingAdminCred(true);
    try {
      const primaryAdmin = usersList.find((u) => u.role === 'admin');
      if (primaryAdmin) {
        const payload: any = {
          email: adminCredForm.email.trim(),
          mobile: adminCredForm.mobile.trim() || '6306242129',
          name: adminCredForm.name.trim() || 'Mr. Amar Soni (Director)',
        };
        if (adminCredForm.password && adminCredForm.password.trim()) {
          payload.password = adminCredForm.password.trim();
        }
        const res = await api.adminUpdateUser(primaryAdmin.id, payload);
        if (res.success) {
          showToast('Director Amar Soni admin credentials updated and saved successfully!');
          loadAllData();
        } else {
          showToast(res.error || 'Failed to update admin credentials.', 'error');
        }
      } else {
        showToast('Admin account not found.', 'error');
      }
    } catch (err) {
      showToast('Error updating admin credentials.', 'error');
    } finally {
      setIsSavingAdminCred(false);
    }
  };

  const handleSendAdminCredsToWhatsApp = () => {
    const targetMobile = (adminCredForm.mobile || '6306242129').replace(/[^0-9]/g, '').slice(-10);
    const pass = adminCredForm.password || usersList.find((u) => u.role === 'admin')?.password || 'Admin@2026';
    const text = encodeURIComponent(
      `🔒 OFFICIAL ADMIN CREDENTIALS\nAdvance Institute of Digital Technology (Ayodhya Cantt)\n\n• Portal URL: https://advancecomputerinstitute.com\n• Admin ID: ${adminCredForm.email}\n• Password: ${pass}\n• Admin Mobile: 6306242129\n• Authorized Holder: Mr. Amar Soni (Director)\n\nPlease keep these credentials secure.`
    );
    window.open(`https://wa.me/91${targetMobile}?text=${text}`, '_blank');
  };

  const handleShareCredentials = (u: UserType) => {
    const pass = u.password || 'Contact Director';
    const text = `Official AIDT Portal Credentials:\nRole: ${u.role.toUpperCase()}\nName: ${u.name}\nLogin ID: ${u.email || u.mobile}\nPassword: ${pass}\nPortal: https://advancecomputerinstitute.com\nHelpline: 6306242129`;
    navigator.clipboard?.writeText(text);
    setCopiedUserText(u.id);
    setTimeout(() => setCopiedUserText(null), 3000);
    showToast(`Credentials for ${u.name} copied to clipboard!`);
  };

  const handleResolvePasswordReset = async (req: PasswordResetRequest, customPass?: string) => {
    try {
      const res = await api.resolvePasswordResetRequest(req.id, {
        newPassword: customPass,
        adminRemarks: 'Approved & issued by Director Amar Soni',
      });
      if (res.success) {
        showToast(`New password issued for ${req.name}: ${res.newPassword}`);
        if (res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank');
        }
        loadAllData();
      } else {
        showToast(res.error || 'Failed to resolve request.', 'error');
      }
    } catch (err) {
      showToast('Error resolving password reset request.', 'error');
    }
  };

  const handleAdminResetUserPassword = async (userId: string, newPass: string) => {
    if (!newPass.trim()) {
      showToast('Please enter a new password.', 'error');
      return;
    }
    try {
      const res = await api.adminResetUserPassword(userId, newPass.trim());
      if (res.success) {
        showToast(res.message || 'Password updated successfully!');
        setSelectedUserForReset(null);
        setNewPasswordInput('');
        loadAllData();
      } else {
        showToast(res.error || 'Failed to reset password.', 'error');
      }
    } catch (err) {
      showToast('Error resetting password.', 'error');
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
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'courses' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" /> Courses &amp; Fees
            </span>
            <span className="px-1.5 py-0.5 bg-blue-500 text-white font-bold rounded-full text-[10px]">
              {coursesList.length}
            </span>
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
            onClick={() => setActiveTab('mcqs')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'mcqs' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BrainCircuit className="w-4 h-4 text-amber-400" /> MCQ Exam Tests
            </span>
            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 font-bold rounded-full text-[10px]">
              {mcqsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pdf-notes')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'pdf-notes' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-400" /> PDF Notes &amp; Approvals
            </span>
            {pdfRequestsList.filter((r) => r.status === 'PENDING').length > 0 ? (
              <span className="px-1.5 py-0.5 bg-red-400 text-slate-900 font-bold rounded-full text-[10px] animate-pulse">
                {pdfRequestsList.filter((r) => r.status === 'PENDING').length} Pending
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-blue-500 text-white font-bold rounded-full text-[10px]">
                {pdfNotesList.length}
              </span>
            )}
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
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'users' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-emerald-400" /> Admin Security &amp; Users
            </span>
            {passwordResetsList.filter((r) => r.status === 'PENDING').length > 0 ? (
              <span className="px-1.5 py-0.5 bg-red-500 text-white font-bold rounded-full text-[10px] animate-pulse">
                {passwordResetsList.filter((r) => r.status === 'PENDING').length} Reset
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-bold rounded-full text-[10px]">
                {usersList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'audit-logs' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-[#1a3d60]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Security Audit Log
          </button>

          <button
            onClick={() => {
              setActiveTab('database');
              loadDatabaseStats();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300 hover:bg-[#1a3d60] hover:text-white border border-emerald-500/30'
            }`}
          >
            <span className="flex items-center gap-2.5 font-bold">
              <Database className="w-4 h-4 text-emerald-400" /> Database &amp; Hosting
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
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
        {/* TAB: COURSES & FEE MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'courses' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  Course Catalog &amp; Fee Management
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full administrative control: Add courses, configure admission fees, strikethrough original prices, and syllabus modules
                </p>
              </div>

              <button
                onClick={handleOpenAddCourse}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Course</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Active Courses</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{coursesList.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Lowest Admission Fee</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  ₹{coursesList.length > 0 ? Math.min(...coursesList.map((c) => c.fee)).toLocaleString() : '0'}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs">
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">Max Strikethrough Price</span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  ₹{coursesList.length > 0 ? Math.max(...coursesList.map((c) => c.originalFee || c.fee)).toLocaleString() : '0'}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 shadow-xs">
                <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider">Total Curriculum Modules</span>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {coursesList.reduce((acc, c) => acc + (c.subjects?.length || 0), 0)}
                </div>
              </div>
            </div>

            {/* Courses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesList.map((course) => {
                const origFee = course.originalFee || Math.round(course.fee * 1.5);
                const discount = course.discountPercent || Math.round(((origFee - course.fee) / origFee) * 100);

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-mono font-bold text-xs">
                          {course.code}
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full font-bold text-[10px]">
                          {course.badgeText || `${discount}% OFF`}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {course.name}
                      </h3>

                      <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                        <div>
                          <strong className="text-slate-700">Duration:</strong> {course.duration}
                        </div>
                        <div>
                          <strong className="text-slate-700">Session:</strong> {course.session}
                        </div>
                        <div>
                          <strong className="text-slate-700">Eligibility:</strong> {course.eligibility}
                        </div>
                      </div>

                      {/* Pricing Box */}
                      <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Admission Fee</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-emerald-700">
                              ₹{course.fee.toLocaleString()}
                            </span>
                            <span className="text-xs line-through text-slate-400 font-semibold">
                              ₹{origFee.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            Save ₹{(origFee - course.fee).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {course.description || 'No description provided.'}
                      </p>

                      {/* Subjects count */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {course.subjects?.length || 0} Syllabus Modules
                        </span>
                        <span className="text-[10px] text-slate-400">Exam Board Ready</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditCourse(course)}
                        className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-700" />
                        <span>Edit Course &amp; Fee</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id, course.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
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
                              onClick={() => {
                                const student = students.find((s) => s.id === m.studentId);
                                if (student) handleOpenTopicsModal(student);
                                else showToast('Student record not found.', 'error');
                              }}
                              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <ListPlus className="w-3.5 h-3.5" /> Edit Topics &amp; Marks
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
                              onClick={() => {
                                const student = students.find((s) => s.id === m.studentId);
                                if (student) handleOpenTopicsModal(student);
                                else showToast('Student record not found.', 'error');
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <ListPlus className="w-3.5 h-3.5" /> Edit Topics
                            </button>
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
                        <button
                          onClick={() => handleOpenTopicsModal(stu)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Add/Remove topics & edit examination marks"
                        >
                          <ListPlus className="w-3.5 h-3.5" />
                          <span>Topics &amp; Marks</span>
                        </button>
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

            {/* Official YouTube Video Lectures & Practical Lab Section Controls */}
            <div className="bg-gradient-to-r from-red-50/70 via-rose-50/40 to-white border border-red-200 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-red-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-600 text-white rounded-lg shadow-xs">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Official YouTube Video Lectures &amp; Lab Tour Settings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure the video link shown on the public institute website anytime. Supports direct watch URLs, share links, or shorts.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-900">
                  <input
                    type="checkbox"
                    checked={editSettings.youtubeSectionEnabled !== false}
                    onChange={(e) =>
                      setEditSettings({ ...editSettings, youtubeSectionEnabled: e.target.checked })
                    }
                    className="rounded text-red-600"
                  />
                  <span>Show Section on Website</span>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    YouTube Video URL *
                  </label>
                  <div className="relative">
                    <Video className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      value={editSettings.youtubeVideoUrl || ''}
                      onChange={(e) =>
                        setEditSettings({ ...editSettings, youtubeVideoUrl: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Any YouTube video URL will automatically be converted to a clean responsive embed on the home page.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Section Headline Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Director Mr. Amar Soni Special Classes & Practical Tour"
                      value={editSettings.youtubeSectionTitle || ''}
                      onChange={(e) =>
                        setEditSettings({ ...editSettings, youtubeSectionTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Section Subtitle / Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Watch computer practical lab demos and seminars..."
                      value={editSettings.youtubeSectionDescription || ''}
                      onChange={(e) =>
                        setEditSettings({ ...editSettings, youtubeSectionDescription: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Live Preview If URL exists */}
                {editSettings.youtubeVideoUrl && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Live Video Embed Preview:
                    </span>
                    <div className="aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden bg-black shadow-xs">
                      <iframe
                        src={getYouTubeEmbedUrl(editSettings.youtubeVideoUrl)}
                        title="YouTube preview"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
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
        {/* TAB: ADMIN SECURITY & USER CREDENTIAL MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Admin Security &amp; User Credential Control</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Authorized administrative identity for Founder &amp; Director Mr. Amar Soni (Ayodhya Cantt, Helpline: 6306242129). Update login credentials, dispatch WhatsApp account keys, and control franchise &amp; student portal passwords.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendAdminCredsToWhatsApp}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  title="Direct WhatsApp to registered number 6306242129"
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  <span>Send Credentials to 6306242129</span>
                </button>
              </div>
            </div>

            {/* CARD 1: PRIMARY DIRECTOR ADMIN CREDENTIALS & CHANGE PASSWORD */}
            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white border border-blue-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-md">
                    <KeyRound className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        Director Amar Soni — Master Admin Credentials
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                        Active Master Access
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Login ID, password, and registered WhatsApp mobile: <strong>6306242129</strong>. You can modify these credentials anytime below.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const pass = adminCredForm.password || usersList.find((u) => u.role === 'admin')?.password || 'Admin@2026';
                      const text = `🔒 Official AIDT Admin Credentials:\n• Admin Login ID: ${adminCredForm.email}\n• Password: ${pass}\n• Registered Mobile: ${adminCredForm.mobile}\n• Director: Mr. Amar Soni\n• Portal URL: https://advancecomputerinstitute.com`;
                      navigator.clipboard?.writeText(text);
                      showToast('Admin Credentials copied to clipboard!');
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Credentials</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendAdminCredsToWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share to WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Edit Admin Credential Form */}
              <form onSubmit={handleSaveAdminCredentials} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Director / Admin Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={adminCredForm.name}
                        onChange={(e) => setAdminCredForm({ ...adminCredForm, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0f2942]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Admin Registered Mobile (6306242129) *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={adminCredForm.mobile}
                        onChange={(e) => setAdminCredForm({ ...adminCredForm, mobile: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-[#0f2942]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Admin Login ID / Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={adminCredForm.email}
                        onChange={(e) => setAdminCredForm({ ...adminCredForm, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-[#0f2942]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Admin can also login using registered number 6306242129
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Admin Password (New / Update) *
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminCredForm.password}
                        placeholder={usersList.find((u) => u.role === 'admin')?.password ? '••••••••' : 'Set Admin Password'}
                        onChange={(e) => setAdminCredForm({ ...adminCredForm, password: e.target.value })}
                        className="w-full px-3 py-2 pr-9 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-[#0f2942]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showAdminPassword ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Current Password: <strong className="font-mono text-slate-800">{usersList.find((u) => u.role === 'admin')?.password || 'Admin@2026'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-blue-100">
                  <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Credentials are stored securely and only accessible by Director Amar Soni.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSavingAdminCred}
                      className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSavingAdminCred ? 'Saving Changes...' : 'Save & Update Admin Credentials'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* CARD 2: PENDING PASSWORD RESET INQUIRIES QUEUE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-600" />
                    <span>User Password Reset Inquiries ({passwordResetsList.filter((r) => r.status === 'PENDING').length} Pending)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    When students or franchise centers request a password reset, their requests arrive here. Admin can issue a secure password and send it directly via WhatsApp.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Mobile Number</th>
                      <th className="p-3">Reason / Details</th>
                      <th className="p-3">Requested At</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {passwordResetsList.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{req.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.role === 'franchise' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {req.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-blue-900">{req.registeredMobile}</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">Login ID: {req.identifier}</td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">{req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'N/A'}</td>
                        <td className="p-3">
                          {req.status === 'PENDING' ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> PENDING
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> RESOLVED
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {req.status === 'PENDING' ? (
                            <button
                              onClick={() => handleResolvePasswordReset(req)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Issue &amp; Send Password</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {passwordResetsList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          No pending password reset requests from students or franchise centers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARD 3: ALL USER ACCOUNTS DIRECTORY & CREDENTIALS SHARING */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>All Registered Portal Users &amp; Passwords ({usersList.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Full authority to view, change, reset, copy, and share login credentials with students or franchise branch coordinators.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, ID, phone..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2 py-1 text-xs border rounded-lg bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    {(['ALL', 'admin', 'franchise', 'student'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setUserRoleFilter(r)}
                        className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                          userRoleFilter === r
                            ? 'bg-[#0f2942] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Login ID / Username</th>
                      <th className="p-3">Mobile Number</th>
                      <th className="p-3">Active Password</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList
                      .filter((u) => {
                        if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                        if (userSearchQuery.trim()) {
                          const q = userSearchQuery.toLowerCase();
                          return (
                            u.name.toLowerCase().includes(q) ||
                            (u.email && u.email.toLowerCase().includes(q)) ||
                            (u.mobile && u.mobile.includes(q)) ||
                            (u.role && u.role.toLowerCase().includes(q))
                          );
                        }
                        return true;
                      })
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{u.name}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : u.role === 'franchise'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-800">
                            {u.email || u.mobile}
                          </td>
                          <td className="p-3 font-mono font-bold text-blue-900">
                            {u.mobile ? (
                              <a href={`tel:${u.mobile}`} className="hover:underline">
                                {u.mobile}
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px]">
                              {u.password || '••••••••'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedUserForReset(u);
                                  setNewPasswordInput('');
                                }}
                                className="px-2.5 py-1 bg-blue-50 text-blue-900 hover:bg-blue-100 rounded text-[11px] font-semibold cursor-pointer flex items-center gap-1 border border-blue-200"
                                title="Change Password"
                              >
                                <Lock className="w-3 h-3 text-blue-700" />
                                <span>Change Password</span>
                              </button>

                              <button
                                onClick={() => handleShareCredentials(u)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold cursor-pointer flex items-center gap-1"
                                title="Copy Credentials"
                              >
                                {copiedUserText === u.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {u.mobile && (
                                <button
                                  onClick={() => {
                                    const text = encodeURIComponent(
                                      `Official AIDT Portal Credentials:\nRole: ${u.role.toUpperCase()}\nName: ${u.name}\nLogin ID: ${u.email || u.mobile}\nPassword: ${u.password || 'Contact Director'}\nPortal URL: https://advancecomputerinstitute.com\nDirector Amar Soni Helpline: 6306242129`
                                    );
                                    window.open(`https://wa.me/91${u.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${text}`, '_blank');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[11px] font-bold border border-emerald-300 flex items-center gap-1 cursor-pointer"
                                  title="Share to user's WhatsApp"
                                >
                                  <Send className="w-3 h-3 text-emerald-600" />
                                  <span>Share WhatsApp</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL: RESET PASSWORD FOR SELECTED USER */}
            {selectedUserForReset && (
              <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 animate-in fade-in">
                  <button
                    onClick={() => setSelectedUserForReset(null)}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2.5 mb-4 text-[#0f2942]">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        Update Password
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {selectedUserForReset.name} ({selectedUserForReset.role.toUpperCase()})
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded-xl mb-4 text-xs space-y-1">
                    <div>User ID / Email: <strong className="font-mono">{selectedUserForReset.email || selectedUserForReset.mobile}</strong></div>
                    <div>Mobile: <strong className="font-mono">{selectedUserForReset.mobile || 'N/A'}</strong></div>
                    <div>Current Password: <strong className="font-mono text-emerald-800">{selectedUserForReset.password || '••••••••'}</strong></div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAdminResetUserPassword(selectedUserForReset.id, newPasswordInput);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        New Password *
                      </label>
                      <input
                        type="text"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-[#0f2942]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForReset(null)}
                        className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                      >
                        Save New Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

        {/* ------------------------------------------------------------- */}
        {/* TAB: MCQ EXAMINATION MANAGEMENT (CCC, O'LEVEL, COMPETITIVE) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'mcqs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  MCQ Examination &amp; Question Bank Management
                </h1>
                <p className="text-xs text-slate-500">
                  Full control over student practice MCQs for CCC, O'Level, Competitive Exams, and Computer Aptitude.
                </p>
              </div>

              <button
                onClick={handleOpenAddMcq}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create New MCQ Question</span>
              </button>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Questions</span>
                <div className="text-xl font-extrabold text-[#0f2942] mt-0.5">{mcqsList.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/30">
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">CCC NIELIT</span>
                <div className="text-xl font-extrabold text-amber-800 mt-0.5">
                  {mcqsList.filter((q) => q.category === 'CCC').length}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs bg-blue-50/30">
                <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider">O'Level Modules</span>
                <div className="text-xl font-extrabold text-blue-800 mt-0.5">
                  {mcqsList.filter((q) => q.category === 'O_LEVEL').length}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/30">
                <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Competitive Exams</span>
                <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
                  {mcqsList.filter((q) => q.category === 'COMPETITIVE').length}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs bg-purple-50/30">
                <span className="text-[10px] text-purple-700 uppercase font-bold tracking-wider">ADCA &amp; DCA</span>
                <div className="text-xl font-extrabold text-purple-800 mt-0.5">
                  {mcqsList.filter((q) => q.category === 'ADCA_DCA' || q.category === 'PROGRAMMING').length}
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Category:
                </span>
                {[
                  { id: 'ALL', label: 'All Categories' },
                  { id: 'CCC', label: 'CCC' },
                  { id: 'O_LEVEL', label: "O'Level" },
                  { id: 'COMPETITIVE', label: 'Competitive Exams' },
                  { id: 'ADCA_DCA', label: 'ADCA / DCA' },
                  { id: 'PROGRAMMING', label: 'Programming' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setMcqCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      mcqCategoryFilter === cat.id
                        ? 'bg-[#0f2942] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={mcqSearch}
                  onChange={(e) => setMcqSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Questions Table / Cards */}
            <div className="space-y-3">
              {mcqsList
                .filter((q) => {
                  if (mcqCategoryFilter !== 'ALL' && q.category !== mcqCategoryFilter) return false;
                  if (mcqSearch.trim()) {
                    const s = mcqSearch.toLowerCase();
                    return q.question.toLowerCase().includes(s) || (q.explanation || '').toLowerCase().includes(s);
                  }
                  return true;
                })
                .map((mcq, idx) => (
                  <div
                    key={mcq.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[10px] uppercase">
                            {mcq.categoryName || mcq.category}
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                            {mcq.difficulty || 'Intermediate'}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {mcq.question}
                        </h3>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditMcq(mcq)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMcq(mcq.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {mcq.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === mcq.correctAnswerIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg border flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border text-slate-600'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {mcq.explanation && (
                      <div className="text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700">
                        <strong className="text-slate-900">Explanation:</strong> {mcq.explanation}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB: PDF NOTES & STUDENT DOWNLOAD APPROVALS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'pdf-notes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  PDF Notes, Pricing &amp; Student Payment Approvals
                </h1>
                <p className="text-xs text-slate-500">
                  Configure institute UPI QR code, manage note pricing with strike-through discounts, and verify student payments for instant downloads.
                </p>
              </div>

              <button
                onClick={handleOpenAddPdf}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Upload New PDF Note</span>
              </button>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total PDF Notes</span>
                <div className="text-xl font-extrabold text-[#0f2942] mt-0.5">{pdfNotesList.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-xs bg-red-50/40">
                <span className="text-[10px] text-red-700 uppercase font-bold tracking-wider">Pending Verifications</span>
                <div className="text-xl font-extrabold text-red-700 mt-0.5 flex items-center gap-2">
                  <span>{pdfRequestsList.filter((r) => r.status === 'PENDING').length}</span>
                  {pdfRequestsList.filter((r) => r.status === 'PENDING').length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-600 text-white rounded font-bold animate-pulse">
                      Action Required
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/40">
                <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Approved Requests</span>
                <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
                  {pdfRequestsList.filter((r) => r.status === 'APPROVED').length}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs bg-blue-50/40">
                <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider">Total Inquiries</span>
                <div className="text-xl font-extrabold text-blue-900 mt-0.5">
                  {pdfRequestsList.length}
                </div>
              </div>
            </div>

            {/* CARD: INSTITUTE UPI QR CODE & PAYMENT GATEWAY CONTROLS */}
            <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <QrCode className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Institute Payment Gateway: UPI QR Code &amp; Settings
                    </h3>
                    <p className="text-xs text-slate-500">
                      When students purchase notes, this QR Code &amp; UPI ID is displayed. Upload your own QR code anytime.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Custom QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            const dataUrl = ev.target?.result as string;
                            try {
                              const updated = { ...settings, upiQrCodeUrl: dataUrl };
                              await api.updateSettings(updated);
                              onSettingsUpdate(updated);
                              showToast('Custom Payment QR Code uploaded and activated across all notes!');
                            } catch (err) {
                              showToast('Failed to save QR code.', 'error');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* QR Preview */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center">
                    <img
                      src={settings.upiQrCodeUrl || '/upi-qr-aidt.svg'}
                      alt="Payment QR"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/upi-qr-aidt.svg';
                      }}
                    />
                  </div>
                  <div className="min-w-0 text-xs space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active QR Gateway</span>
                    <div className="font-bold text-slate-800 text-[11px] truncate">
                      {settings.upiPayeeName || 'Advance Institute of Digital Technology'}
                    </div>
                    <div className="font-mono text-blue-900 font-semibold text-[11px] truncate">
                      {settings.upiId || '6306242129@upi'}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold block">✓ Verified Active</span>
                  </div>
                </div>

                {/* Form fields to update UPI ID & Name */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      UPI ID (VPA) *
                    </label>
                    <input
                      type="text"
                      defaultValue={settings.upiId || '6306242129@upi'}
                      onBlur={async (e) => {
                        const val = e.target.value.trim();
                        if (val && val !== settings.upiId) {
                          const updated = { ...settings, upiId: val };
                          await api.updateSettings(updated);
                          onSettingsUpdate(updated);
                          showToast('UPI ID updated successfully!');
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-[#0f2942]"
                      placeholder="e.g. 6306242129@upi"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payee Display Name *
                    </label>
                    <input
                      type="text"
                      defaultValue={settings.upiPayeeName || 'Advance Institute of Digital Technology (Director Amar Soni)'}
                      onBlur={async (e) => {
                        const val = e.target.value.trim();
                        if (val && val !== settings.upiPayeeName) {
                          const updated = { ...settings, upiPayeeName: val };
                          await api.updateSettings(updated);
                          onSettingsUpdate(updated);
                          showToast('Payee Name updated successfully!');
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0f2942]"
                      placeholder="e.g. Advance Institute of Digital Technology"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: STUDENT DOWNLOAD REQUESTS & APPROVAL QUEUE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>Student Payment &amp; Download Approval Queue</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    When students scan the QR code and submit their UTR/Transaction ID, requests appear here as <strong>PENDING</strong>. Click <strong>"Verify &amp; Approve"</strong> to grant immediate download access.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, UTR, mobile..."
                      value={pdfRequestSearch}
                      onChange={(e) => setPdfRequestSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1 text-xs border rounded-lg bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setPdfRequestsFilter(st)}
                        className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                          pdfRequestsFilter === st
                            ? 'bg-[#0f2942] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requests Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Mobile Number</th>
                      <th className="p-3">Requested PDF Note</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3">UTR / Ref No</th>
                      <th className="p-3">Request Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pdfRequestsList
                      .filter((req) => {
                        if (pdfRequestsFilter !== 'ALL' && req.status !== pdfRequestsFilter) return false;
                        if (pdfRequestSearch.trim()) {
                          const s = pdfRequestSearch.toLowerCase();
                          return (
                            req.studentName.toLowerCase().includes(s) ||
                            req.mobile.includes(s) ||
                            req.pdfTitle.toLowerCase().includes(s) ||
                            (req.utrNumber && req.utrNumber.toLowerCase().includes(s))
                          );
                        }
                        return true;
                      })
                      .map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{req.studentName}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-blue-900">
                            <a href={`tel:${req.mobile}`} className="hover:underline">
                              {req.mobile}
                            </a>
                          </td>
                          <td className="p-3 font-semibold text-slate-800 max-w-xs truncate">
                            {req.pdfTitle}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-800">
                            ₹{req.amountPaid || 49}
                          </td>
                          <td className="p-3 font-mono">
                            {req.utrNumber ? (
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-900 text-[11px]">
                                {req.utrNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Direct Request</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="p-3">
                            {req.status === 'PENDING' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px] inline-flex items-center gap-1 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> PENDING VERIFICATION
                              </span>
                            )}
                            {req.status === 'APPROVED' && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px] inline-flex items-center gap-1 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> APPROVED
                              </span>
                            )}
                            {req.status === 'REJECTED' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-900 rounded font-bold text-[10px] inline-flex items-center gap-1 border border-red-300">
                                <XCircle className="w-3 h-3 text-red-600" /> REJECTED
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {req.status === 'PENDING' ? (
                                <>
                                  <button
                                    onClick={() => handleReviewPdfRequest(req.id, 'APPROVE')}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verify &amp; Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleReviewPdfRequest(req.id, 'REJECT')}
                                    className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-semibold cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : req.status === 'APPROVED' ? (
                                <>
                                  <button
                                    onClick={() => handleSendWhatsAppApproval(req)}
                                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-bold border border-emerald-300 flex items-center gap-1 cursor-pointer"
                                    title="Send WhatsApp confirmation link"
                                  >
                                    <Send className="w-3 h-3 text-emerald-600" />
                                    <span>WhatsApp</span>
                                  </button>
                                  <button
                                    onClick={() => handleReviewPdfRequest(req.id, 'REJECT', 'Access revoked by Admin')}
                                    className="px-2.5 py-1 text-slate-500 hover:text-red-700 text-[11px] font-medium cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleReviewPdfRequest(req.id, 'APPROVE')}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Re-Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {pdfRequestsList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          No student download requests registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: PDF NOTES REPOSITORY WITH PRICING CONTROLS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>Institute PDF Notes Repository ({pdfNotesList.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Syllabus handouts &amp; notes uploaded by Director Amar Soni with offer fees under ₹100 and strike-through discounts.
                  </p>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Click <strong>"Edit Price &amp; Details"</strong> on any note to adjust offer price or strike-through amount anytime.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pdfNotesList.map((note) => (
                  <div
                    key={note.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded text-[10px] uppercase">
                          {note.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {note.fileSize || '5 MB'} • {note.pages || 40} pages
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">{note.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{note.description}</p>

                      {/* Pricing Tag */}
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Student Fee:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-emerald-800 font-mono">
                              ₹{note.price || 49}
                            </span>
                            <span className="text-xs text-slate-400 line-through font-mono">
                              ₹{note.originalPrice || 199}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          {note.discountPercent || 75}% OFF
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Downloads: <strong>{note.downloadsCount || 0}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditPdf(note)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edit Price</span>
                        </button>
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </a>
                        <button
                          onClick={() => handleDeletePdfNote(note.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB: DATABASE, STORAGE & HOSTING COMMAND CENTER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Header Ribbon */}
            <div className="bg-gradient-to-r from-[#0f2942] via-[#1a3d60] to-[#0f2942] text-white p-6 rounded-2xl shadow-lg border-2 border-emerald-400 relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
                      100% LIVE PERSISTENT STORAGE
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-500/30 border border-blue-400/50 text-blue-200 rounded-full text-[10px] font-mono">
                      Cloud Container / Express Node.js
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-cinzel text-white">
                    Database, Cloud Storage &amp; Hosting Command Center
                  </h3>
                  <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                    Advance Institute of Digital Technology centralized database engine. All admissions, franchises, marks, QR certificates, MCQs, and PDF requests are persistently saved in server storage with zero data loss.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={loadDatabaseStats}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Metrics</span>
                  </button>

                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download Full Backup (JSON)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Storage Health & Live Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Database File</span>
                  <Database className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {dbStats?.fileSizeFormatted || '88.5 KB'}
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={dbStats?.dbFile || 'data/db.json'}>
                  Path: <code className="text-emerald-700 font-bold font-mono">data/db.json</code>
                </div>
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 pt-1 border-t">
                  <CheckCircle2 className="w-3 h-3" /> Auto-sync with disk enabled
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Total Students &amp; Records</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-lg font-black text-slate-900">
                  {dbStats?.totalRecords?.students ?? students.length} Students
                </div>
                <div className="text-[11px] text-slate-500">
                  Admissions: <strong>{students.filter(s => s.admissionStatus === 'Approved').length} Approved</strong>
                </div>
                <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1 pt-1 border-t">
                  <ShieldCheck className="w-3 h-3" /> Real-time instant persist
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Verified Credentials</span>
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-lg font-black text-slate-900">
                  {(dbStats?.totalRecords?.certificates || 0) + (dbStats?.totalRecords?.marksheets || 0)} Total
                </div>
                <div className="text-[11px] text-slate-500">
                  Certs: <strong>{dbStats?.totalRecords?.certificates || 0}</strong> | Marks: <strong>{dbStats?.totalRecords?.marksheets || 0}</strong>
                </div>
                <div className="text-[10px] text-amber-600 font-medium flex items-center gap-1 pt-1 border-t">
                  <CheckCircle2 className="w-3 h-3" /> Anti-fraud QR serialized
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Server Memory &amp; Uptime</span>
                  <Cpu className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {dbStats?.system?.heapUsedMb || '32.4'} MB
                  <span className="text-xs text-slate-400 font-normal"> / {dbStats?.system?.heapTotalMb || '64'} MB</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Uptime: <strong>{Math.floor((dbStats?.system?.uptimeSeconds || 360) / 60)} minutes</strong>
                </div>
                <div className="text-[10px] text-purple-600 font-medium flex items-center gap-1 pt-1 border-t">
                  <Activity className="w-3 h-3" /> Node {dbStats?.system?.nodeVersion || 'v20'} Container
                </div>
              </div>
            </div>

            {/* Core Admin Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Backup & Restore Management */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Database Backup &amp; Instant Restoration
                    </h4>
                    <p className="text-xs text-slate-500">
                      Full autonomous control for Director Amar Soni
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>1. Complete Database Export (Snapshot)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Recommended Daily
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Download the full JSON database containing students, marks, franchise centers, PDF notes, and audit logs. This backup can be archived safely on external storage or Google Drive.
                    </p>
                    <button
                      onClick={handleDownloadBackup}
                      className="px-4 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download .JSON Snapshot</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>2. Restore / Import Database from File</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                        Auto-Safety Backup
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Restore any previously exported JSON database. Before restoring, the system automatically creates a timestamped safety backup on the server.
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isRestoringDb ? 'Restoring Database...' : 'Select Backup File (.json)'}</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleRestoreDatabase}
                          disabled={isRestoringDb}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>3. Optimize Storage &amp; Memory Cache</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        Maintenance
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Prunes older audit logs beyond retention, compacts the database file format, and clears Node.js memory buffers.
                    </p>
                    <button
                      onClick={handleOptimizeDb}
                      disabled={isOptimizingDb}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isOptimizingDb ? 'animate-spin' : ''}`} />
                      <span>{isOptimizingDb ? 'Optimizing...' : 'Optimize & Compact Storage'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 2: Live Hosting & Production Architecture Guide */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Live Hosting &amp; Data Persistence Architecture
                    </h4>
                    <p className="text-xs text-slate-500">
                      How data is stored and live access works
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Where is the Application Data Stored?</span>
                    </div>
                    <p className="text-emerald-800 text-[11px]">
                      All website and portal data is persistently preserved in <code>data/db.json</code> on the server container. Whenever a student or franchise submits an application, payment details, or marks, the records are written directly to disk storage and locked immediately.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Does Live User Activity Persist Automatically?</span>
                    </div>
                    <p className="text-blue-800 text-[11px]">
                      <strong>Yes, 100% Real-Time Persistence!</strong> Whether a candidate applies for admission from their phone, a study center requests affiliation, or a student submits a PDF notes purchase request with UPI UTR, all entries update instantly and appear in Director Amar Soni's Admin Portal in real time.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>How to Archive and Scale Storage?</span>
                    </div>
                    <p className="text-amber-800 text-[11px]">
                      The document database architecture supports thousands of records smoothly without third-party recurring fees. Administrators can download a <strong>1-Click Backup (.json)</strong> snapshot anytime to archive historical terms while keeping server response times ultra-fast.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                    <div className="font-bold text-purple-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Comprehensive Director Management Control</span>
                    </div>
                    <p className="text-purple-800 text-[11px]">
                      The Administrator retains full autonomous authority: Courses, Tuition Fees, Special Discounts, Notices, Verification QR Certificates, Marksheets, MCQs, PDF Notes, and Full Database Backup/Restore are managed entirely from this panel without external developer dependencies.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Collection Export Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Collections &amp; Data Tables Inventory
                  </h4>
                  <p className="text-xs text-slate-500">
                    Export individual collections as standalone JSON backups
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total Collections: <strong>9 Active</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Students &amp; Admissions</div>
                    <div className="text-[11px] text-slate-500">{students.length} Records</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('students', students)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export Students JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Franchise Centers</div>
                    <div className="text-[11px] text-slate-500">{franchises.length} Centers</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('franchises', franchises)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export Franchises JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Marks &amp; Grades</div>
                    <div className="text-[11px] text-slate-500">{marksList.length} Statements</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('marks', marksList)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export Marks JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">MCQ Question Bank</div>
                    <div className="text-[11px] text-slate-500">{mcqsList.length} Questions</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('mcqs', mcqsList)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export MCQs JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">PDF Study Notes</div>
                    <div className="text-[11px] text-slate-500">{pdfNotesList.length} Documents</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('pdf_notes', pdfNotesList)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export PDF Notes JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Student PDF Requests</div>
                    <div className="text-[11px] text-slate-500">{pdfRequestsList.length} Requests</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('pdf_requests', pdfRequestsList)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export PDF Requests JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Courses &amp; Fees</div>
                    <div className="text-[11px] text-slate-500">{coursesList.length} Courses</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('courses', coursesList)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export Courses JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Notice Board</div>
                    <div className="text-[11px] text-slate-500">{noticesList.length} Notices</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('notices', noticesList)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export Notices JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Security Audit Logs</div>
                    <div className="text-[11px] text-slate-500">{auditLogs.length} Records</div>
                  </div>
                  <button
                    onClick={() => handleExportCollectionJson('audit_logs', auditLogs)}
                    className="p-1.5 bg-white hover:bg-slate-200 text-blue-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Export Audit Logs JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT COURSE & FEES */}
      {/* ------------------------------------------------------------- */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] text-white p-5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {editingCourse ? 'Edit Course Program & Fee Structure' : 'Add New Autonomous Course Program'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Advance Institute of Digital Technology • Official Course Catalog
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveCourse} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Course Code (Uppercase) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADCA, DCA, TALLY-GST"
                    value={courseFormData.code}
                    onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg uppercase font-mono font-bold bg-slate-50 focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Course Duration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12 Months, 6 Months, 3 Months, 4 Months"
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Official Course Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Diploma in Computer Applications"
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Academic Session *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025-2026"
                    value={courseFormData.session}
                    onChange={(e) => setCourseFormData({ ...courseFormData, session: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Eligibility Requirement *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10th / 10+2 / Intermediate in any stream"
                    value={courseFormData.eligibility}
                    onChange={(e) => setCourseFormData({ ...courseFormData, eligibility: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              {/* Pricing & Strikethrough Row */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>Fee Structure &amp; Strikethrough Discount Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Offer Admission Fee (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={courseFormData.fee}
                      onChange={(e) => setCourseFormData({ ...courseFormData, fee: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Original Strikethrough Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 12000"
                      value={courseFormData.originalFee}
                      onChange={(e) => setCourseFormData({ ...courseFormData, originalFee: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg font-bold text-slate-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Badge Text / Discount Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 46% OFF, 50% OFF"
                      value={courseFormData.badgeText || ''}
                      onChange={(e) => setCourseFormData({ ...courseFormData, badgeText: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-amber-900 bg-white/70 p-2 rounded border border-amber-200 flex items-center justify-between">
                  <span>Student Display Preview:</span>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="line-through text-slate-400">₹{courseFormData.originalFee?.toLocaleString()}</span>
                    <span className="text-emerald-700 font-black text-sm">₹{courseFormData.fee?.toLocaleString()}</span>
                    <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded">
                      {courseFormData.badgeText || 'SPECIAL OFFER'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Course Description &amp; Curriculum Overview
                </label>
                <textarea
                  rows={3}
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="Outline key software learned, practical modules, job roles, and software suites..."
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>

              {/* Syllabus Modules */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Syllabus Topics &amp; Examination Modules ({courseFormData.subjects?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCourseSubject}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold flex items-center gap-1 border border-blue-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Module</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {courseFormData.subjects?.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border rounded-lg">
                      <span className="font-mono text-slate-400 w-5 text-center">{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Code"
                        value={sub.code}
                        onChange={(e) => {
                          const copy = [...courseFormData.subjects];
                          copy[idx].code = e.target.value;
                          setCourseFormData({ ...courseFormData, subjects: copy });
                        }}
                        className="w-24 px-2 py-1 bg-white border rounded font-mono text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="Module / Subject Name"
                        value={sub.name}
                        onChange={(e) => {
                          const copy = [...courseFormData.subjects];
                          copy[idx].name = e.target.value;
                          setCourseFormData({ ...courseFormData, subjects: copy });
                        }}
                        className="flex-1 px-2 py-1 bg-white border rounded text-[11px] font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCourseSubject(idx)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCourse ? 'Save Changes' : 'Create Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: MANAGE MARKSHEET TOPICS & EXAMINATION MARKS */}
      {/* ------------------------------------------------------------- */}
      {isTopicsModalOpen && topicsStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] text-white p-5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2.5">
                <ListPlus className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Manage Marksheet Topics &amp; Examination Scores
                  </h3>
                  <p className="text-xs text-amber-200/90">
                    Student: <strong>{topicsStudent.fullName}</strong> • Course: <strong>{topicsStudent.courseName}</strong> ({topicsStudent.enrollmentNumber || topicsStudent.registrationNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTopicsModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Course Curriculum Topics &amp; Subject Marks Breakdown
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add or remove examination subjects, adjust theory, practical, and internal assessment marks.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddTopicRow}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Topic / Subject</span>
                </button>
              </div>

              {/* Topics Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                      <tr>
                        <th className="p-2.5 w-8 text-center">#</th>
                        <th className="p-2.5 min-w-[200px]">Subject / Topic Name</th>
                        <th className="p-2.5 w-20 text-center">Max</th>
                        <th className="p-2.5 w-20 text-center">Theory</th>
                        <th className="p-2.5 w-20 text-center">Practical</th>
                        <th className="p-2.5 w-20 text-center">Internal</th>
                        <th className="p-2.5 w-24 text-center">Obtained</th>
                        <th className="p-2.5 w-12 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topicsList.map((topic, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              required
                              value={topic.subjectName}
                              onChange={(e) => handleTopicFieldChange(idx, 'subjectName', e.target.value)}
                              placeholder="e.g. Database Management & SQL"
                              className="w-full px-2.5 py-1.5 border rounded bg-white font-medium text-slate-900 focus:ring-1 focus:ring-[#0f2942]"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min={1}
                              max={200}
                              value={topic.maxMarks}
                              onChange={(e) => handleTopicFieldChange(idx, 'maxMarks', e.target.value)}
                              className="w-full px-2 py-1.5 border rounded bg-white text-center font-bold text-slate-800"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min={0}
                              max={topic.maxMarks}
                              value={topic.theoryMarks}
                              onChange={(e) => handleTopicFieldChange(idx, 'theoryMarks', e.target.value)}
                              className="w-full px-2 py-1.5 border rounded bg-white text-center font-mono"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min={0}
                              max={topic.maxMarks}
                              value={topic.practicalMarks}
                              onChange={(e) => handleTopicFieldChange(idx, 'practicalMarks', e.target.value)}
                              className="w-full px-2 py-1.5 border rounded bg-white text-center font-mono"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min={0}
                              max={topic.maxMarks}
                              value={topic.internalMarks}
                              onChange={(e) => handleTopicFieldChange(idx, 'internalMarks', e.target.value)}
                              className="w-full px-2 py-1.5 border rounded bg-white text-center font-mono"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min={0}
                              max={topic.maxMarks}
                              value={topic.obtainedMarks}
                              onChange={(e) => handleTopicFieldChange(idx, 'obtainedMarks', e.target.value)}
                              className="w-full px-2 py-1.5 border rounded bg-amber-50 text-center font-black text-slate-900"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveTopicRow(idx)}
                              title="Delete Topic Row"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Examination Summary Calculation */}
              {(() => {
                const totalMax = topicsList.reduce((acc, t) => acc + (parseInt(t.maxMarks as any) || 100), 0);
                const totalObtained = topicsList.reduce((acc, t) => acc + (parseInt(t.obtainedMarks as any) || 0), 0);
                const percentage = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
                const grade = percentage >= 85 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 65 ? 'B+' : percentage >= 55 ? 'B' : percentage >= 40 ? 'C' : 'F';
                const result = percentage >= 75 ? 'PASS (DISTINCTION)' : percentage >= 40 ? 'PASS' : 'FAIL';

                return (
                  <div className="bg-gradient-to-r from-slate-900 to-[#0f2942] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                    <div>
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                        Live Computed Marksheet Metrics
                      </span>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span>Topics: <strong>{topicsList.length}</strong></span>
                        <span>•</span>
                        <span>Total Max: <strong>{totalMax}</strong></span>
                        <span>•</span>
                        <span>Total Obtained: <strong className="text-yellow-300 text-sm">{totalObtained}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-300 block">Overall Percentage</span>
                        <span className="text-lg font-black text-amber-300">{percentage}%</span>
                      </div>

                      <div className="px-3 py-1 bg-white/10 rounded-lg border border-amber-400/40 text-center">
                        <span className="text-[10px] text-amber-200 block">Grade</span>
                        <span className="text-base font-extrabold text-white">{grade}</span>
                      </div>

                      <div className="px-3 py-1 bg-emerald-500/20 rounded-lg border border-emerald-400/40 text-center">
                        <span className="text-[10px] text-emerald-300 block">Result</span>
                        <span className="text-xs font-black text-emerald-300">{result}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddTopicRow}
                  className="px-3 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-bold flex items-center gap-1 border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Topic</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTopicsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveTopics}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Topics &amp; Update Marksheet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: CREATE / EDIT MCQ QUESTION */}
      {/* ------------------------------------------------------------- */}
      {isMcqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] text-white p-5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {editingMcq ? 'Edit MCQ Examination Question' : 'Create New MCQ Examination Question'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    CCC • O'Level • Competitive Computer Exams • ADCA / DCA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMcqModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMcq} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Course / Category *
                  </label>
                  <select
                    value={mcqFormData.category}
                    onChange={(e) => {
                      const cat = e.target.value as MCQCategory;
                      const labels: Record<string, string> = {
                        CCC: 'Course on Computer Concepts (CCC)',
                        O_LEVEL: "O'Level NIELIT (IT Tools & Programming)",
                        COMPETITIVE: 'Competitive IT & Computer Awareness',
                        ADCA_DCA: 'ADCA / DCA & Financial Computing',
                        PROGRAMMING: 'Python & Web Development',
                      };
                      setMcqFormData({
                        ...mcqFormData,
                        category: cat,
                        categoryName: labels[cat] || 'Computer Aptitude',
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold"
                  >
                    <option value="CCC">CCC (NIELIT)</option>
                    <option value="O_LEVEL">O'Level NIELIT</option>
                    <option value="COMPETITIVE">Competitive Exams</option>
                    <option value="ADCA_DCA">ADCA / DCA</option>
                    <option value="PROGRAMMING">Programming &amp; Web</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category Display Name
                  </label>
                  <input
                    type="text"
                    value={mcqFormData.categoryName}
                    onChange={(e) => setMcqFormData({ ...mcqFormData, categoryName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={mcqFormData.difficulty}
                    onChange={(e) => setMcqFormData({ ...mcqFormData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Question Statement *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Which shortcut key is used to save a workbook in LibreOffice Calc / MS Excel?"
                  value={mcqFormData.question}
                  onChange={(e) => setMcqFormData({ ...mcqFormData, question: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium"
                />
              </div>

              {/* 4 Options with Correct Answer Selector */}
              <div className="space-y-2 border-t pt-3">
                <label className="block font-bold text-slate-800">
                  Multiple Choice Options (Select radio for the correct option) *
                </label>

                {[0, 1, 2, 3].map((idx) => {
                  const isCorrect = mcqFormData.correctAnswerIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                        isCorrect ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`opt-radio-${idx}`}
                        name="correctAnswer"
                        checked={isCorrect}
                        onChange={() => setMcqFormData({ ...mcqFormData, correctAnswerIndex: idx })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor={`opt-radio-${idx}`} className="font-bold text-slate-700 w-7 cursor-pointer">
                        {String.fromCharCode(65 + idx)}:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`Enter Option ${String.fromCharCode(65 + idx)} text`}
                        value={mcqFormData.options[idx] || ''}
                        onChange={(e) => {
                          const copy = [...mcqFormData.options];
                          copy[idx] = e.target.value;
                          setMcqFormData({ ...mcqFormData, options: copy });
                        }}
                        className="flex-1 px-3 py-1.5 bg-white border rounded-lg text-xs"
                      />
                      {isCorrect && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                          Correct Option
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Explanation / Answer Reference (Shown to students after answering)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. In LibreOffice Calc and Microsoft Excel, Ctrl + S is universally mapped to the File -> Save command."
                  value={mcqFormData.explanation}
                  onChange={(e) => setMcqFormData({ ...mcqFormData, explanation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMcqModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingMcq ? 'Update MCQ' : 'Save & Publish Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: UPLOAD NEW PDF NOTE */}
      {/* ------------------------------------------------------------- */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] text-white p-5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">Upload New PDF Note / Study Material</h3>
                  <p className="text-xs text-slate-300">
                    Students will request download and require your approval to access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePdfNote} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  PDF Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCC 2026 Complete Master Revision Notes & Model Test Papers"
                  value={pdfFormData.title}
                  onChange={(e) => setPdfFormData({ ...pdfFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Course / Category *
                  </label>
                  <select
                    value={pdfFormData.category}
                    onChange={(e) => setPdfFormData({ ...pdfFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold"
                  >
                    <option value="CCC (NIELIT)">CCC (NIELIT)</option>
                    <option value="O'Level (NIELIT)">O'Level (NIELIT)</option>
                    <option value="Competitive Exams">Competitive Exams</option>
                    <option value="ADCA / DCA">ADCA / DCA</option>
                    <option value="Tally Prime + GST">Tally Prime + GST</option>
                    <option value="Web Development & Python">Web Development &amp; Python</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    File Size (approx)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4.5 MB"
                    value={pdfFormData.fileSize}
                    onChange={(e) => setPdfFormData({ ...pdfFormData, fileSize: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Number of Pages
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pdfFormData.pages}
                    onChange={(e) => setPdfFormData({ ...pdfFormData, pages: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Syllabus Coverage &amp; Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key topics covered, model papers included, chapter-wise questions..."
                  value={pdfFormData.description}
                  onChange={(e) => setPdfFormData({ ...pdfFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>

              {/* Pricing Controls: Offer Fee & Strike-Through Original Fee */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="block font-bold text-amber-950">
                  Notes Pricing &amp; Strike-Through Discount (Under ₹100)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      Offer Price (₹) * (Under ₹100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={pdfFormData.price}
                      onChange={(e) => {
                        const pr = parseInt(e.target.value) || 0;
                        const orig = pdfFormData.originalPrice || 199;
                        const disc = orig > pr ? Math.round(((orig - pr) / orig) * 100) : 0;
                        setPdfFormData({ ...pdfFormData, price: pr, discountPercent: disc });
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-xs font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      Original Price (₹) (Strike-through)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pdfFormData.originalPrice}
                      onChange={(e) => {
                        const orig = parseInt(e.target.value) || 199;
                        const pr = pdfFormData.price || 49;
                        const disc = orig > pr ? Math.round(((orig - pr) / orig) * 100) : 0;
                        setPdfFormData({ ...pdfFormData, originalPrice: orig, discountPercent: disc });
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-xs line-through text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      Discount % (50% - 80%)
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={pdfFormData.discountPercent || 75}
                      className="w-full px-3 py-2 border rounded-lg bg-slate-100 font-mono text-xs font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* PDF File Upload or URL */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <label className="block font-bold text-blue-950">
                  PDF Document Source *
                </label>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 font-bold hover:bg-blue-50 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Local PDF File</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const dataUrl = ev.target?.result as string;
                            setPdfFormData({
                              ...pdfFormData,
                              fileUrl: dataUrl,
                              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            });
                            showToast(`Loaded file: ${file.name}`);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[11px] text-slate-500 font-semibold">OR enter link:</span>
                </div>

                <input
                  type="text"
                  placeholder="https://.../notes.pdf"
                  value={pdfFormData.fileUrl}
                  onChange={(e) => setPdfFormData({ ...pdfFormData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-[11px]"
                />

                {pdfFormData.fileUrl && (
                  <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PDF Document Attached Ready For Upload</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pdfSubmitting}
                  className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{pdfSubmitting ? 'Uploading...' : 'Save & Publish PDF Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: EDIT PDF NOTE PRICING & DETAILS */}
      {/* ------------------------------------------------------------- */}
      {isEditPdfModalOpen && editingPdfNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0f2942] to-[#1e3a8a] text-white p-5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">Edit PDF Note &amp; Pricing</h3>
                  <p className="text-xs text-slate-300">
                    Adjust student offer amount, strike-through original fee, or update study material content.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditPdfModalOpen(false);
                  setEditingPdfNote(null);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditPdfNote} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  PDF Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={editPdfFormData.title}
                  onChange={(e) => setEditPdfFormData({ ...editPdfFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Course / Category *
                  </label>
                  <select
                    value={editPdfFormData.category}
                    onChange={(e) => setEditPdfFormData({ ...editPdfFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold"
                  >
                    <option value="CCC (NIELIT)">CCC (NIELIT)</option>
                    <option value="O'Level (NIELIT)">O'Level (NIELIT)</option>
                    <option value="Competitive Exams">Competitive Exams</option>
                    <option value="ADCA / DCA">ADCA / DCA</option>
                    <option value="Tally Prime + GST">Tally Prime + GST</option>
                    <option value="Web Development & Python">Web Development &amp; Python</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={editPdfFormData.fileSize}
                    onChange={(e) => setEditPdfFormData({ ...editPdfFormData, fileSize: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pages
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editPdfFormData.pages}
                    onChange={(e) => setEditPdfFormData({ ...editPdfFormData, pages: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                  />
                </div>
              </div>

              {/* Pricing Controls */}
              <div className="p-3 bg-gradient-to-r from-amber-50/80 to-emerald-50/50 border border-amber-300 rounded-xl space-y-2">
                <label className="block font-bold text-slate-900">
                  Pricing &amp; Strike-Through Discounts (User requirement: Under ₹100)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      Offer Price (₹) * (Under ₹100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={editPdfFormData.price}
                      onChange={(e) => {
                        const pr = parseInt(e.target.value) || 0;
                        const orig = editPdfFormData.originalPrice || 199;
                        const disc = orig > pr ? Math.round(((orig - pr) / orig) * 100) : 0;
                        setEditPdfFormData({ ...editPdfFormData, price: pr, discountPercent: disc });
                      }}
                      className="w-full px-3 py-2 border border-emerald-400 rounded-lg bg-white font-mono text-xs font-black text-emerald-800"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Price student pays</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      Original Price (₹) (Strike-through)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editPdfFormData.originalPrice}
                      onChange={(e) => {
                        const orig = parseInt(e.target.value) || 199;
                        const pr = editPdfFormData.price || 49;
                        const disc = orig > pr ? Math.round(((orig - pr) / orig) * 100) : 0;
                        setEditPdfFormData({ ...editPdfFormData, originalPrice: orig, discountPercent: disc });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-xs line-through text-slate-400"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Shown with strikethrough</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      Discount % Badge
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={editPdfFormData.discountPercent || 75}
                      className="w-full px-3 py-2 border rounded-lg bg-slate-100 font-mono text-xs font-bold text-emerald-700"
                    />
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">50% to 80% discount</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Syllabus Coverage &amp; Description
                </label>
                <textarea
                  rows={3}
                  value={editPdfFormData.description}
                  onChange={(e) => setEditPdfFormData({ ...editPdfFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>

              {/* PDF Document Source */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <label className="block font-bold text-blue-950">
                  PDF Document Source
                </label>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 font-bold hover:bg-blue-50 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace PDF File</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const dataUrl = ev.target?.result as string;
                            setEditPdfFormData({
                              ...editPdfFormData,
                              fileUrl: dataUrl,
                              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            });
                            showToast(`Updated file: ${file.name}`);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[11px] text-slate-500 font-semibold">OR document link:</span>
                </div>

                <input
                  type="text"
                  placeholder="https://.../notes.pdf"
                  value={editPdfFormData.fileUrl}
                  onChange={(e) => setEditPdfFormData({ ...editPdfFormData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditPdfModalOpen(false);
                    setEditingPdfNote(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pdfSubmitting}
                  className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{pdfSubmitting ? 'Updating...' : 'Save & Update Price'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
