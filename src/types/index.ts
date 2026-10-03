export type UserRole = 'admin' | 'franchise' | 'student';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  mobile: string;
  referenceId?: string; // Student ID or Franchise ID
  franchiseCode?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  linkText?: string;
  linkUrl?: string;
  isActive: boolean;
  priority: 'normal' | 'urgent' | 'highlight';
  createdAt: string;
}

export interface InstituteSettings {
  instituteName: string;
  tagline: string;
  directorName: string;
  directorQualification: string;
  directorPhotoUrl?: string;
  email: string;
  mobile: string;
  address: string;
  website: string;
  logoUrl: string;
  directorSignatureUrl: string;
  controllerSignatureUrl: string;
  instituteStampUrl: string;
  watermarkText: string;
  accreditationText: string;
  offerTickerEnabled?: boolean;
  offerTickerText?: string;
  offerDurationHours?: number;
  notices?: NoticeItem[];
  gradingRules: {
    minPercent: number;
    grade: string;
    remark: string;
  }[];
}

export interface CourseSubject {
  code: string;
  name: string;
  maxMarks: number;
  minMarks: number;
  theoryMax: number;
  practicalMax: number;
  internalMax: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  duration: string;
  session: string;
  eligibility: string;
  fee: number;
  originalFee?: number;
  discountPercent?: number;
  badgeText?: string;
  description: string;
  subjects: CourseSubject[];
}

export interface Franchise {
  id: string;
  centerCode: string;
  centerName: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: string;
  district: string;
  state: string;
  status: 'pending' | 'approved' | 'suspended';
  approvedDate?: string;
  createdAt: string;
}

export type AdmissionStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
export type AcademicStatus = 
  | 'Admitted'
  | 'Course Ongoing'
  | 'Marks Pending'
  | 'Pending Admin Verification'
  | 'Marks Approved'
  | 'Completed';

export interface Student {
  id: string;
  registrationNumber: string; // e.g. ACI/REG/2026/000001
  enrollmentNumber: string;   // e.g. ACI/ENR/2026/000001
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
  address: string;
  courseId: string;
  courseName: string;
  duration: string;
  session: string;
  admissionDate: string;
  photoUrl: string;
  franchiseId: string; // or 'main_campus'
  franchiseName: string;
  franchiseCode: string;
  admissionStatus: AdmissionStatus;
  academicStatus: AcademicStatus;
  createdAt: string;
}

export interface SubjectMarksEntry {
  subjectName: string;
  maxMarks: number;
  minMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  internalMarks: number;
  obtainedMarks: number;
}

export type MarksStatus = 
  | 'DRAFT'
  | 'PENDING_ADMIN_VERIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED_FOR_CORRECTION';

export interface MarksRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  subjects: SubjectMarksEntry[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  grade: string;
  result: 'PASS' | 'FAIL' | 'DISTINCTION';
  status: MarksStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminRemarks?: string;
}

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

export interface CertificateRecord {
  id: string;
  certificateNumber: string; // e.g. ACI/CERT/2026/000001
  studentId: string;
  studentName: string;
  fatherName: string;
  courseName: string;
  duration: string;
  session: string;
  enrollmentNumber: string;
  registrationNumber: string;
  centerName: string;
  issueDate: string;
  grade: string;
  percentage: number;
  status: DocumentStatus;
  revocationReason?: string;
  templateVersion: number;
  qrCodeDataUrl: string;
  qrTargetUrl: string;
  generatedAt: string;
  approvedAt?: string;
}

export interface MarksheetRecord {
  id: string;
  marksheetNumber: string; // e.g. ACI/MARK/2026/000001
  studentId: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  courseName: string;
  duration: string;
  session: string;
  enrollmentNumber: string;
  registrationNumber: string;
  centerName: string;
  marksRecordId: string;
  subjects: SubjectMarksEntry[];
  totalMax: number;
  totalObtained: number;
  percentage: number;
  grade: string;
  result: string;
  issueDate: string;
  status: DocumentStatus;
  revocationReason?: string;
  templateVersion: number;
  qrCodeDataUrl: string;
  qrTargetUrl: string;
  generatedAt: string;
  approvedAt?: string;
}

export interface CertificateTemplateConfig {
  id: string;
  title: string;
  version: number;
  themeColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderStyle: 'ornate-gold' | 'classic-navy' | 'modern-double' | 'royal-crest';
  showInstituteLogo: boolean;
  showStudentPhoto: boolean;
  showDirectorSignature: boolean;
  showAuthorizedSignature: boolean;
  showSeal: boolean;
  showQrCode: boolean;
  showWatermark: boolean;
  watermarkLogoUrl?: string;
  watermarkOpacity?: number;
  watermarkSize?: number;
  certificateTitle: string;
  certificationText: string;
  completionText: string;
  directorTitle: string;
  headerText: string;
  subHeaderText: string;
  footerText: string;
  watermarkText: string;
  updatedAt: string;
}

export interface MarksheetTemplateConfig {
  id: string;
  title: string;
  version: number;
  themeColor: string;
  fontFamily: string;
  borderStyle: 'formal-academic' | 'classic-ruled' | 'modern-clean';
  showPhoto: boolean;
  showSeal: boolean;
  showQrCode: boolean;
  showWatermark: boolean;
  watermarkLogoUrl?: string;
  watermarkOpacity?: number;
  watermarkSize?: number;
  marksheetTitle: string;
  subHeaderTitle: string;
  gradingTableVisible: boolean;
  remarksVisible: boolean;
  footerNotice: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
