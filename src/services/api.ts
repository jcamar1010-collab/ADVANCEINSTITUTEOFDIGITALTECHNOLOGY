import {
  InstituteSettings,
  Course,
  Franchise,
  Student,
  MarksRecord,
  CertificateRecord,
  MarksheetRecord,
  CertificateTemplateConfig,
  MarksheetTemplateConfig,
  AuditLog,
  User,
  NoticeItem,
  MCQQuestion,
  PdfNote,
  PdfDownloadRequest,
  PasswordResetRequest,
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Public
  getSettings: async (): Promise<InstituteSettings> => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  getCourses: async (): Promise<Course[]> => {
    const res = await fetch(`${API_BASE}/public/courses`);
    return res.json();
  },

  addCourse: async (data: Partial<Course>) => {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateCourse: async (id: string, data: Partial<Course>) => {
    const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteCourse: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  updateMarksheetTopics: async (studentId: string, data: { subjects: any[] }) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/marksheet/topics`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getNotices: async (): Promise<NoticeItem[]> => {
    const res = await fetch(`${API_BASE}/notices`);
    return res.json();
  },

  addNotice: async (data: Partial<NoticeItem>) => {
    const res = await fetch(`${API_BASE}/admin/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateNotice: async (id: string, data: Partial<NoticeItem>) => {
    const res = await fetch(`${API_BASE}/admin/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteNotice: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/notices/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // MCQ Practice & Questions
  getMCQs: async (category?: string): Promise<MCQQuestion[]> => {
    const url = category && category !== 'ALL' ? `${API_BASE}/mcqs?category=${encodeURIComponent(category)}` : `${API_BASE}/mcqs`;
    const res = await fetch(url);
    return res.json();
  },

  addMCQ: async (data: Partial<MCQQuestion>) => {
    const res = await fetch(`${API_BASE}/admin/mcqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateMCQ: async (id: string, data: Partial<MCQQuestion>) => {
    const res = await fetch(`${API_BASE}/admin/mcqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteMCQ: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/mcqs/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // PDF Notes & Study Material
  getPdfNotes: async (): Promise<PdfNote[]> => {
    const res = await fetch(`${API_BASE}/notes`);
    return res.json();
  },

  addPdfNote: async (data: Partial<PdfNote>) => {
    const res = await fetch(`${API_BASE}/admin/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updatePdfNote: async (id: string, data: Partial<PdfNote>) => {
    const res = await fetch(`${API_BASE}/admin/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deletePdfNote: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/notes/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // PDF Download Requests & Admin Approvals
  requestPdfDownload: async (data: {
    pdfId: string;
    studentName: string;
    mobile: string;
    amountPaid?: number;
    utrNumber?: string;
    paymentScreenshotUrl?: string;
  }) => {
    const res = await fetch(`${API_BASE}/notes/request-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  checkPdfApproval: async (mobile: string, pdfId?: string) => {
    const url = pdfId
      ? `${API_BASE}/notes/check-approval?mobile=${encodeURIComponent(mobile)}&pdfId=${encodeURIComponent(pdfId)}`
      : `${API_BASE}/notes/check-approval?mobile=${encodeURIComponent(mobile)}`;
    const res = await fetch(url);
    return res.json();
  },

  getPdfRequests: async (): Promise<PdfDownloadRequest[]> => {
    const res = await fetch(`${API_BASE}/admin/pdf-requests`);
    return res.json();
  },

  reviewPdfRequest: async (id: string, action: 'APPROVE' | 'REJECT', remarks?: string) => {
    const res = await fetch(`${API_BASE}/admin/pdf-requests/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, remarks }),
    });
    return res.json();
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE}/public/stats`);
    return res.json();
  },

  verifyCertificate: async (certNo: string) => {
    const res = await fetch(`${API_BASE}/public/verify-certificate/${encodeURIComponent(certNo)}`);
    return res.json();
  },

  verifyMarksheet: async (markNo: string) => {
    const res = await fetch(`${API_BASE}/public/verify-marksheet/${encodeURIComponent(markNo)}`);
    return res.json();
  },

  applyAdmission: async (data: any) => {
    const res = await fetch(`${API_BASE}/admissions/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  applyFranchise: async (data: any) => {
    const res = await fetch(`${API_BASE}/franchise/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Auth
  login: async (credentials: { identifier: string; password?: string; role?: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // Admin
  getAdminDashboard: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    return res.json();
  },

  getAdminStudents: async (params?: { search?: string; course?: string; franchise?: string; status?: string }) => {
    const searchParams = new URLSearchParams(params as any);
    const res = await fetch(`${API_BASE}/admin/students?${searchParams.toString()}`);
    return res.json();
  },

  reviewAdmission: async (studentId: string, status: string, remarks?: string) => {
    const res = await fetch(`${API_BASE}/admin/admissions/${studentId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks }),
    });
    return res.json();
  },

  updateStudentPhoto: async (studentId: string, photoUrl: string) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/photo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl }),
    });
    return res.json();
  },

  getAdminMarks: async (status?: string) => {
    const url = status ? `${API_BASE}/admin/marks?status=${status}` : `${API_BASE}/admin/marks`;
    const res = await fetch(url);
    return res.json();
  },

  reviewMarks: async (marksId: string, action: 'APPROVE' | 'REJECT' | 'RETURN_FOR_CORRECTION', remarks?: string) => {
    const res = await fetch(`${API_BASE}/admin/marks/${marksId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, remarks }),
    });
    return res.json();
  },

  generateCertificate: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/generate-certificate`, {
      method: 'POST',
    });
    return res.json();
  },

  generateMarksheet: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/generate-marksheet`, {
      method: 'POST',
    });
    return res.json();
  },

  revokeDocument: async (type: 'certificate' | 'marksheet', id: string, reason: string) => {
    const res = await fetch(`${API_BASE}/admin/documents/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, reason }),
    });
    return res.json();
  },

  getTemplates: async () => {
    const res = await fetch(`${API_BASE}/admin/templates`);
    return res.json();
  },

  updateCertTemplate: async (template: CertificateTemplateConfig) => {
    const res = await fetch(`${API_BASE}/admin/templates/certificate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    return res.json();
  },

  updateMarksheetTemplate: async (template: MarksheetTemplateConfig) => {
    const res = await fetch(`${API_BASE}/admin/templates/marksheet`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    return res.json();
  },

  updateSettings: async (settings: Partial<InstituteSettings>) => {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  getFranchises: async () => {
    const res = await fetch(`${API_BASE}/admin/franchises`);
    return res.json();
  },

  updateFranchiseStatus: async (franchiseId: string, status: string) => {
    const res = await fetch(`${API_BASE}/admin/franchises/${franchiseId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    return res.json();
  },

  // Franchise
  getFranchiseData: async (franchiseId?: string) => {
    const url = franchiseId ? `${API_BASE}/franchise/data?franchiseId=${franchiseId}` : `${API_BASE}/franchise/data`;
    const res = await fetch(url);
    return res.json();
  },

  addFranchiseStudent: async (data: any) => {
    const res = await fetch(`${API_BASE}/franchise/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  submitFranchiseMarks: async (data: { studentId: string; subjects: any[]; franchiseCode?: string }) => {
    const res = await fetch(`${API_BASE}/franchise/marks/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Student
  getStudentProfile: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/student/profile/${studentId}`);
    return res.json();
  },

  // Database, Storage & System Control
  getDatabaseStats: async () => {
    const res = await fetch(`${API_BASE}/admin/database/stats`);
    return res.json();
  },

  downloadDatabaseBackup: () => {
    window.open(`${API_BASE}/admin/database/backup`, '_blank');
  },

  restoreDatabase: async (data: any) => {
    const res = await fetch(`${API_BASE}/admin/database/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  optimizeDatabase: async () => {
    const res = await fetch(`${API_BASE}/admin/database/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  // Password & User Access Control
  changePassword: async (data: { userId?: string; currentPassword?: string; newPassword: string; role?: string; referenceId?: string }) => {
    const res = await fetch(`${API_BASE}/user/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  requestForgotPassword: async (data: { role: 'student' | 'franchise'; identifier: string; registeredMobile: string }) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getPasswordResetRequests: async (): Promise<PasswordResetRequest[]> => {
    const res = await fetch(`${API_BASE}/admin/password-reset-requests`);
    return res.json();
  },

  resolvePasswordResetRequest: async (id: string, data?: { newPassword?: string; adminRemarks?: string }) => {
    const res = await fetch(`${API_BASE}/admin/password-reset-requests/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    });
    return res.json();
  },

  getUsersList: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/admin/users`);
    return res.json();
  },

  adminResetUserPassword: async (userId: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/admin/users/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword }),
    });
    return res.json();
  },

  adminAddUser: async (userData: any) => {
    const res = await fetch(`${API_BASE}/admin/users/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  adminRemoveUser: async (userId: string) => {
    const res = await fetch(`${API_BASE}/admin/users/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  adminUpdateUser: async (userId: string, data: any) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
