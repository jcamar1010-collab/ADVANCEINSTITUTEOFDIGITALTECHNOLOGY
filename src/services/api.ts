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
};
