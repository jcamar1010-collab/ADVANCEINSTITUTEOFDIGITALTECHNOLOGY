import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import {
  User,
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
  NoticeItem,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  settings: InstituteSettings;
  users: User[];
  courses: Course[];
  franchises: Franchise[];
  students: Student[];
  marksRecords: MarksRecord[];
  certificates: CertificateRecord[];
  marksheets: MarksheetRecord[];
  certificateTemplates: CertificateTemplateConfig[];
  marksheetTemplates: MarksheetTemplateConfig[];
  notices: NoticeItem[];
  auditLogs: AuditLog[];
  counters: {
    reg: number;
    enr: number;
    cert: number;
    mark: number;
  };
}

// Default Institute Settings
const defaultSettings: InstituteSettings = {
  instituteName: 'ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY',
  tagline: 'Center for Excellence in Information Technology & Professional Computing',
  directorName: 'Mr. Amar Soni',
  directorQualification: 'MCA, Data Science',
  directorPhotoUrl: '/director-amar-soni.svg',
  email: 'advancecomputerinstitute2026@gmail.com',
  mobile: '6306242129, 8382819908',
  address: 'Near Grammar Academy Chauraha, Kaushalpuri Phase 1, Ayodhya Cantt, Ayodhya – 224001, Uttar Pradesh, India',
  website: 'advancecomputerinstitute.com',
  logoUrl: '/aidt-logo.svg',
  directorSignatureUrl: '/signature-amar-soni.svg',
  controllerSignatureUrl: '/signature-controller.svg',
  instituteStampUrl: '/stamp-official.svg',
  watermarkText: 'ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY AYODHYA CANTT',
  accreditationText: 'ISO 9001:2015 Certified Educational Institute & Registered Skill Training Entity',
  offerTickerEnabled: true,
  offerTickerText: '⚡ SPECIAL ADMISSION OFFER: Flat 20% EXTRA on Every Course This Week! Limited seats in Ayodhya Cantt batch.',
  offerDurationHours: 14,
  gradingRules: [
    { minPercent: 85, grade: 'A+', remark: 'Excellent / Distinction' },
    { minPercent: 75, grade: 'A', remark: 'Very Good' },
    { minPercent: 65, grade: 'B+', remark: 'Good' },
    { minPercent: 55, grade: 'B', remark: 'Satisfactory' },
    { minPercent: 40, grade: 'C', remark: 'Pass' },
    { minPercent: 0, grade: 'F', remark: 'Failed' },
  ],
};

const defaultNotices: NoticeItem[] = [
  {
    id: 'notice-1',
    title: 'Admissions Open for Session 2026-2027',
    content: 'Special discounted fee live now: ADCA ₹6,500 (was ₹12,000), DCA ₹4,500 (was ₹8,000), Tally Prime + GST ₹3,000 (was ₹6,000), Python & Data Science ₹12,000 (was ₹20,000)!',
    linkText: 'Apply Online',
    linkUrl: 'admission',
    isActive: true,
    priority: 'urgent',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice-2',
    title: 'Director Mr. Amar Soni (MCA, Data Science) Special Batches',
    content: 'Hands-on practical training in Machine Learning, Python, and Full-Stack Web Development at Ayodhya Cantt Main Campus.',
    linkText: 'Explore Courses',
    linkUrl: 'courses',
    isActive: true,
    priority: 'highlight',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice-3',
    title: 'Instant QR Code Verification System Activated',
    content: 'All marksheets and certificates issued by Advance Institute of Digital Technology are verifiable online 24/7 with anti-fraud QR authentication.',
    linkText: 'Verify Credential',
    linkUrl: 'verify',
    isActive: true,
    priority: 'normal',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice-4',
    title: 'Authorized Franchise Study Centers Invitation',
    content: 'Open an affiliated computer training center in your town/district with complete curriculum and autonomous certification rights.',
    linkText: 'Affiliate Center',
    linkUrl: 'franchise',
    isActive: true,
    priority: 'normal',
    createdAt: new Date().toISOString(),
  },
];

const defaultCourses: Course[] = [
  {
    id: 'course-adca',
    code: 'ADCA',
    name: 'Advanced Diploma in Computer Applications',
    duration: '12 Months',
    session: '2025-2026',
    eligibility: '10+2 / Intermediate in any stream',
    originalFee: 12000,
    fee: 6500,
    discountPercent: 46,
    badgeText: '46% OFF',
    description: 'Comprehensive 1-year master program covering Computer Fundamentals, MS Office, DTP (Photoshop), Financial Accounting (Tally Prime + GST), Web Designing, and Software Applications.',
    subjects: [
      { code: 'ADCA-101', name: 'Computer Fundamentals & OS', maxMarks: 100, minMarks: 40, theoryMax: 70, practicalMax: 20, internalMax: 10 },
      { code: 'ADCA-102', name: 'Office Automation (Word, Excel, PPT)', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
      { code: 'ADCA-103', name: 'Financial Accounting with Tally Prime', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
      { code: 'ADCA-104', name: 'Desktop Publishing (Photoshop, CorelDraw)', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
      { code: 'ADCA-105', name: 'Web Designing (HTML, CSS, JS)', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
      { code: 'ADCA-106', name: 'Project & Viva-Voce', maxMarks: 100, minMarks: 40, theoryMax: 30, practicalMax: 50, internalMax: 20 },
    ],
  },
  {
    id: 'course-dca',
    code: 'DCA',
    name: 'Diploma in Computer Applications',
    duration: '6 Months',
    session: '2025-2026',
    eligibility: '10th / High School or equivalent',
    originalFee: 8000,
    fee: 4500,
    discountPercent: 44,
    badgeText: '44% OFF',
    description: 'Essential computer literacy, Microsoft Office productivity suite, basic database operations, internet security utilities, and bilingual typing skills.',
    subjects: [
      { code: 'DCA-101', name: 'Computer Fundamentals & Windows', maxMarks: 100, minMarks: 40, theoryMax: 70, practicalMax: 20, internalMax: 10 },
      { code: 'DCA-102', name: 'MS Office & Internet Applications', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
      { code: 'DCA-103', name: 'Database Management Systems', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
      { code: 'DCA-104', name: 'Practical Lab & Viva', maxMarks: 100, minMarks: 40, theoryMax: 30, practicalMax: 50, internalMax: 20 },
    ],
  },
  {
    id: 'course-ccc',
    code: 'CCC',
    name: 'Course on Computer Concepts',
    duration: '3 Months',
    session: '2025-2026',
    eligibility: 'Open to all students and competitive exam aspirants',
    originalFee: 4500,
    fee: 3000,
    discountPercent: 33,
    badgeText: '33% OFF',
    description: 'Government certified standard syllabus covering Digital Financial Services, Cyber Security, LibreOffice Suite, GUI OS, and Digital Citizen literacy.',
    subjects: [
      { code: 'CCC-101', name: 'Introduction to Computer & GUI Based OS', maxMarks: 100, minMarks: 40, theoryMax: 80, practicalMax: 20, internalMax: 0 },
      { code: 'CCC-102', name: 'Elements of Word Processing & Spreadsheets', maxMarks: 100, minMarks: 40, theoryMax: 70, practicalMax: 30, internalMax: 0 },
      { code: 'CCC-103', name: 'Digital Financial Services & Cyber Ethics', maxMarks: 100, minMarks: 40, theoryMax: 80, practicalMax: 20, internalMax: 0 },
    ],
  },
  {
    id: 'course-python-ds',
    code: 'PYDS',
    name: 'Python & Data Science Specialist',
    duration: '6 Months',
    session: '2025-2026',
    eligibility: 'Graduate / Intermediate / Engineering / BCA in any stream',
    originalFee: 20000,
    fee: 12000,
    discountPercent: 40,
    badgeText: '40% OFF',
    description: 'Designed under personal guidance of Director Mr. Amar Soni (MCA, Data Science). Covers Python programming, NumPy, Pandas, Matplotlib, SQL data analytics, and Machine Learning project.',
    subjects: [
      { code: 'PY-101', name: 'Core & Advanced Python Programming', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
      { code: 'PY-102', name: 'Data Analysis with NumPy & Pandas', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
      { code: 'PY-103', name: 'Data Visualization & SQL for Analytics', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
      { code: 'PY-104', name: 'Capstone Data Science Project', maxMarks: 100, minMarks: 40, theoryMax: 20, practicalMax: 60, internalMax: 20 },
    ],
  },
  {
    id: 'course-tally-gst',
    code: 'TALLY-GST',
    name: 'Tally Prime + GST Professional',
    duration: '3 Months',
    session: '2025-2026',
    eligibility: '10th / 12th / Commerce / Arts or any aspirant',
    originalFee: 6000,
    fee: 3000,
    discountPercent: 50,
    badgeText: '50% OFF',
    description: 'Practical computerized accounting course covering Tally Prime, Voucher Entry, Inventory, GST Billing, E-Way Bill, TDS/TCS, Banking reconciliation, and Balance Sheet finalization.',
    subjects: [
      { code: 'TALLY-101', name: 'Accounting Fundamentals & Principles', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
      { code: 'TALLY-102', name: 'Tally Prime Operations & Inventory Control', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
      { code: 'TALLY-103', name: 'GST Invoicing, E-Way Bill & Return Filing', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
      { code: 'TALLY-104', name: 'Live Business Accounting Practical Project', maxMarks: 100, minMarks: 40, theoryMax: 20, practicalMax: 60, internalMax: 20 },
    ],
  },
  {
    id: 'course-web-dev',
    code: 'WEB-DEV',
    name: 'Web Designing & Frontend Development',
    duration: '4 Months',
    session: '2025-2026',
    eligibility: '10th / 12th / Diploma or any student',
    originalFee: 15000,
    fee: 8000,
    discountPercent: 47,
    badgeText: '47% OFF',
    description: 'Modern, high-demand web designing curriculum: HTML5 semantic structure, modern responsive CSS3/Flexbox/Grid, Tailwind CSS, JavaScript interactivity, Bootstrap 5, and live website hosting.',
    subjects: [
      { code: 'WEB-101', name: 'HTML5 & Modern Semantic Web Architecture', maxMarks: 100, minMarks: 40, theoryMax: 60, practicalMax: 30, internalMax: 10 },
      { code: 'WEB-102', name: 'Responsive Styling (CSS3, Tailwind, Flexbox)', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
      { code: 'WEB-103', name: 'JavaScript Programming & Interactive DOM', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
      { code: 'WEB-104', name: 'Live Website Hosting & Portfolio Project', maxMarks: 100, minMarks: 40, theoryMax: 20, practicalMax: 60, internalMax: 20 },
    ],
  },
];

const defaultFranchises: Franchise[] = [
  {
    id: 'fran-01',
    centerCode: 'ACI-AYD-01',
    centerName: 'Advance Institute of Digital Technology (Main Campus)',
    ownerName: 'Mr. Amar Soni',
    mobile: '6306242129',
    email: 'advancecomputerinstitute2026@gmail.com',
    address: 'Near Grammar Academy Chauraha, Kaushalpuri Phase 1, Ayodhya Cantt',
    district: 'Ayodhya',
    state: 'Uttar Pradesh',
    status: 'approved',
    approvedDate: '2024-01-15',
    createdAt: '2024-01-01',
  },
  {
    id: 'fran-02',
    centerCode: 'ACI-AYD-02',
    centerName: 'ACI Faizabad City Tech Center',
    ownerName: 'Ramesh Chandra Srivastava',
    mobile: '8382819908',
    email: 'franchise@advancecomputerinstitute.com',
    address: 'Civil Lines, Near Bus Station, Ayodhya',
    district: 'Ayodhya',
    state: 'Uttar Pradesh',
    status: 'approved',
    approvedDate: '2024-03-20',
    createdAt: '2024-03-10',
  },
];

const defaultUsers: User[] = [
  {
    id: 'user-admin',
    email: 'admin@advancecomputerinstitute.com',
    password: 'admin',
    role: 'admin',
    name: 'Amar Soni (Director)',
    mobile: '6306242129',
  },
  {
    id: 'user-franchise',
    email: 'franchise@advancecomputerinstitute.com',
    password: 'admin',
    role: 'franchise',
    name: 'ACI Faizabad City Tech Center',
    mobile: '8382819908',
    referenceId: 'fran-02',
    franchiseCode: 'ACI-AYD-02',
  },
  {
    id: 'user-student',
    email: 'student@advancecomputerinstitute.com',
    password: 'admin',
    role: 'student',
    name: 'Amit Kumar Verma',
    mobile: '9876543210',
    referenceId: 'stu-01',
  },
];

const defaultCertTemplate: CertificateTemplateConfig = {
  id: 'template-cert-v1',
  title: 'Official ACI Golden Heritage Certificate',
  version: 1,
  themeColor: '#0f2942',
  secondaryColor: '#c59b27',
  fontFamily: 'Cinzel',
  borderStyle: 'ornate-gold',
  showInstituteLogo: true,
  showStudentPhoto: true,
  showDirectorSignature: true,
  showAuthorizedSignature: true,
  showSeal: true,
  showQrCode: true,
  showWatermark: true,
  watermarkLogoUrl: '/aidt-logo.svg',
  watermarkOpacity: 0.08,
  watermarkSize: 420,
  certificateTitle: 'Certificate of Proficiency',
  certificationText: 'This is to officially certify that',
  completionText: 'having successfully completed the prescribed curriculum and passed the examination conducted by Advance Institute of Digital Technology for the program:',
  directorTitle: 'Founder & Director',
  headerText: 'ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY',
  subHeaderText: 'An Autonomous Institute for Advanced Computer Training & Professional Skills',
  footerText: 'This certificate can be verified online at advancecomputerinstitute.com/verify-certificate',
  watermarkText: 'ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY',
  updatedAt: new Date().toISOString(),
};

const defaultMarksheetTemplate: MarksheetTemplateConfig = {
  id: 'template-mark-v1',
  title: 'Official ACI Academic Transcript Marksheet',
  version: 1,
  themeColor: '#1e3a8a',
  fontFamily: 'Inter',
  borderStyle: 'formal-academic',
  showPhoto: true,
  showSeal: true,
  showQrCode: true,
  showWatermark: true,
  watermarkLogoUrl: '/aidt-logo.svg',
  watermarkOpacity: 0.07,
  watermarkSize: 380,
  marksheetTitle: 'Statement of Marks / Academic Transcript',
  subHeaderTitle: 'Issued by the Controller of Examinations, Advance Institute of Digital Technology',
  gradingTableVisible: true,
  remarksVisible: true,
  footerNotice: 'Official Marks Statement issued by Advance Institute of Digital Technology Ayodhya Cantt • Online Public Verification at advancecomputerinstitute.com/verify-marksheet',
  updatedAt: new Date().toISOString(),
};

function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (data.settings) {
        data.settings.logoUrl = '/aidt-logo.svg';
        data.settings.directorPhotoUrl = data.settings.directorPhotoUrl || '/director-amar-soni.svg';
        data.settings.offerTickerEnabled = data.settings.offerTickerEnabled ?? true;
        data.settings.offerTickerText = data.settings.offerTickerText || '⚡ SPECIAL ADMISSION OFFER: Flat 20% EXTRA on Every Course This Week! Limited seats in Ayodhya Cantt batch.';
        data.settings.offerDurationHours = data.settings.offerDurationHours || 14;
      }
      if (!data.notices || data.notices.length === 0) {
        data.notices = defaultNotices;
      }
      // Ensure all 6 updated courses with strikethrough original fees & discounted offer fees are present
      data.courses = defaultCourses;

      if (data.certificateTemplates && data.certificateTemplates[0]) {
        data.certificateTemplates[0] = { ...defaultCertTemplate, ...data.certificateTemplates[0], watermarkLogoUrl: '/aidt-logo.svg' };
      } else {
        data.certificateTemplates = [defaultCertTemplate];
      }
      if (data.marksheetTemplates && data.marksheetTemplates[0]) {
        data.marksheetTemplates[0] = { ...defaultMarksheetTemplate, ...data.marksheetTemplates[0], watermarkLogoUrl: '/aidt-logo.svg' };
      } else {
        data.marksheetTemplates = [defaultMarksheetTemplate];
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return data;
    } catch (e) {
      console.error('Failed reading existing db.json, generating defaults', e);
    }
  }

  // Pre-seed Students with distinct workflow statuses:
  // 1. stu-01: Approved + Certificate & Marksheet generated
  // 2. stu-02: Pending Admin Verification
  // 3. stu-03: Under Review Admission
  const stu01: Student = {
    id: 'stu-01',
    registrationNumber: 'ACI/REG/2026/000001',
    enrollmentNumber: 'ACI/ENR/2026/000001',
    fullName: 'Amit Kumar Verma',
    fatherName: 'Ram Shanker Verma',
    motherName: 'Sunita Devi',
    dob: '2002-05-14',
    gender: 'Male',
    mobile: '9876543210',
    email: 'amit.verma@example.com',
    address: 'Village Devkali, Ayodhya, UP',
    courseId: 'course-adca',
    courseName: 'Advanced Diploma in Computer Applications',
    duration: '12 Months',
    session: '2025-2026',
    admissionDate: '2025-01-10',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
    franchiseId: 'fran-02',
    franchiseName: 'ACI Faizabad City Tech Center',
    franchiseCode: 'ACI-AYD-02',
    admissionStatus: 'Approved',
    academicStatus: 'Completed',
    createdAt: '2025-01-10T10:00:00.000Z',
  };

  const stu02: Student = {
    id: 'stu-02',
    registrationNumber: 'ACI/REG/2026/000002',
    enrollmentNumber: 'ACI/ENR/2026/000002',
    fullName: 'Priya Sharma',
    fatherName: 'Dinesh Sharma',
    motherName: 'Reeta Sharma',
    dob: '2003-08-22',
    gender: 'Female',
    mobile: '9876543211',
    email: 'priya.sharma@example.com',
    address: 'Kaushalpuri Phase 1, Ayodhya Cantt, UP',
    courseId: 'course-dca',
    courseName: 'Diploma in Computer Applications',
    duration: '6 Months',
    session: '2025-2026',
    admissionDate: '2025-04-05',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    franchiseId: 'fran-02',
    franchiseName: 'ACI Faizabad City Tech Center',
    franchiseCode: 'ACI-AYD-02',
    admissionStatus: 'Approved',
    academicStatus: 'Pending Admin Verification',
    createdAt: '2025-04-05T11:00:00.000Z',
  };

  const stu03: Student = {
    id: 'stu-03',
    registrationNumber: 'ACI/REG/2026/000003',
    enrollmentNumber: 'ACI/ENR/2026/000003',
    fullName: 'Rahul Yadav',
    fatherName: 'Surendra Yadav',
    motherName: 'Kamla Devi',
    dob: '2001-11-30',
    gender: 'Male',
    mobile: '9876543212',
    email: 'rahul.yadav@example.com',
    address: 'Near Naka, Ayodhya Cantt, UP',
    courseId: 'course-python-ds',
    courseName: 'Python & Data Science Specialist',
    duration: '6 Months',
    session: '2025-2026',
    admissionDate: '2025-06-15',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    franchiseId: 'fran-01',
    franchiseName: 'Advance Institute of Digital Technology (Main Campus)',
    franchiseCode: 'ACI-AYD-01',
    admissionStatus: 'Under Review',
    academicStatus: 'Admitted',
    createdAt: '2025-06-15T09:30:00.000Z',
  };

  const marks01: MarksRecord = {
    id: 'marks-01',
    studentId: 'stu-01',
    courseId: 'course-adca',
    courseName: 'Advanced Diploma in Computer Applications',
    subjects: [
      { subjectName: 'Computer Fundamentals & OS', maxMarks: 100, minMarks: 40, theoryMarks: 62, practicalMarks: 18, internalMarks: 9, obtainedMarks: 89 },
      { subjectName: 'Office Automation (Word, Excel, PPT)', maxMarks: 100, minMarks: 40, theoryMarks: 54, practicalMarks: 28, internalMarks: 9, obtainedMarks: 91 },
      { subjectName: 'Financial Accounting with Tally Prime', maxMarks: 100, minMarks: 40, theoryMarks: 45, practicalMarks: 36, internalMarks: 9, obtainedMarks: 90 },
      { subjectName: 'Desktop Publishing (Photoshop, CorelDraw)', maxMarks: 100, minMarks: 40, theoryMarks: 44, practicalMarks: 35, internalMarks: 8, obtainedMarks: 87 },
      { subjectName: 'Web Designing (HTML, CSS, JS)', maxMarks: 100, minMarks: 40, theoryMarks: 52, practicalMarks: 27, internalMarks: 9, obtainedMarks: 88 },
      { subjectName: 'Project & Viva-Voce', maxMarks: 100, minMarks: 40, theoryMarks: 27, practicalMarks: 46, internalMarks: 19, obtainedMarks: 92 },
    ],
    totalMaxMarks: 600,
    totalObtainedMarks: 537,
    percentage: 89.5,
    grade: 'A+',
    result: 'DISTINCTION',
    status: 'APPROVED',
    submittedBy: 'ACI-AYD-02',
    submittedAt: '2026-01-10T14:20:00.000Z',
    reviewedBy: 'Amar Soni (Director)',
    reviewedAt: '2026-01-12T10:15:00.000Z',
    adminRemarks: 'Verified and approved with distinction.',
  };

  const marks02: MarksRecord = {
    id: 'marks-02',
    studentId: 'stu-02',
    courseId: 'course-dca',
    courseName: 'Diploma in Computer Applications',
    subjects: [
      { subjectName: 'Computer Fundamentals & Windows', maxMarks: 100, minMarks: 40, theoryMarks: 58, practicalMarks: 17, internalMarks: 8, obtainedMarks: 83 },
      { subjectName: 'MS Office & Internet Applications', maxMarks: 100, minMarks: 40, theoryMarks: 50, practicalMarks: 26, internalMarks: 8, obtainedMarks: 84 },
      { subjectName: 'Database Management Systems', maxMarks: 100, minMarks: 40, theoryMarks: 48, practicalMarks: 24, internalMarks: 9, obtainedMarks: 81 },
      { subjectName: 'Practical Lab & Viva', maxMarks: 100, minMarks: 40, theoryMarks: 25, practicalMarks: 44, internalMarks: 18, obtainedMarks: 87 },
    ],
    totalMaxMarks: 400,
    totalObtainedMarks: 335,
    percentage: 83.75,
    grade: 'A',
    result: 'PASS',
    status: 'PENDING_ADMIN_VERIFICATION',
    submittedBy: 'ACI-AYD-02',
    submittedAt: '2026-09-28T16:45:00.000Z',
  };

  const cert01: CertificateRecord = {
    id: 'cert-01',
    certificateNumber: 'ACI/CERT/2026/000001',
    studentId: 'stu-01',
    studentName: 'Amit Kumar Verma',
    fatherName: 'Ram Shanker Verma',
    courseName: 'Advanced Diploma in Computer Applications',
    duration: '12 Months',
    session: '2025-2026',
    enrollmentNumber: 'ACI/ENR/2026/000001',
    registrationNumber: 'ACI/REG/2026/000001',
    centerName: 'ACI Faizabad City Tech Center',
    issueDate: '2026-01-15',
    grade: 'A+',
    percentage: 89.5,
    status: 'APPROVED',
    templateVersion: 1,
    qrCodeDataUrl: '',
    qrTargetUrl: 'https://advancecomputerinstitute.com/verify-certificate/ACI/CERT/2026/000001',
    generatedAt: '2026-01-15T12:00:00.000Z',
    approvedAt: '2026-01-15T12:00:00.000Z',
  };

  const mark01: MarksheetRecord = {
    id: 'mark-01',
    marksheetNumber: 'ACI/MARK/2026/000001',
    studentId: 'stu-01',
    studentName: 'Amit Kumar Verma',
    fatherName: 'Ram Shanker Verma',
    motherName: 'Sunita Devi',
    courseName: 'Advanced Diploma in Computer Applications',
    duration: '12 Months',
    session: '2025-2026',
    enrollmentNumber: 'ACI/ENR/2026/000001',
    registrationNumber: 'ACI/REG/2026/000001',
    centerName: 'ACI Faizabad City Tech Center',
    marksRecordId: 'marks-01',
    subjects: marks01.subjects,
    totalMax: 600,
    totalObtained: 537,
    percentage: 89.5,
    grade: 'A+',
    result: 'PASS (DISTINCTION)',
    issueDate: '2026-01-15',
    status: 'APPROVED',
    templateVersion: 1,
    qrCodeDataUrl: '',
    qrTargetUrl: 'https://advancecomputerinstitute.com/verify-marksheet/ACI/MARK/2026/000001',
    generatedAt: '2026-01-15T12:00:00.000Z',
    approvedAt: '2026-01-15T12:00:00.000Z',
  };

  const initialDb: DatabaseSchema = {
    settings: defaultSettings,
    users: defaultUsers,
    courses: defaultCourses,
    franchises: defaultFranchises,
    students: [stu01, stu02, stu03],
    marksRecords: [marks01, marks02],
    certificates: [cert01],
    marksheets: [mark01],
    certificateTemplates: [defaultCertTemplate],
    marksheetTemplates: [defaultMarksheetTemplate],
    notices: defaultNotices,
    auditLogs: [
      {
        id: 'log-01',
        timestamp: '2026-01-12T10:15:00.000Z',
        userEmail: 'admin@advancecomputerinstitute.com',
        userRole: 'admin',
        action: 'APPROVED_MARKS',
        entity: 'MarksRecord',
        entityId: 'marks-01',
        details: 'Approved marks for Amit Kumar Verma (ACI/ENR/2026/000001)',
      },
      {
        id: 'log-02',
        timestamp: '2026-01-15T12:00:00.000Z',
        userEmail: 'admin@advancecomputerinstitute.com',
        userRole: 'admin',
        action: 'GENERATED_CERTIFICATE',
        entity: 'Certificate',
        entityId: 'cert-01',
        details: 'Issued official certificate ACI/CERT/2026/000001',
      },
    ],
    counters: {
      reg: 3,
      enr: 3,
      cert: 1,
      mark: 1,
    },
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

let db = initDatabase();

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function addAuditLog(userEmail: string, userRole: any, action: string, entity: string, entityId: string, details: string) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userEmail,
    userRole,
    action,
    entity,
    entityId,
    details,
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase();
}

async function generateQr(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      margin: 1,
      width: 240,
      color: {
        dark: '#0f2942',
        light: '#ffffff',
      },
    });
  } catch (err) {
    return '';
  }
}

// Ensure initial QR codes are generated
(async () => {
  for (const c of db.certificates) {
    if (!c.qrCodeDataUrl) {
      c.qrCodeDataUrl = await generateQr(c.qrTargetUrl);
    }
  }
  for (const m of db.marksheets) {
    if (!m.qrCodeDataUrl) {
      m.qrCodeDataUrl = await generateQr(m.qrTargetUrl);
    }
  }
  saveDatabase();
})();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper: Calculate grade and result
function calculateGradeAndResult(percentage: number, rules = db.settings.gradingRules) {
  for (const rule of rules) {
    if (percentage >= rule.minPercent) {
      const isPass = percentage >= 40;
      const isDistinction = percentage >= 85;
      return {
        grade: rule.grade,
        result: isDistinction ? 'DISTINCTION' : isPass ? 'PASS' : 'FAIL',
        remark: rule.remark,
      };
    }
  }
  return { grade: 'F', result: 'FAIL', remark: 'Failed' };
}

// --------------------------------------------------------------------------
// API ROUTES
// --------------------------------------------------------------------------

// Public Institute Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.settings);
});

// Update Settings (Admin Only)
app.put('/api/admin/settings', (req: Request, res: Response) => {
  const newSettings = req.body;
  db.settings = { ...db.settings, ...newSettings };
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'UPDATE_SETTINGS', 'Settings', 'institute_settings', 'Updated institute branding and grading rules');
  res.json({ success: true, settings: db.settings });
});

// Public Courses
app.get(['/api/public/courses', '/api/courses'], (_req: Request, res: Response) => {
  res.json(db.courses);
});

// Admin Add Course
app.post('/api/admin/courses', (req: Request, res: Response) => {
  const { code, name, duration, session, eligibility, fee, originalFee, discountPercent, badgeText, description, subjects } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Course code and name are required' });
  }
  const cleanCode = code.toUpperCase().trim();
  const id = `course-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const numFee = parseInt(fee) || 0;
  const numOrigFee = originalFee ? parseInt(originalFee) : Math.round(numFee * 1.5);
  const discount = discountPercent !== undefined ? parseInt(discountPercent) : Math.round(((numOrigFee - numFee) / numOrigFee) * 100);

  const newCourse: Course = {
    id,
    code: cleanCode,
    name: name.trim(),
    duration: duration?.trim() || '6 Months',
    session: session?.trim() || '2025-2026',
    eligibility: eligibility?.trim() || 'Open to all',
    fee: numFee,
    originalFee: numOrigFee,
    discountPercent: discount,
    badgeText: badgeText || `${discount}% OFF`,
    description: description?.trim() || '',
    subjects: Array.isArray(subjects) && subjects.length > 0 ? subjects : [
      { code: `${cleanCode}-101`, name: 'Module 1: Core Fundamentals', maxMarks: 100, minMarks: 40, theoryMax: 70, practicalMax: 20, internalMax: 10 },
      { code: `${cleanCode}-102`, name: 'Module 2: Practical Lab & Application', maxMarks: 100, minMarks: 40, theoryMax: 50, practicalMax: 40, internalMax: 10 },
    ],
  };

  db.courses.push(newCourse);
  saveDatabase();
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'CREATE_COURSE',
    'Course',
    newCourse.id,
    `Added new course: ${newCourse.name} (${newCourse.code}) with fee ₹${newCourse.fee}`
  );
  res.json({ success: true, course: newCourse, courses: db.courses });
});

// Admin Update Course
app.put('/api/admin/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const course = db.courses.find(c => c.id === id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const { code, name, duration, session, eligibility, fee, originalFee, discountPercent, badgeText, description, subjects } = req.body;

  if (code) course.code = code.toUpperCase().trim();
  if (name) course.name = name.trim();
  if (duration !== undefined) course.duration = duration.trim();
  if (session !== undefined) course.session = session.trim();
  if (eligibility !== undefined) course.eligibility = eligibility.trim();
  if (fee !== undefined) course.fee = parseInt(fee) || 0;
  if (originalFee !== undefined) course.originalFee = parseInt(originalFee) || 0;
  if (discountPercent !== undefined) {
    course.discountPercent = parseInt(discountPercent);
  } else if (course.originalFee && course.originalFee > course.fee) {
    course.discountPercent = Math.round(((course.originalFee - course.fee) / course.originalFee) * 100);
  }
  if (badgeText !== undefined) {
    course.badgeText = badgeText;
  } else if (course.discountPercent) {
    course.badgeText = `${course.discountPercent}% OFF`;
  }
  if (description !== undefined) course.description = description.trim();
  if (Array.isArray(subjects)) course.subjects = subjects;

  saveDatabase();
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'UPDATE_COURSE',
    'Course',
    course.id,
    `Updated course ${course.code} (${course.name}) details and fees`
  );
  res.json({ success: true, course, courses: db.courses });
});

// Admin Delete Course
app.delete('/api/admin/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.courses.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const deleted = db.courses.splice(idx, 1)[0];
  saveDatabase();
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'DELETE_COURSE',
    'Course',
    deleted.id,
    `Deleted course: ${deleted.name} (${deleted.code})`
  );
  res.json({ success: true, courses: db.courses });
});

// Public Notices
app.get('/api/notices', (_req: Request, res: Response) => {
  res.json(db.notices || []);
});

// Admin Add Notice
app.post('/api/admin/notices', (req: Request, res: Response) => {
  const { title, content, linkText, linkUrl, priority, isActive } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  const newNotice: NoticeItem = {
    id: `notice-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    linkText: linkText?.trim() || '',
    linkUrl: linkUrl?.trim() || '',
    priority: priority || 'normal',
    isActive: isActive !== false,
    createdAt: new Date().toISOString(),
  };
  if (!db.notices) db.notices = [];
  db.notices.unshift(newNotice);
  saveDatabase();
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'CREATE_NOTICE', 'Notice', newNotice.id, `Created notice: ${newNotice.title}`);
  res.json({ success: true, notice: newNotice, notices: db.notices });
});

// Admin Update Notice
app.put('/api/admin/notices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, linkText, linkUrl, priority, isActive } = req.body;
  if (!db.notices) db.notices = [];
  const index = db.notices.findIndex(n => n.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Notice not found' });
  }
  db.notices[index] = {
    ...db.notices[index],
    ...(title ? { title: title.trim() } : {}),
    ...(content ? { content: content.trim() } : {}),
    ...(linkText !== undefined ? { linkText: linkText.trim() } : {}),
    ...(linkUrl !== undefined ? { linkUrl: linkUrl.trim() } : {}),
    ...(priority ? { priority } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };
  saveDatabase();
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'UPDATE_NOTICE', 'Notice', id, `Updated notice: ${db.notices[index].title}`);
  res.json({ success: true, notice: db.notices[index], notices: db.notices });
});

// Admin Delete Notice
app.delete('/api/admin/notices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!db.notices) db.notices = [];
  const initialLen = db.notices.length;
  db.notices = db.notices.filter(n => n.id !== id);
  if (db.notices.length === initialLen) {
    return res.status(404).json({ error: 'Notice not found' });
  }
  saveDatabase();
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'DELETE_NOTICE', 'Notice', id, `Deleted notice: ${id}`);
  res.json({ success: true, notices: db.notices });
});

// Public Stats
app.get('/api/public/stats', (_req: Request, res: Response) => {
  res.json({
    totalStudents: db.students.length,
    approvedCertificates: db.certificates.filter(c => c.status === 'APPROVED').length,
    approvedMarksheets: db.marksheets.filter(m => m.status === 'APPROVED').length,
    activeCenters: db.franchises.filter(f => f.status === 'approved').length,
  });
});

// Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter identifier and password' });
  }

  const cleanIdent = identifier.trim().toLowerCase();

  // Find user by email or enrollment number or mobile
  const user = db.users.find(u => {
    const emailMatch = u.email.toLowerCase() === cleanIdent;
    const mobileMatch = u.mobile === identifier.trim();
    if (role && u.role !== role) return false;
    return emailMatch || mobileMatch;
  });

  // Also support student login directly with Enrollment Number or Registration Number
  if (!user && (role === 'student' || !role)) {
    const student = db.students.find(
      s => s.enrollmentNumber.toLowerCase() === cleanIdent || s.registrationNumber.toLowerCase() === cleanIdent
    );
    if (student) {
      return res.json({
        success: true,
        user: {
          id: `stu-user-${student.id}`,
          email: student.email || `${student.enrollmentNumber}@student.aci`,
          name: student.fullName,
          role: 'student',
          mobile: student.mobile,
          referenceId: student.id,
        },
      });
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or user not found' });
  }

  // Check password
  if (user.password && user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mobile: user.mobile,
      referenceId: user.referenceId,
      franchiseCode: user.franchiseCode,
    },
  });
});

// Student Public Admission Form
app.post('/api/admissions/apply', (req: Request, res: Response) => {
  const {
    fullName,
    fatherName,
    motherName,
    dob,
    gender,
    mobile,
    email,
    address,
    courseId,
    franchiseId,
    photoUrl,
  } = req.body;

  if (!fullName || !fatherName || !mobile || !courseId) {
    return res.status(400).json({ error: 'Missing required admission fields' });
  }

  const course = db.courses.find(c => c.id === courseId);
  if (!course) {
    return res.status(400).json({ error: 'Selected course not found' });
  }

  const franchise = db.franchises.find(f => f.id === (franchiseId || 'fran-01')) || db.franchises[0];

  db.counters.reg += 1;
  db.counters.enr += 1;
  const regNumber = `ACI/REG/2026/${String(db.counters.reg).padStart(6, '0')}`;
  const enrNumber = `ACI/ENR/2026/${String(db.counters.enr).padStart(6, '0')}`;

  const studentId = `stu-${Date.now()}`;
  const newStudent: Student = {
    id: studentId,
    registrationNumber: regNumber,
    enrollmentNumber: enrNumber,
    fullName: fullName.trim(),
    fatherName: fatherName.trim(),
    motherName: (motherName || '').trim(),
    dob: dob || '2000-01-01',
    gender: gender || 'Male',
    mobile: mobile.trim(),
    email: (email || '').trim(),
    address: (address || '').trim(),
    courseId: course.id,
    courseName: course.name,
    duration: course.duration,
    session: course.session,
    admissionDate: new Date().toISOString().split('T')[0],
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    franchiseId: franchise.id,
    franchiseName: franchise.centerName,
    franchiseCode: franchise.centerCode,
    admissionStatus: 'Pending',
    academicStatus: 'Admitted',
    createdAt: new Date().toISOString(),
  };

  db.students.unshift(newStudent);

  // Auto-create student user account for easy login
  db.users.push({
    id: `user-${studentId}`,
    email: newStudent.email || `${enrNumber.toLowerCase().replace(/\//g, '-')}`,
    password: newStudent.mobile.slice(-4) || '1234',
    role: 'student',
    name: newStudent.fullName,
    mobile: newStudent.mobile,
    referenceId: studentId,
  });

  addAuditLog(
    'system',
    'student',
    'NEW_ADMISSION',
    'Student',
    studentId,
    `New admission application submitted for ${newStudent.fullName} (${newStudent.registrationNumber})`
  );

  saveDatabase();

  res.json({
    success: true,
    student: newStudent,
    message: 'Admission submitted successfully. Pending Admin verification.',
  });
});

// Franchise Application Form (Public)
app.post('/api/franchise/apply', (req: Request, res: Response) => {
  const { centerName, ownerName, mobile, email, address, district, state } = req.body;
  if (!centerName || !ownerName || !mobile) {
    return res.status(400).json({ error: 'Please provide center name, owner name and contact details' });
  }

  const franCount = db.franchises.length + 1;
  const newFran: Franchise = {
    id: `fran-${Date.now()}`,
    centerCode: `ACI-AYD-${String(franCount).padStart(2, '0')}`,
    centerName: centerName.trim(),
    ownerName: ownerName.trim(),
    mobile: mobile.trim(),
    email: (email || '').trim(),
    address: address.trim(),
    district: district || 'Ayodhya',
    state: state || 'Uttar Pradesh',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.franchises.push(newFran);
  addAuditLog(
    'system',
    'franchise',
    'FRANCHISE_APPLICATION',
    'Franchise',
    newFran.id,
    `New franchise center application: ${newFran.centerName} (${newFran.centerCode})`
  );
  saveDatabase();

  res.json({ success: true, franchise: newFran });
});

// --------------------------------------------------------------------------
// PUBLIC VERIFICATION (Strict Read-Only & Verifiable)
// --------------------------------------------------------------------------

// Public Certificate Verification
app.get('/api/public/verify-certificate*', (req: Request, res: Response) => {
  const rawParam = req.params[0] || (req.query.id as string) || '';
  const cleanParam = rawParam.replace(/^\//, '');
  const query = decodeURIComponent(cleanParam).trim().toUpperCase();
  const normalizedQuery = query.replace(/-/g, '/');

  const cert = db.certificates.find(
    c => {
      const cNorm = c.certificateNumber.toUpperCase().replace(/-/g, '/');
      const eNorm = c.enrollmentNumber.toUpperCase().replace(/-/g, '/');
      const rNorm = c.registrationNumber.toUpperCase().replace(/-/g, '/');
      return cNorm === normalizedQuery || eNorm === normalizedQuery || rNorm === normalizedQuery;
    }
  );

  if (!cert) {
    return res.status(404).json({
      valid: false,
      message: 'No certificate found matching the provided identifier.',
    });
  }

  if (cert.status === 'REVOKED') {
    return res.json({
      valid: false,
      status: 'REVOKED',
      certificateNumber: cert.certificateNumber,
      studentName: cert.studentName,
      courseName: cert.courseName,
      revocationReason: cert.revocationReason || 'Certificate has been officially revoked by the Examination Authority.',
      message: 'DOCUMENT REVOKED. This certificate is invalid and has been revoked.',
    });
  }

  if (cert.status !== 'APPROVED') {
    return res.status(403).json({
      valid: false,
      message: 'Certificate is not approved for public display.',
    });
  }

  const student = db.students.find(s => s.id === cert.studentId);

  res.json({
    valid: true,
    status: 'VERIFIED',
    certificate: {
      ...cert,
      photoUrl: student?.photoUrl,
      instituteName: db.settings.instituteName,
      directorName: db.settings.directorName,
      directorQualification: db.settings.directorQualification,
      address: db.settings.address,
    },
  });
});

// Public Marksheet Verification
app.get('/api/public/verify-marksheet*', (req: Request, res: Response) => {
  const rawParam = req.params[0] || (req.query.id as string) || '';
  const cleanParam = rawParam.replace(/^\//, '');
  const query = decodeURIComponent(cleanParam).trim().toUpperCase();
  const normalizedQuery = query.replace(/-/g, '/');

  const mark = db.marksheets.find(
    m => {
      const mNorm = m.marksheetNumber.toUpperCase().replace(/-/g, '/');
      const eNorm = m.enrollmentNumber.toUpperCase().replace(/-/g, '/');
      const rNorm = m.registrationNumber.toUpperCase().replace(/-/g, '/');
      return mNorm === normalizedQuery || eNorm === normalizedQuery || rNorm === normalizedQuery;
    }
  );

  if (!mark) {
    return res.status(404).json({
      valid: false,
      message: 'No marksheet found matching the provided identifier.',
    });
  }

  if (mark.status === 'REVOKED') {
    return res.json({
      valid: false,
      status: 'REVOKED',
      marksheetNumber: mark.marksheetNumber,
      studentName: mark.studentName,
      courseName: mark.courseName,
      revocationReason: mark.revocationReason || 'Marksheet has been officially revoked by the Examination Authority.',
      message: 'DOCUMENT REVOKED. This marksheet is invalid and has been revoked.',
    });
  }

  if (mark.status !== 'APPROVED') {
    return res.status(403).json({
      valid: false,
      message: 'Marksheet is pending verification or not yet officially published.',
    });
  }

  const student = db.students.find(s => s.id === mark.studentId);

  res.json({
    valid: true,
    status: 'VERIFIED',
    marksheet: {
      ...mark,
      photoUrl: student?.photoUrl,
      instituteName: db.settings.instituteName,
      directorName: db.settings.directorName,
      directorQualification: db.settings.directorQualification,
      address: db.settings.address,
    },
  });
});

// --------------------------------------------------------------------------
// ADMIN ENDPOINTS
// --------------------------------------------------------------------------

// Admin Dashboard Summary
app.get('/api/admin/dashboard', (_req: Request, res: Response) => {
  const pendingAdmissions = db.students.filter(s => s.admissionStatus === 'Pending' || s.admissionStatus === 'Under Review').length;
  const pendingMarks = db.marksRecords.filter(m => m.status === 'PENDING_ADMIN_VERIFICATION').length;
  const pendingCertificates = db.certificates.filter(c => c.status === 'PENDING').length;
  const pendingMarksheets = db.marksheets.filter(m => m.status === 'PENDING').length;
  const approvedCertificates = db.certificates.filter(c => c.status === 'APPROVED').length;
  const approvedMarksheets = db.marksheets.filter(m => m.status === 'APPROVED').length;

  res.json({
    totalStudents: db.students.length,
    pendingAdmissions,
    pendingMarks,
    pendingCertificates,
    pendingMarksheets,
    approvedCertificates,
    approvedMarksheets,
    totalFranchises: db.franchises.length,
    activeFranchises: db.franchises.filter(f => f.status === 'approved').length,
    recentStudents: db.students.slice(0, 8),
    recentLogs: db.auditLogs.slice(0, 10),
  });
});

// Admin Students list with filters
app.get('/api/admin/students', (req: Request, res: Response) => {
  const { search, course, franchise, status } = req.query;
  let list = [...db.students];

  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(
      stu =>
        stu.fullName.toLowerCase().includes(s) ||
        stu.enrollmentNumber.toLowerCase().includes(s) ||
        stu.registrationNumber.toLowerCase().includes(s) ||
        stu.mobile.includes(s)
    );
  }

  if (course) {
    list = list.filter(stu => stu.courseId === course);
  }

  if (franchise) {
    list = list.filter(stu => stu.franchiseId === franchise);
  }

  if (status) {
    list = list.filter(stu => stu.admissionStatus === status || stu.academicStatus === status);
  }

  res.json(list);
});

// Admin Review Admission (Approve/Reject)
app.post('/api/admin/admissions/:id/review', (req: Request, res: Response) => {
  const { status, remarks } = req.body;
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  student.admissionStatus = status;
  if (status === 'Approved') {
    student.academicStatus = 'Course Ongoing';
  }

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    `ADMISSION_${status.toUpperCase()}`,
    'Student',
    student.id,
    `Admission for ${student.fullName} was marked ${status}. Remarks: ${remarks || 'None'}`
  );

  saveDatabase();
  res.json({ success: true, student });
});

// Admin Update Student Photo
app.put('/api/admin/students/:id/photo', (req: Request, res: Response) => {
  const { photoUrl } = req.body;
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  student.photoUrl = photoUrl;
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'UPDATE_STUDENT_PHOTO',
    'Student',
    student.id,
    `Updated passport photograph for student ${student.fullName} (${student.enrollmentNumber})`
  );

  saveDatabase();
  res.json({ success: true, student });
});

// Admin Marks List (Filter by pending, approved, etc.)
app.get('/api/admin/marks', (req: Request, res: Response) => {
  const { status } = req.query;
  let list = db.marksRecords.map(m => {
    const student = db.students.find(s => s.id === m.studentId);
    return {
      ...m,
      studentName: student?.fullName,
      enrollmentNumber: student?.enrollmentNumber,
      registrationNumber: student?.registrationNumber,
      franchiseName: student?.franchiseName,
      franchiseCode: student?.franchiseCode,
      photoUrl: student?.photoUrl,
    };
  });

  if (status) {
    list = list.filter(m => m.status === status);
  }

  res.json(list);
});

// Admin Review Marks (Approve, Reject, Return for correction)
app.post('/api/admin/marks/:id/review', (req: Request, res: Response) => {
  const { action, remarks } = req.body;
  const marks = db.marksRecords.find(m => m.id === req.params.id);
  if (!marks) {
    return res.status(404).json({ error: 'Marks record not found' });
  }

  const student = db.students.find(s => s.id === marks.studentId);

  if (action === 'APPROVE') {
    marks.status = 'APPROVED';
    marks.reviewedBy = 'Amar Soni (Director)';
    marks.reviewedAt = new Date().toISOString();
    marks.adminRemarks = remarks || 'Approved by Director';

    if (student) {
      student.academicStatus = 'Marks Approved';
    }

    addAuditLog(
      'admin@advancecomputerinstitute.com',
      'admin',
      'APPROVE_MARKS',
      'MarksRecord',
      marks.id,
      `Approved marks for ${student?.fullName || marks.studentId} (${marks.percentage}%, Grade ${marks.grade})`
    );
  } else if (action === 'REJECT') {
    marks.status = 'REJECTED';
    marks.adminRemarks = remarks || 'Rejected by Admin';
    if (student) {
      student.academicStatus = 'Marks Pending';
    }
    addAuditLog(
      'admin@advancecomputerinstitute.com',
      'admin',
      'REJECT_MARKS',
      'MarksRecord',
      marks.id,
      `Rejected marks for ${student?.fullName || marks.studentId}. Reason: ${remarks}`
    );
  } else if (action === 'RETURN_FOR_CORRECTION') {
    marks.status = 'RETURNED_FOR_CORRECTION';
    marks.adminRemarks = remarks;
    if (student) {
      student.academicStatus = 'Marks Pending';
    }
    addAuditLog(
      'admin@advancecomputerinstitute.com',
      'admin',
      'RETURN_MARKS',
      'MarksRecord',
      marks.id,
      `Returned marks for correction to franchise. Notes: ${remarks}`
    );
  }

  saveDatabase();
  res.json({ success: true, marks });
});

// Admin Add/Remove/Update Topics and Marks for a Student
app.put('/api/admin/students/:studentId/marksheet/topics', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { subjects } = req.body;

  if (!Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ error: 'At least one subject/topic is required' });
  }

  const student = db.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Parse and calculate obtained marks for each subject
  const parsedSubjects = subjects.map((sub: any) => {
    const maxMarks = parseInt(sub.maxMarks) || 100;
    const minMarks = parseInt(sub.minMarks) || 40;
    const theory = parseInt(sub.theoryMarks) || 0;
    const practical = parseInt(sub.practicalMarks) || 0;
    const internal = parseInt(sub.internalMarks) || 0;
    const totalSubjectObtained = sub.obtainedMarks !== undefined && sub.obtainedMarks !== ''
      ? Math.min(maxMarks, parseInt(sub.obtainedMarks) || 0)
      : Math.min(maxMarks, theory + practical + internal);

    return {
      subjectName: sub.subjectName || sub.name || 'Subject',
      maxMarks,
      minMarks,
      theoryMarks: theory,
      practicalMarks: practical,
      internalMarks: internal,
      obtainedMarks: totalSubjectObtained,
    };
  });

  const totalMax = parsedSubjects.reduce((acc: number, curr: any) => acc + curr.maxMarks, 0);
  const totalObtained = parsedSubjects.reduce((acc: number, curr: any) => acc + curr.obtainedMarks, 0);
  const percentage = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
  const { grade, result } = calculateGradeAndResult(percentage);

  // Update or create MarksRecord
  let marks = db.marksRecords.find(m => m.studentId === studentId);
  if (!marks) {
    marks = {
      id: `marks-${Date.now()}`,
      studentId: student.id,
      courseId: student.courseId,
      courseName: student.courseName,
      subjects: parsedSubjects,
      totalMaxMarks: totalMax,
      totalObtainedMarks: totalObtained,
      percentage,
      grade,
      result: result as any,
      status: 'APPROVED',
      submittedBy: student.franchiseCode,
      submittedAt: new Date().toISOString(),
      reviewedBy: 'Amar Soni (Director)',
      reviewedAt: new Date().toISOString(),
      adminRemarks: 'Topics and scores configured by Admin',
    };
    db.marksRecords.unshift(marks);
  } else {
    marks.subjects = parsedSubjects;
    marks.totalMaxMarks = totalMax;
    marks.totalObtainedMarks = totalObtained;
    marks.percentage = percentage;
    marks.grade = grade;
    marks.result = result as any;
    marks.status = 'APPROVED';
    marks.reviewedBy = 'Amar Soni (Director)';
    marks.reviewedAt = new Date().toISOString();
  }

  if (student) {
    student.academicStatus = 'Marks Approved';
  }

  // Also update Marksheet if already generated
  let marksheet = db.marksheets.find(m => m.studentId === studentId);
  if (marksheet) {
    marksheet.subjects = parsedSubjects;
    marksheet.totalMax = totalMax;
    marksheet.totalObtained = totalObtained;
    marksheet.percentage = percentage;
    marksheet.grade = grade;
    marksheet.result = result as any;
  }

  saveDatabase();
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'UPDATE_MARKSHEET_TOPICS',
    'Marksheet',
    marksheet ? marksheet.id : marks.id,
    `Updated marksheet topics for ${student.fullName} (${parsedSubjects.length} topics, ${percentage}%, Grade ${grade})`
  );

  res.json({
    success: true,
    marks,
    marksheet: marksheet || null,
    message: 'Marksheet topics and examination marks updated successfully'
  });
});

// Admin Generate Official Marksheet
app.post('/api/admin/students/:studentId/generate-marksheet', async (req: Request, res: Response) => {
  const student = db.students.find(s => s.id === req.params.studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const marks = db.marksRecords.find(m => m.studentId === student.id && m.status === 'APPROVED');
  if (!marks) {
    return res.status(400).json({ error: 'Official marks must be APPROVED by Admin before marksheet can be generated' });
  }

  // Check if already exists
  let marksheet = db.marksheets.find(m => m.studentId === student.id);
  if (marksheet && marksheet.status === 'APPROVED') {
    return res.json({ success: true, marksheet, message: 'Marksheet already generated and approved' });
  }

  db.counters.mark += 1;
  const markNumber = `ACI/MARK/2026/${String(db.counters.mark).padStart(6, '0')}`;
  const targetUrl = `https://advancecomputerinstitute.com/verify-marksheet/${markNumber}`;
  const qrDataUrl = await generateQr(targetUrl);

  marksheet = {
    id: `mark-${Date.now()}`,
    marksheetNumber: markNumber,
    studentId: student.id,
    studentName: student.fullName,
    fatherName: student.fatherName,
    motherName: student.motherName,
    courseName: student.courseName,
    duration: student.duration,
    session: student.session,
    enrollmentNumber: student.enrollmentNumber,
    registrationNumber: student.registrationNumber,
    centerName: student.franchiseName,
    marksRecordId: marks.id,
    subjects: marks.subjects,
    totalMax: marks.totalMaxMarks,
    totalObtained: marks.totalObtainedMarks,
    percentage: marks.percentage,
    grade: marks.grade,
    result: marks.result,
    issueDate: new Date().toISOString().split('T')[0],
    status: 'APPROVED',
    templateVersion: db.marksheetTemplates[0]?.version || 1,
    qrCodeDataUrl: qrDataUrl,
    qrTargetUrl: targetUrl,
    generatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  };

  db.marksheets.push(marksheet);
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'GENERATE_MARKSHEET',
    'Marksheet',
    marksheet.id,
    `Generated and published marksheet ${marksheet.marksheetNumber} for ${student.fullName}`
  );

  saveDatabase();
  res.json({ success: true, marksheet });
});

// Admin Generate Official Certificate
app.post('/api/admin/students/:studentId/generate-certificate', async (req: Request, res: Response) => {
  const student = db.students.find(s => s.id === req.params.studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const marks = db.marksRecords.find(m => m.studentId === student.id && m.status === 'APPROVED');
  if (!marks) {
    return res.status(400).json({ error: 'Official marks must be APPROVED by Admin before certificate can be generated' });
  }

  // Check if certificate already exists
  let cert = db.certificates.find(c => c.studentId === student.id);
  if (cert && cert.status === 'APPROVED') {
    return res.json({ success: true, certificate: cert, message: 'Certificate already generated and approved' });
  }

  db.counters.cert += 1;
  const certNumber = `ACI/CERT/2026/${String(db.counters.cert).padStart(6, '0')}`;
  const targetUrl = `https://advancecomputerinstitute.com/verify-certificate/${certNumber}`;
  const qrDataUrl = await generateQr(targetUrl);

  cert = {
    id: `cert-${Date.now()}`,
    certificateNumber: certNumber,
    studentId: student.id,
    studentName: student.fullName,
    fatherName: student.fatherName,
    courseName: student.courseName,
    duration: student.duration,
    session: student.session,
    enrollmentNumber: student.enrollmentNumber,
    registrationNumber: student.registrationNumber,
    centerName: student.franchiseName,
    issueDate: new Date().toISOString().split('T')[0],
    grade: marks.grade,
    percentage: marks.percentage,
    status: 'APPROVED',
    templateVersion: db.certificateTemplates[0]?.version || 1,
    qrCodeDataUrl: qrDataUrl,
    qrTargetUrl: targetUrl,
    generatedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  };

  db.certificates.push(cert);
  student.academicStatus = 'Completed';

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'GENERATE_CERTIFICATE',
    'Certificate',
    cert.id,
    `Generated and published certificate ${cert.certificateNumber} for ${student.fullName}`
  );

  saveDatabase();
  res.json({ success: true, certificate: cert });
});

// Admin Revoke Certificate or Marksheet
app.post('/api/admin/documents/revoke', (req: Request, res: Response) => {
  const { type, id, reason } = req.body;
  if (!id || !reason) {
    return res.status(400).json({ error: 'Document ID and reason are required' });
  }

  if (type === 'certificate') {
    const cert = db.certificates.find(c => c.id === id || c.certificateNumber === id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    cert.status = 'REVOKED';
    cert.revocationReason = reason;
    addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'REVOKE_CERTIFICATE', 'Certificate', cert.id, `Revoked certificate ${cert.certificateNumber}: ${reason}`);
    saveDatabase();
    return res.json({ success: true, document: cert });
  } else if (type === 'marksheet') {
    const mark = db.marksheets.find(m => m.id === id || m.marksheetNumber === id);
    if (!mark) return res.status(404).json({ error: 'Marksheet not found' });
    mark.status = 'REVOKED';
    mark.revocationReason = reason;
    addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'REVOKE_MARKSHEET', 'Marksheet', mark.id, `Revoked marksheet ${mark.marksheetNumber}: ${reason}`);
    saveDatabase();
    return res.json({ success: true, document: mark });
  }

  res.status(400).json({ error: 'Invalid document type' });
});

// Admin Certificate & Marksheet Templates
app.get('/api/admin/templates', (_req: Request, res: Response) => {
  res.json({
    certificateTemplates: db.certificateTemplates,
    marksheetTemplates: db.marksheetTemplates,
  });
});

app.put('/api/admin/templates/certificate', (req: Request, res: Response) => {
  const updated = req.body;
  updated.version = (db.certificateTemplates[0]?.version || 1) + 1;
  updated.updatedAt = new Date().toISOString();
  db.certificateTemplates[0] = updated;

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'UPDATE_TEMPLATE',
    'CertificateTemplate',
    updated.id,
    `Updated Certificate Template to Version ${updated.version}`
  );
  saveDatabase();
  res.json({ success: true, template: updated });
});

app.put('/api/admin/templates/marksheet', (req: Request, res: Response) => {
  const updated = req.body;
  updated.version = (db.marksheetTemplates[0]?.version || 1) + 1;
  updated.updatedAt = new Date().toISOString();
  db.marksheetTemplates[0] = updated;

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'UPDATE_TEMPLATE',
    'MarksheetTemplate',
    updated.id,
    `Updated Marksheet Template to Version ${updated.version}`
  );
  saveDatabase();
  res.json({ success: true, template: updated });
});

// Admin Franchises List & Status update
app.get('/api/admin/franchises', (_req: Request, res: Response) => {
  const list = db.franchises.map(f => {
    const studentsCount = db.students.filter(s => s.franchiseId === f.id).length;
    return { ...f, studentsCount };
  });
  res.json(list);
});

app.post('/api/admin/franchises/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const fran = db.franchises.find(f => f.id === req.params.id);
  if (!fran) return res.status(404).json({ error: 'Franchise not found' });

  fran.status = status;
  if (status === 'approved' && !fran.approvedDate) {
    fran.approvedDate = new Date().toISOString().split('T')[0];
  }

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    `FRANCHISE_${status.toUpperCase()}`,
    'Franchise',
    fran.id,
    `Franchise center ${fran.centerName} marked ${status}`
  );
  saveDatabase();
  res.json({ success: true, franchise: fran });
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', (_req: Request, res: Response) => {
  res.json(db.auditLogs);
});

// --------------------------------------------------------------------------
// FRANCHISE ENDPOINTS
// --------------------------------------------------------------------------

// Franchise Dashboard & Students (Strictly scoped to their center)
app.get('/api/franchise/data', (req: Request, res: Response) => {
  const franchiseId = (req.query.franchiseId as string) || 'fran-02';
  const franchise = db.franchises.find(f => f.id === franchiseId) || db.franchises[0];

  const students = db.students.filter(s => s.franchiseId === franchise.id);
  const studentIds = students.map(s => s.id);

  const marks = db.marksRecords.filter(m => studentIds.includes(m.studentId));

  // Franchise can ONLY see APPROVED certificates and marksheets!
  const certificates = db.certificates.filter(c => studentIds.includes(c.studentId) && c.status === 'APPROVED');
  const marksheets = db.marksheets.filter(m => studentIds.includes(m.studentId) && m.status === 'APPROVED');

  res.json({
    franchise,
    students,
    marks,
    approvedCertificates: certificates,
    approvedMarksheets: marksheets,
    courses: db.courses,
  });
});

// Franchise Add Student
app.post('/api/franchise/students', (req: Request, res: Response) => {
  const franchiseId = (req.body.franchiseId as string) || 'fran-02';
  const franchise = db.franchises.find(f => f.id === franchiseId) || db.franchises[0];

  const {
    fullName,
    fatherName,
    motherName,
    dob,
    gender,
    mobile,
    email,
    address,
    courseId,
    photoUrl,
  } = req.body;

  if (!fullName || !fatherName || !mobile || !courseId) {
    return res.status(400).json({ error: 'Please enter all mandatory fields' });
  }

  const course = db.courses.find(c => c.id === courseId);
  if (!course) return res.status(400).json({ error: 'Course not found' });

  db.counters.reg += 1;
  db.counters.enr += 1;
  const regNumber = `ACI/REG/2026/${String(db.counters.reg).padStart(6, '0')}`;
  const enrNumber = `ACI/ENR/2026/${String(db.counters.enr).padStart(6, '0')}`;

  const studentId = `stu-${Date.now()}`;
  const student: Student = {
    id: studentId,
    registrationNumber: regNumber,
    enrollmentNumber: enrNumber,
    fullName: fullName.trim(),
    fatherName: fatherName.trim(),
    motherName: (motherName || '').trim(),
    dob: dob || '2000-01-01',
    gender: gender || 'Male',
    mobile: mobile.trim(),
    email: (email || '').trim(),
    address: (address || '').trim(),
    courseId: course.id,
    courseName: course.name,
    duration: course.duration,
    session: course.session,
    admissionDate: new Date().toISOString().split('T')[0],
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    franchiseId: franchise.id,
    franchiseName: franchise.centerName,
    franchiseCode: franchise.centerCode,
    admissionStatus: 'Approved',
    academicStatus: 'Marks Pending',
    createdAt: new Date().toISOString(),
  };

  db.students.unshift(student);

  // Add student user login
  db.users.push({
    id: `user-${studentId}`,
    email: student.email || `${enrNumber.toLowerCase().replace(/\//g, '-')}`,
    password: student.mobile.slice(-4) || '1234',
    role: 'student',
    name: student.fullName,
    mobile: student.mobile,
    referenceId: studentId,
  });

  addAuditLog(
    franchise.email,
    'franchise',
    'FRANCHISE_ADD_STUDENT',
    'Student',
    student.id,
    `Franchise ${franchise.centerCode} added student ${student.fullName} (${student.enrollmentNumber})`
  );

  saveDatabase();
  res.json({ success: true, student });
});

// Franchise Enter Marks & SUBMIT FOR ADMIN VERIFICATION
app.post('/api/franchise/marks/submit', (req: Request, res: Response) => {
  const { studentId, subjects, franchiseCode } = req.body;
  const student = db.students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ error: 'Please enter subject marks' });
  }

  let totalMax = 0;
  let totalObtained = 0;

  const parsedSubjects = subjects.map((sub: any) => {
    const max = Number(sub.maxMarks) || 100;
    const min = Number(sub.minMarks) || 40;
    const theory = Number(sub.theoryMarks) || 0;
    const practical = Number(sub.practicalMarks) || 0;
    const internal = Number(sub.internalMarks) || 0;
    const obtained = theory + practical + internal;

    totalMax += max;
    totalObtained += obtained;

    return {
      subjectName: sub.subjectName,
      maxMarks: max,
      minMarks: min,
      theoryMarks: theory,
      practicalMarks: practical,
      internalMarks: internal,
      obtainedMarks: obtained,
    };
  });

  const percentage = Number(((totalObtained / totalMax) * 100).toFixed(2));
  const { grade, result } = calculateGradeAndResult(percentage);

  // Check if record already exists for student
  let marksRecord = db.marksRecords.find(m => m.studentId === student.id);

  if (marksRecord) {
    marksRecord.subjects = parsedSubjects;
    marksRecord.totalMaxMarks = totalMax;
    marksRecord.totalObtainedMarks = totalObtained;
    marksRecord.percentage = percentage;
    marksRecord.grade = grade;
    marksRecord.result = result as any;
    marksRecord.status = 'PENDING_ADMIN_VERIFICATION'; // ALWAYS transitions to pending
    marksRecord.submittedBy = franchiseCode || student.franchiseCode;
    marksRecord.submittedAt = new Date().toISOString();
  } else {
    marksRecord = {
      id: `marks-${Date.now()}`,
      studentId: student.id,
      courseId: student.courseId,
      courseName: student.courseName,
      subjects: parsedSubjects,
      totalMaxMarks: totalMax,
      totalObtainedMarks: totalObtained,
      percentage,
      grade,
      result: result as any,
      status: 'PENDING_ADMIN_VERIFICATION', // STRICT WORKFLOW
      submittedBy: franchiseCode || student.franchiseCode,
      submittedAt: new Date().toISOString(),
    };
    db.marksRecords.unshift(marksRecord);
  }

  student.academicStatus = 'Pending Admin Verification';

  addAuditLog(
    franchiseCode || 'franchise',
    'franchise',
    'SUBMIT_MARKS_FOR_VERIFICATION',
    'MarksRecord',
    marksRecord.id,
    `Marks submitted for admin verification for student ${student.fullName} (${student.enrollmentNumber}). Total: ${totalObtained}/${totalMax} (${percentage}%)`
  );

  saveDatabase();

  res.json({
    success: true,
    marksRecord,
    message: 'Marks submitted successfully. Currently PENDING ADMIN VERIFICATION. Documents will only generate after Admin approval.',
  });
});

// --------------------------------------------------------------------------
// STUDENT PORTAL (Strict Limited Access)
// --------------------------------------------------------------------------

app.get('/api/student/profile/:studentId', (req: Request, res: Response) => {
  const student = db.students.find(s => s.id === req.params.studentId);
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const marksRecord = db.marksRecords.find(m => m.studentId === student.id);

  // RULE 24: ONLY approved documents are visible to Student!
  const certificate = db.certificates.find(c => c.studentId === student.id && c.status === 'APPROVED');
  const marksheet = db.marksheets.find(m => m.studentId === student.id && m.status === 'APPROVED');

  res.json({
    student,
    marksRecord: marksRecord?.status === 'APPROVED' ? marksRecord : null,
    marksStatus: marksRecord?.status || 'NOT_SUBMITTED',
    certificate: certificate || null,
    marksheet: marksheet || null,
    isVerifiedAndApproved: Boolean(certificate && marksheet),
    instituteInfo: {
      instituteName: db.settings.instituteName,
      directorName: db.settings.directorName,
      address: db.settings.address,
      phone: db.settings.mobile,
      email: db.settings.email,
    },
  });
});

// --------------------------------------------------------------------------
// VITE INTEGRATION & SERVER START
// --------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY - AYODHYA CANTT`);
    console.log(`Director: Mr. Amar Soni (MCA, Data Science)`);
    console.log(`System running on http://0.0.0.0:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
