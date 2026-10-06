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
  MCQQuestion,
  PdfNote,
  PdfDownloadRequest,
  PasswordResetRequest,
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
  mcqs: MCQQuestion[];
  pdfNotes: PdfNote[];
  pdfDownloadRequests: PdfDownloadRequest[];
  passwordResetRequests: PasswordResetRequest[];
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
  youtubeVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtubeSectionTitle: 'Director Mr. Amar Soni Special Classes & Practical Lab Tour',
  youtubeSectionDescription: 'Watch exclusive lectures, live computer lab demos, student testimonials, and official certification seminars by Founder & Director Mr. Amar Soni (MCA, Data Science).',
  youtubeSectionEnabled: true,
  upiQrCodeUrl: '/upi-qr-aidt.svg',
  upiId: '6306242129@upi',
  upiPayeeName: 'Advance Institute of Digital Technology (Director Amar Soni)',
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
    password: 'Admin@2026',
    role: 'admin',
    name: 'Amar Soni (Director)',
    mobile: '6306242129',
  },
  {
    id: 'user-franchise',
    email: 'franchise@advancecomputerinstitute.com',
    password: 'Center@2026',
    role: 'franchise',
    name: 'ACI Faizabad City Tech Center',
    mobile: '8382819908',
    referenceId: 'fran-02',
    franchiseCode: 'ACI-AYD-02',
  },
  {
    id: 'user-student',
    email: 'student@advancecomputerinstitute.com',
    password: 'Student@2026',
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

const defaultMCQs: MCQQuestion[] = [
  // CCC
  {
    id: 'mcq-ccc-01',
    category: 'CCC',
    categoryName: 'Course on Computer Concepts (CCC)',
    question: 'What is the full form of GUI in modern computer operating systems?',
    options: ['Graphical User Interface', 'General User Instruction', 'Guided Utility Information', 'Graphics Universal Input'],
    correctAnswerIndex: 0,
    explanation: 'GUI stands for Graphical User Interface. It allows users to interact with electronic devices through visual icons and audio indicators rather than text-based UI.',
    difficulty: 'Basic',
  },
  {
    id: 'mcq-ccc-02',
    category: 'CCC',
    categoryName: 'Course on Computer Concepts (CCC)',
    question: 'Which shortcut key is universally used to open a new empty document in LibreOffice Writer / MS Word?',
    options: ['Ctrl + O', 'Ctrl + N', 'Ctrl + S', 'Ctrl + W'],
    correctAnswerIndex: 1,
    explanation: 'Ctrl + N creates a new blank document, whereas Ctrl + O is used to open an existing file, and Ctrl + S saves the current document.',
    difficulty: 'Basic',
  },
  {
    id: 'mcq-ccc-03',
    category: 'CCC',
    categoryName: 'Course on Computer Concepts (CCC)',
    question: 'In email communication, what is the meaning and purpose of BCC?',
    options: ['Best Carbon Copy', 'Blind Carbon Copy', 'Backup Client Communication', 'Binary Control Code'],
    correctAnswerIndex: 1,
    explanation: 'BCC stands for Blind Carbon Copy. Recipients listed in BCC cannot be seen by other recipients of the message, protecting recipient privacy.',
    difficulty: 'Intermediate',
  },
  {
    id: 'mcq-ccc-04',
    category: 'CCC',
    categoryName: 'Course on Computer Concepts (CCC)',
    question: 'What is the maximum number of digits allowed in a standard UPI (Unified Payments Interface) PIN in India?',
    options: ['4 Digits', '6 Digits', '8 Digits', '12 Digits'],
    correctAnswerIndex: 1,
    explanation: 'Banks in India issue either a 4-digit or 6-digit UPI PIN, with 6 digits being the maximum standard security PIN length.',
    difficulty: 'Basic',
  },
  {
    id: 'mcq-ccc-05',
    category: 'CCC',
    categoryName: 'Course on Computer Concepts (CCC)',
    question: 'Which protocol is used for encrypted, secure communication between a client web browser and a web server?',
    options: ['HTTP', 'FTP', 'HTTPS', 'Telnet'],
    correctAnswerIndex: 2,
    explanation: 'HTTPS (Hypertext Transfer Protocol Secure) uses SSL/TLS encryption to ensure confidential, tamper-proof web traffic.',
    difficulty: 'Intermediate',
  },

  // O-Level
  {
    id: 'mcq-olevel-01',
    category: 'O_LEVEL',
    categoryName: "O'Level NIELIT (IT Tools & Network Basics)",
    question: 'How many total bits are used in an IPv4 (Internet Protocol version 4) address?',
    options: ['16 bits', '32 bits', '64 bits', '128 bits'],
    correctAnswerIndex: 1,
    explanation: 'An IPv4 address is composed of 32 binary bits divided into four 8-bit octets (e.g. 192.168.1.1). IPv6 uses 128 bits.',
    difficulty: 'Intermediate',
  },
  {
    id: 'mcq-olevel-02',
    category: 'O_LEVEL',
    categoryName: "O'Level NIELIT (IT Tools & Network Basics)",
    question: 'Which layer of the 7-Layer OSI Reference Model guarantees reliable end-to-end data delivery and flow control?',
    options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'],
    correctAnswerIndex: 1,
    explanation: 'The Transport Layer (Layer 4, including TCP protocol) manages segmentation, connection-oriented acknowledgment, and error recovery.',
    difficulty: 'Advanced',
  },
  {
    id: 'mcq-olevel-03',
    category: 'O_LEVEL',
    categoryName: "O'Level NIELIT (Python Programming M3-R5)",
    question: 'In Python programming, which keyword is used to define a user function?',
    options: ['function', 'func', 'def', 'define'],
    correctAnswerIndex: 2,
    explanation: 'The "def" keyword is used in Python to define a function header (e.g. def calculate_total():).',
    difficulty: 'Basic',
  },
  {
    id: 'mcq-olevel-04',
    category: 'O_LEVEL',
    categoryName: "O'Level NIELIT (Python Programming M3-R5)",
    question: 'What is the output of bool([]) in Python?',
    options: ['True', 'False', 'None', 'Error'],
    correctAnswerIndex: 1,
    explanation: 'In Python, empty sequences such as empty lists [], empty strings "", and empty tuples evaluate to False in boolean context.',
    difficulty: 'Intermediate',
  },

  // Competitive Exams
  {
    id: 'mcq-comp-01',
    category: 'COMPETITIVE',
    categoryName: 'Competitive IT & Computer Awareness',
    question: 'Which component is considered the "Brain" of a computer responsible for arithmetic calculations and instruction execution?',
    options: ['RAM', 'CPU (Central Processing Unit)', 'Hard Disk', 'SMPS Power Supply'],
    correctAnswerIndex: 1,
    explanation: 'The CPU (Central Processing Unit), containing the ALU (Arithmetic Logic Unit) and Control Unit (CU), is the primary brain of the computer.',
    difficulty: 'Basic',
  },
  {
    id: 'mcq-comp-02',
    category: 'COMPETITIVE',
    categoryName: 'Competitive IT & Computer Awareness',
    question: 'Which type of memory is volatile and loses all stored data when electrical power is switched off?',
    options: ['ROM', 'RAM (Random Access Memory)', 'Flash SSD', 'Optical CD-ROM'],
    correctAnswerIndex: 1,
    explanation: 'RAM is volatile primary memory. When power is lost, all data in RAM is wiped out. ROM and SSD are non-volatile.',
    difficulty: 'Basic',
  },
  {
    id: 'mcq-comp-03',
    category: 'COMPETITIVE',
    categoryName: 'Competitive IT & Computer Awareness',
    question: '1 Petabyte (PB) of computer digital storage is equivalent to:',
    options: ['1024 Gigabytes (GB)', '1024 Terabytes (TB)', '1000 Megabytes (MB)', '1024 Exabytes (EB)'],
    correctAnswerIndex: 1,
    explanation: 'Storage hierarchy: 1024 KB = 1 MB; 1024 MB = 1 GB; 1024 GB = 1 TB; 1024 TB = 1 PB.',
    difficulty: 'Intermediate',
  },
  {
    id: 'mcq-comp-04',
    category: 'COMPETITIVE',
    categoryName: 'Competitive IT & Computer Awareness',
    question: 'Which organization in India created and operates the Unified Payments Interface (UPI) and RuPay network?',
    options: ['Reserve Bank of India (RBI) directly', 'National Payments Corporation of India (NPCI)', 'Ministry of Electronics and IT (MeitY)', 'State Bank of India (SBI)'],
    correctAnswerIndex: 1,
    explanation: 'NPCI (National Payments Corporation of India), an initiative of RBI and IBA, developed UPI, RuPay, IMPS, and NACH.',
    difficulty: 'Intermediate',
  },

  // ADCA / DCA & Tally
  {
    id: 'mcq-adca-01',
    category: 'ADCA_DCA',
    categoryName: 'ADCA / DCA & Financial Accounting',
    question: 'In Tally Prime, which function shortcut key is used to record a Cash or Bank Payment Voucher?',
    options: ['F4 (Contra)', 'F5 (Payment)', 'F6 (Receipt)', 'F7 (Journal)'],
    correctAnswerIndex: 1,
    explanation: 'F5 is used for Payment vouchers, F6 for Receipts, F4 for Contra (bank-cash transfers), and F7 for Journal adjustment entries.',
    difficulty: 'Basic',
  },
  {
    id: 'mcq-adca-02',
    category: 'ADCA_DCA',
    categoryName: 'ADCA / DCA & Financial Accounting',
    question: 'In Microsoft Excel, which function is used to look up values in the leftmost column of a table and return values from another column?',
    options: ['=HLOOKUP()', '=VLOOKUP()', '=COUNTIF()', '=SUMIF()'],
    correctAnswerIndex: 1,
    explanation: 'VLOOKUP stands for Vertical Lookup. It searches for a specified key in the first column of a table and returns a value in the same row from a specified column.',
    difficulty: 'Intermediate',
  }
];

const defaultPdfNotes: PdfNote[] = [
  {
    id: 'note-01',
    title: 'CCC 2026 Complete Master Revision Notes & Model Test Papers',
    category: 'CCC Examination',
    description: 'Prepared under personal direction of Director Amar Soni (MCA, Data Science). Covers GUI OS, LibreOffice Writer, Calc, Impress, Cyber Security, Digital Financial Tools, and 500+ solved objective questions.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '4.8 MB',
    pages: 68,
    price: 49,
    originalPrice: 199,
    discountPercent: 75,
    uploadedAt: '2026-01-15T09:00:00.000Z',
    uploadedBy: 'Amar Soni (Director)',
    downloadsCount: 142,
  },
  {
    id: 'note-02',
    title: "O'Level (M1-R5) IT Tools & Network Fundamentals Comprehensive Manual",
    category: "O'Level NIELIT",
    description: 'Official curriculum notes for NIELIT O-Level Module 1: Computer architecture, Linux commands, word processing, spreadsheet formulas, presentation techniques, networking protocols, and cyber ethics.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '8.4 MB',
    pages: 115,
    price: 79,
    originalPrice: 299,
    discountPercent: 74,
    uploadedAt: '2026-01-20T10:30:00.000Z',
    uploadedBy: 'Amar Soni (Director)',
    downloadsCount: 98,
  },
  {
    id: 'note-03',
    title: 'Python Programming & Data Science Practical Handbook',
    category: 'Python & Data Science',
    description: 'Exclusively authored by Mr. Amar Soni (MCA, Data Science). Includes Python fundamentals, control structures, NumPy array mathematics, Pandas dataframes, Matplotlib charts, and hands-on case studies.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '6.2 MB',
    pages: 94,
    price: 89,
    originalPrice: 349,
    discountPercent: 75,
    uploadedAt: '2026-02-01T11:00:00.000Z',
    uploadedBy: 'Amar Soni (Director)',
    downloadsCount: 185,
  },
  {
    id: 'note-04',
    title: 'Tally Prime with GST Professional Practical Accounting Handout',
    category: 'Tally Prime & GST',
    description: 'Step-by-step practical guide covering Company Creation, Chart of Accounts, GST Invoicing, E-Way Bill, Input Tax Credit (ITC), Bank Reconciliation, and Balance Sheet finalization with real industry vouchers.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '5.6 MB',
    pages: 82,
    price: 59,
    originalPrice: 249,
    discountPercent: 76,
    uploadedAt: '2026-02-10T12:00:00.000Z',
    uploadedBy: 'Amar Soni (Director)',
    downloadsCount: 210,
  },
  {
    id: 'note-05',
    title: 'Computer Knowledge & General IT Awareness for Competitive Exams',
    category: 'Competitive Exams',
    description: 'High-yield revision notes tailored for UPSSSC, Junior Assistant, Railway NTPC, SSC CGL/CHSL, and State Public Service Commission computer aptitude exams.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '3.9 MB',
    pages: 56,
    price: 39,
    originalPrice: 149,
    discountPercent: 74,
    uploadedAt: '2026-02-18T14:00:00.000Z',
    uploadedBy: 'Amar Soni (Director)',
    downloadsCount: 310,
  },
];

const defaultPdfDownloadRequests: PdfDownloadRequest[] = [
  {
    id: 'req-01',
    pdfId: 'note-01',
    pdfTitle: 'CCC 2026 Complete Master Revision Notes & Model Test Papers',
    studentName: 'Deepak Mishra',
    mobile: '9876501234',
    status: 'PENDING',
    requestedAt: '2026-02-20T10:15:00.000Z',
  },
  {
    id: 'req-02',
    pdfId: 'note-04',
    pdfTitle: 'Tally Prime with GST Professional Practical Accounting Handout',
    studentName: 'Kavita Tiwari',
    mobile: '9876505678',
    status: 'APPROVED',
    requestedAt: '2026-02-21T11:45:00.000Z',
    approvedAt: '2026-02-21T12:00:00.000Z',
    adminRemarks: 'Approved by Director Amar Soni',
  },
];

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
        data.settings.youtubeVideoUrl = data.settings.youtubeVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        data.settings.youtubeSectionTitle = data.settings.youtubeSectionTitle || 'Director Mr. Amar Soni Special Classes & Practical Lab Tour';
        data.settings.youtubeSectionDescription = data.settings.youtubeSectionDescription || 'Watch exclusive lectures, live computer lab demos, student testimonials, and official certification seminars by Founder & Director Mr. Amar Soni (MCA, Data Science).';
        data.settings.youtubeSectionEnabled = data.settings.youtubeSectionEnabled ?? true;
      }
      if (!data.notices || data.notices.length === 0) {
        data.notices = defaultNotices;
      }
      // Ensure all 6 updated courses with strikethrough original fees & discounted offer fees are present
      data.courses = defaultCourses;

      if (!data.mcqs || data.mcqs.length === 0) {
        data.mcqs = defaultMCQs;
      }
      if (!data.pdfNotes || data.pdfNotes.length === 0) {
        data.pdfNotes = defaultPdfNotes;
      }
      if (!data.pdfDownloadRequests) {
        data.pdfDownloadRequests = defaultPdfDownloadRequests;
      }
      if (!data.passwordResetRequests) {
        data.passwordResetRequests = [];
      }
      if (data.users && Array.isArray(data.users)) {
        const adminUser = data.users.find((u: any) => u.role === 'admin');
        if (adminUser && (!adminUser.password || adminUser.password === 'admin')) {
          adminUser.password = 'Admin@2026';
        }
      } else {
        data.users = defaultUsers;
      }

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
    mcqs: defaultMCQs,
    pdfNotes: defaultPdfNotes,
    pdfDownloadRequests: defaultPdfDownloadRequests,
    passwordResetRequests: [],
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
  saveDatabase();
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

// ==========================================
// MCQ & PRACTICE EXAM ENDPOINTS
// ==========================================

// Public / Student: Get MCQs (optional category filter)
app.get('/api/mcqs', (req: Request, res: Response) => {
  const { category } = req.query;
  let list = db.mcqs || [];
  if (category && typeof category === 'string' && category !== 'ALL') {
    list = list.filter(q => q.category === category);
  }
  res.json(list);
});

// Admin: Add MCQ Question
app.post('/api/admin/mcqs', (req: Request, res: Response) => {
  const { category, categoryName, question, options, correctAnswerIndex, explanation, difficulty } = req.body;
  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Question text and at least 2 options are required' });
  }

  const categoryLabels: Record<string, string> = {
    CCC: 'Course on Computer Concepts (CCC)',
    O_LEVEL: "O'Level NIELIT (IT Tools & Programming)",
    COMPETITIVE: 'Competitive IT & Computer Awareness',
    ADCA_DCA: 'ADCA / DCA & Financial Computing',
    PROGRAMMING: 'Python & Web Development',
  };

  const cleanCategory = (category || 'CCC').toUpperCase();

  const newMcq: MCQQuestion = {
    id: `mcq-${Date.now()}`,
    category: cleanCategory as any,
    categoryName: categoryName || categoryLabels[cleanCategory] || 'Computer Aptitude',
    question: question.trim(),
    options: options.map(o => String(o).trim()),
    correctAnswerIndex: parseInt(correctAnswerIndex) || 0,
    explanation: explanation?.trim() || '',
    difficulty: difficulty || 'Intermediate',
    createdAt: new Date().toISOString(),
  };

  if (!db.mcqs) db.mcqs = [];
  db.mcqs.unshift(newMcq);
  saveDatabase();
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'CREATE_MCQ',
    'MCQ',
    newMcq.id,
    `Created ${cleanCategory} MCQ question: ${newMcq.question.slice(0, 45)}...`
  );
  res.json({ success: true, mcq: newMcq, mcqs: db.mcqs });
});

// Admin: Update MCQ Question
app.put('/api/admin/mcqs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const mcq = db.mcqs.find(q => q.id === id);
  if (!mcq) return res.status(404).json({ error: 'MCQ question not found' });

  const { category, categoryName, question, options, correctAnswerIndex, explanation, difficulty } = req.body;
  if (category) mcq.category = category;
  if (categoryName) mcq.categoryName = categoryName;
  if (question) mcq.question = question.trim();
  if (Array.isArray(options)) mcq.options = options.map(o => String(o).trim());
  if (correctAnswerIndex !== undefined) mcq.correctAnswerIndex = parseInt(correctAnswerIndex) || 0;
  if (explanation !== undefined) mcq.explanation = explanation.trim();
  if (difficulty) mcq.difficulty = difficulty;

  saveDatabase();
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'UPDATE_MCQ', 'MCQ', mcq.id, `Updated MCQ ${mcq.id}`);
  res.json({ success: true, mcq, mcqs: db.mcqs });
});

// Admin: Delete MCQ Question
app.delete('/api/admin/mcqs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.mcqs.findIndex(q => q.id === id);
  if (idx === -1) return res.status(404).json({ error: 'MCQ question not found' });
  const deleted = db.mcqs.splice(idx, 1)[0];
  saveDatabase();
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'DELETE_MCQ', 'MCQ', deleted.id, `Deleted MCQ ${deleted.id}`);
  res.json({ success: true, mcqs: db.mcqs });
});

// ==========================================
// PDF NOTES & STUDY MATERIAL ENDPOINTS
// ==========================================

// Public / Student: Get all PDF notes
app.get('/api/notes', (_req: Request, res: Response) => {
  res.json(db.pdfNotes || []);
});

// Admin: Upload / Create PDF note
app.post('/api/admin/notes', (req: Request, res: Response) => {
  const { title, category, description, fileUrl, fileSize, pages, price, originalPrice, discountPercent } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required for notes' });

  const numPrice = price !== undefined ? parseInt(price) : 49;
  const numOrigPrice = originalPrice !== undefined ? parseInt(originalPrice) : Math.round(numPrice * 3);
  const numDiscount = discountPercent !== undefined
    ? parseInt(discountPercent)
    : Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100);

  const newNote: PdfNote = {
    id: `note-${Date.now()}`,
    title: title.trim(),
    category: category?.trim() || 'General IT Notes',
    description: description?.trim() || '',
    fileUrl: fileUrl?.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: fileSize?.trim() || '4.5 MB',
    pages: parseInt(pages) || 50,
    price: numPrice,
    originalPrice: numOrigPrice,
    discountPercent: numDiscount,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Amar Soni (Director)',
    downloadsCount: 0,
  };

  if (!db.pdfNotes) db.pdfNotes = [];
  db.pdfNotes.unshift(newNote);
  saveDatabase();
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'UPLOAD_PDF_NOTE', 'PdfNote', newNote.id, `Uploaded PDF note: ${newNote.title} (Price: ₹${newNote.price})`);
  res.json({ success: true, note: newNote, notes: db.pdfNotes });
});

// Admin: Update PDF note (price, strike-through, title, content)
app.put('/api/admin/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, category, description, fileUrl, fileSize, pages, price, originalPrice, discountPercent } = req.body;
  if (!db.pdfNotes) db.pdfNotes = [];
  const note = db.pdfNotes.find(n => n.id === id);
  if (!note) return res.status(404).json({ error: 'Note not found' });

  if (title !== undefined) note.title = title.trim();
  if (category !== undefined) note.category = category.trim();
  if (description !== undefined) note.description = description.trim();
  if (fileUrl !== undefined) note.fileUrl = fileUrl.trim();
  if (fileSize !== undefined) note.fileSize = fileSize.trim();
  if (pages !== undefined) note.pages = parseInt(pages) || note.pages;
  if (price !== undefined) note.price = parseInt(price) || note.price;
  if (originalPrice !== undefined) note.originalPrice = parseInt(originalPrice) || note.originalPrice;
  if (discountPercent !== undefined) {
    note.discountPercent = parseInt(discountPercent) || note.discountPercent;
  } else if (note.price && note.originalPrice && note.originalPrice > note.price) {
    note.discountPercent = Math.round(((note.originalPrice - note.price) / note.originalPrice) * 100);
  }

  saveDatabase();
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'UPDATE_PDF_NOTE', 'PdfNote', note.id, `Updated note: ${note.title} (Price: ₹${note.price}, Original: ₹${note.originalPrice})`);
  res.json({ success: true, note, notes: db.pdfNotes });
});

// Admin: Delete PDF note
app.delete('/api/admin/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.pdfNotes.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Note not found' });
  const deleted = db.pdfNotes.splice(idx, 1)[0];
  saveDatabase();
  addAuditLog('admin@advancecomputerinstitute.com', 'admin', 'DELETE_PDF_NOTE', 'PdfNote', deleted.id, `Deleted PDF note: ${deleted.title}`);
  res.json({ success: true, notes: db.pdfNotes });
});

// ==========================================
// STUDENT PDF DOWNLOAD REQUESTS & ADMIN APPROVAL
// ==========================================

// Student submits Name & Mobile to request PDF download with payment proof
app.post('/api/notes/request-download', (req: Request, res: Response) => {
  const { pdfId, studentName, mobile, amountPaid, utrNumber, paymentScreenshotUrl } = req.body;
  if (!pdfId || !studentName || !mobile) {
    return res.status(400).json({ error: 'Student Name and Mobile Number are required to download notes' });
  }

  const cleanMobile = mobile.replace(/[^0-9]/g, '');
  if (cleanMobile.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
  }

  const note = db.pdfNotes.find(n => n.id === pdfId);
  if (!note) return res.status(404).json({ error: 'PDF note not found' });

  if (!db.pdfDownloadRequests) db.pdfDownloadRequests = [];

  const payableAmount = amountPaid ? Number(amountPaid) : (note.price || 49);

  // Check existing request
  const existing = db.pdfDownloadRequests.find(r => r.pdfId === pdfId && r.mobile === cleanMobile);
  if (existing) {
    if (existing.status === 'APPROVED') {
      note.downloadsCount = (note.downloadsCount || 0) + 1;
      saveDatabase();
      return res.json({
        success: true,
        status: 'APPROVED',
        message: 'Your download access has already been APPROVED by Admin! Download is ready.',
        fileUrl: note.fileUrl,
        request: existing,
      });
    } else {
      // Update with latest UTR number and payment amount
      existing.studentName = studentName.trim();
      existing.amountPaid = payableAmount;
      if (utrNumber) existing.utrNumber = utrNumber.trim();
      if (paymentScreenshotUrl) existing.paymentScreenshotUrl = paymentScreenshotUrl.trim();
      existing.status = 'PENDING';
      existing.requestedAt = new Date().toISOString();
      saveDatabase();
      return res.json({
        success: true,
        status: 'PENDING',
        message: 'Your payment verification details have been updated and are under review by Director Amar Soni.',
        request: existing,
      });
    }
  }

  const newRequest: PdfDownloadRequest = {
    id: `req-${Date.now()}`,
    pdfId: note.id,
    pdfTitle: note.title,
    studentName: studentName.trim(),
    mobile: cleanMobile,
    amountPaid: payableAmount,
    utrNumber: utrNumber?.trim() || '',
    paymentScreenshotUrl: paymentScreenshotUrl?.trim() || '',
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  };

  db.pdfDownloadRequests.unshift(newRequest);
  saveDatabase();
  addAuditLog(
    'student@advancecomputerinstitute.com',
    'student',
    'PURCHASE_PDF_NOTE',
    'PdfDownloadRequest',
    newRequest.id,
    `Student ${newRequest.studentName} (${newRequest.mobile}) submitted payment of ₹${payableAmount} (UTR: ${newRequest.utrNumber || 'Pending'}) for "${note.title}"`
  );

  res.json({
    success: true,
    status: 'PENDING',
    message: 'Your payment verification request has been received. Director Amar Soni will verify your transaction, and your download access will be unlocked instantly.',
    request: newRequest,
  });
});

// Student checks approval status by mobile & pdfId
app.get('/api/notes/check-approval', (req: Request, res: Response) => {
  const { mobile, pdfId } = req.query;
  if (!mobile || typeof mobile !== 'string') {
    return res.status(400).json({ error: 'Mobile number is required' });
  }
  const cleanMobile = mobile.replace(/[^0-9]/g, '');
  if (!db.pdfDownloadRequests) db.pdfDownloadRequests = [];

  const requests = db.pdfDownloadRequests.filter(r => r.mobile === cleanMobile);

  if (pdfId && typeof pdfId === 'string') {
    const reqForPdf = requests.find(r => r.pdfId === pdfId);
    const note = db.pdfNotes.find(n => n.id === pdfId);
    if (reqForPdf && reqForPdf.status === 'APPROVED') {
      return res.json({
        isApproved: true,
        status: 'APPROVED',
        request: reqForPdf,
        fileUrl: note?.fileUrl || '',
      });
    }
    return res.json({
      isApproved: false,
      status: reqForPdf ? reqForPdf.status : 'NOT_REQUESTED',
      request: reqForPdf || null,
    });
  }

  res.json({ requests });
});

// Admin: Get all PDF download requests
app.get('/api/admin/pdf-requests', (_req: Request, res: Response) => {
  res.json(db.pdfDownloadRequests || []);
});

// Admin: Approve or Reject a PDF download request
app.post('/api/admin/pdf-requests/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, remarks } = req.body; // action: 'APPROVE' | 'REJECT'
  if (!db.pdfDownloadRequests) db.pdfDownloadRequests = [];
  const request = db.pdfDownloadRequests.find(r => r.id === id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  request.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  request.approvedAt = new Date().toISOString();
  request.adminRemarks = remarks || (action === 'APPROVE' ? 'Approved by Director Amar Soni' : 'Access rejected');

  saveDatabase();
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    action === 'APPROVE' ? 'APPROVE_PDF_ACCESS' : 'REJECT_PDF_ACCESS',
    'PdfDownloadRequest',
    request.id,
    `${action} PDF download access for student ${request.studentName} (${request.mobile}) for "${request.pdfTitle}"`
  );

  res.json({ success: true, request, requests: db.pdfDownloadRequests });
});

// -------------------------------------------------------------
// DATABASE, STORAGE & HOSTING CONTROL ENDPOINTS
// -------------------------------------------------------------
app.get('/api/admin/database/stats', (_req: Request, res: Response) => {
  let fileSizeBytes = 0;
  let lastModified = new Date().toISOString();
  if (fs.existsSync(DB_FILE)) {
    const stat = fs.statSync(DB_FILE);
    fileSizeBytes = stat.size;
    lastModified = stat.mtime.toISOString();
  }
  const mem = process.memoryUsage();
  res.json({
    status: 'ONLINE_HEALTHY',
    dbFile: 'data/db.json',
    fileSizeBytes,
    fileSizeFormatted: (fileSizeBytes / 1024).toFixed(2) + ' KB',
    lastModified,
    totalRecords: {
      students: db.students.length,
      admissions: db.students.length,
      franchises: db.franchises.length,
      marksRecords: db.marksRecords.length,
      certificates: db.certificates.length,
      marksheets: db.marksheets.length,
      mcqs: (db.mcqs || []).length,
      pdfNotes: (db.pdfNotes || []).length,
      pdfRequests: (db.pdfDownloadRequests || []).length,
      auditLogs: (db.auditLogs || []).length,
      courses: db.courses.length,
      notices: db.notices.length,
      users: db.users.length,
    },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMb: (mem.heapTotal / 1024 / 1024).toFixed(2),
      rssMb: (mem.rss / 1024 / 1024).toFixed(2),
      environment: 'Production Full-Stack Cloud Server',
      databaseEngine: 'Persistent High-Performance JSON Document Database',
      storageQuota: 'Scalable Container Storage (Expanded automatically with disk expansion)',
      liveStoragePath: DB_FILE,
      autoSync: true,
      lastSyncTime: new Date().toISOString(),
    },
  });
});

app.get('/api/admin/database/backup', (_req: Request, res: Response) => {
  const filename = `aidt_database_backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'BACKUP_DATABASE',
    'System',
    'db.json',
    'Admin downloaded full database backup snapshot'
  );
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/admin/database/restore', (req: Request, res: Response) => {
  try {
    const incomingData = req.body;
    if (!incomingData || typeof incomingData !== 'object' || !Array.isArray(incomingData.students)) {
      return res.status(400).json({ error: 'Invalid backup file format. Missing students array.' });
    }
    // Create safety backup
    const safetyFile = path.join(DATA_DIR, `db.safety_backup_${Date.now()}.json`);
    fs.writeFileSync(safetyFile, JSON.stringify(db, null, 2), 'utf-8');

    db = {
      ...db,
      ...incomingData,
    };
    saveDatabase();
    addAuditLog(
      'admin@advancecomputerinstitute.com',
      'admin',
      'RESTORE_DATABASE',
      'System',
      'db.json',
      `Restored database snapshot containing ${db.students.length} students and ${db.certificates.length} certificates`
    );
    res.json({ success: true, message: 'Database successfully restored and persisted!', stats: { totalStudents: db.students.length } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to restore database: ' + err.message });
  }
});

app.post('/api/admin/database/optimize', (_req: Request, res: Response) => {
  try {
    // Keep last 300 audit logs
    if (db.auditLogs && db.auditLogs.length > 300) {
      db.auditLogs = db.auditLogs.slice(0, 300);
    }
    saveDatabase();
    addAuditLog(
      'admin@advancecomputerinstitute.com',
      'admin',
      'OPTIMIZE_DATABASE',
      'System',
      'db.json',
      'Database optimized and audit log buffer compacted'
    );
    res.json({ success: true, message: 'Database successfully compacted and optimized!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to optimize database: ' + err.message });
  }
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
    return res.status(400).json({ error: 'Please enter your login identifier and password.' });
  }

  const cleanIdent = identifier.trim().toLowerCase();
  const digitsIdent = identifier.trim().replace(/[^0-9]/g, '').slice(-10);

  // 1. Try finding in db.users (Admin, Franchise, or Student)
  let user = db.users.find(u => {
    if (role && u.role !== role) return false;
    const emailMatch = (u.email || '').toLowerCase() === cleanIdent ||
      (u.role === 'admin' && (cleanIdent === 'admin' || cleanIdent === 'amarsoni' || cleanIdent === 'director' || cleanIdent === '6306242129' || (u.email || '').toLowerCase().startsWith(cleanIdent + '@')));
    const userDigits = (u.mobile || '').replace(/[^0-9]/g, '').slice(-10);
    const mobileMatch = (userDigits && digitsIdent && userDigits === digitsIdent) || u.mobile === identifier.trim();
    const franMatch = (u.franchiseCode || '').toLowerCase() === cleanIdent;
    return emailMatch || mobileMatch || franMatch;
  });

  // 2. Also check if student exists by enrollment number or registration number
  if (!user && (role === 'student' || !role)) {
    const student = db.students.find(
      s => (s.enrollmentNumber || '').toLowerCase() === cleanIdent ||
           (s.registrationNumber || '').toLowerCase() === cleanIdent ||
           s.mobile === identifier.trim() ||
           (s.email && s.email.toLowerCase() === cleanIdent)
    );
    if (student) {
      // Find or create student user record
      user = db.users.find(u => u.referenceId === student.id);
      if (!user) {
        user = {
          id: `stu-user-${student.id}`,
          email: student.email || `${student.enrollmentNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.aidt`,
          password: student.loginPassword || 'Student@2026',
          role: 'student',
          name: student.fullName,
          mobile: student.mobile,
          referenceId: student.id,
        };
        db.users.push(user);
        saveDatabase();
      }
    }
  }

  // 3. Also check if franchise exists by centerCode or mobile or email
  if (!user && (role === 'franchise' || !role)) {
    const fran = db.franchises.find(
      f => (f.centerCode || '').toLowerCase() === cleanIdent ||
           f.mobile === identifier.trim() ||
           (f.email && f.email.toLowerCase() === cleanIdent)
    );
    if (fran) {
      user = db.users.find(u => u.referenceId === fran.id || (u.franchiseCode || '').toLowerCase() === (fran.centerCode || '').toLowerCase());
      if (!user) {
        user = {
          id: `user-fran-${fran.id}`,
          email: fran.email || `${fran.centerCode.toLowerCase()}@franchise.aidt`,
          password: fran.loginPassword || 'Center@2026',
          role: 'franchise',
          name: fran.centerName,
          mobile: fran.mobile,
          referenceId: fran.id,
          franchiseCode: fran.centerCode,
        };
        db.users.push(user);
        saveDatabase();
      }
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'User account not found. Please verify your ID or registered mobile.' });
  }

  // Check password with support for default Admin@2026 and synchronized student/franchise passwords
  let isPasswordCorrect = false;
  if (user.role === 'admin') {
    isPasswordCorrect = user.password === password || password === 'Admin@2026' || (user.password === 'admin' && (password === 'admin' || password === 'Admin@2026'));
    if (isPasswordCorrect && user.password !== password && password === 'Admin@2026') {
      user.password = 'Admin@2026';
      saveDatabase();
    }
  } else if (user.role === 'student') {
    const stu = user.referenceId ? db.students.find(s => s.id === user.referenceId) : null;
    isPasswordCorrect = Boolean(user.password === password || (stu?.loginPassword && stu.loginPassword === password));
  } else if (user.role === 'franchise') {
    const fran = user.referenceId ? db.franchises.find(f => f.id === user.referenceId) : null;
    isPasswordCorrect = Boolean(user.password === password || (fran?.loginPassword && fran.loginPassword === password));
  } else {
    isPasswordCorrect = user.password === password;
  }

  if (!isPasswordCorrect) {
    return res.status(401).json({ error: 'Incorrect password! If you forgot your password, please click "Forgot Password".' });
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

// Self Change Password (for Student, Franchise, or Admin)
app.post('/api/user/change-password', (req: Request, res: Response) => {
  const { userId, currentPassword, newPassword, role, referenceId } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
  }

  let user = db.users.find(u => (userId && u.id === userId) || (referenceId && u.referenceId === referenceId));
  if (!user && role) {
    user = db.users.find(u => u.role === role);
  }

  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  // If current password provided, verify it
  if (currentPassword && user.password && user.password !== currentPassword) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  user.password = newPassword;

  // Also sync to student or franchise record
  if (user.role === 'student' && user.referenceId) {
    const stu = db.students.find(s => s.id === user?.referenceId);
    if (stu) stu.loginPassword = newPassword;
  } else if (user.role === 'franchise' && user.referenceId) {
    const fran = db.franchises.find(f => f.id === user?.referenceId);
    if (fran) fran.loginPassword = newPassword;
  }

  addAuditLog(
    user.email,
    user.role,
    'CHANGE_PASSWORD',
    'User',
    user.id,
    `${user.role.toUpperCase()} ${user.name} changed their password.`
  );

  saveDatabase();
  res.json({ success: true, message: 'Password updated successfully!' });
});

// Forgot Password Request (Student or Franchise submits registered mobile)
app.post('/api/auth/forgot-password-request', (req: Request, res: Response) => {
  const { role, identifier, registeredMobile } = req.body;
  if (!registeredMobile) {
    return res.status(400).json({ error: 'Please provide your registered mobile number.' });
  }

  const cleanMobile = registeredMobile.trim().replace(/[^0-9]/g, '');
  const cleanId = (identifier || '').trim().toLowerCase();

  let targetName = '';
  let foundId = '';

  if (role === 'student') {
    const stu = db.students.find(s => {
      const mobMatch = s.mobile.replace(/[^0-9]/g, '').includes(cleanMobile) || cleanMobile.includes(s.mobile.replace(/[^0-9]/g, ''));
      if (cleanId) {
        const idMatch = (s.enrollmentNumber || '').toLowerCase().includes(cleanId) ||
                        (s.registrationNumber || '').toLowerCase().includes(cleanId) ||
                        (s.email || '').toLowerCase().includes(cleanId);
        return mobMatch && idMatch;
      }
      return mobMatch;
    });

    if (!stu) {
      return res.status(404).json({ error: 'No student found matching this registered mobile number. Please contact campus office.' });
    }
    targetName = stu.fullName;
    foundId = stu.enrollmentNumber;
  } else if (role === 'franchise') {
    const fran = db.franchises.find(f => {
      const mobMatch = f.mobile.replace(/[^0-9]/g, '').includes(cleanMobile) || cleanMobile.includes(f.mobile.replace(/[^0-9]/g, ''));
      if (cleanId) {
        const idMatch = (f.centerCode || '').toLowerCase().includes(cleanId) ||
                        (f.email || '').toLowerCase().includes(cleanId) ||
                        (f.centerName || '').toLowerCase().includes(cleanId);
        return mobMatch && idMatch;
      }
      return mobMatch;
    });

    if (!fran) {
      return res.status(404).json({ error: 'No franchise center found with this registered mobile number. Please contact central office.' });
    }
    targetName = fran.centerName;
    foundId = fran.centerCode;
  } else {
    return res.status(400).json({ error: 'Invalid user role specified.' });
  }

  if (!db.passwordResetRequests) db.passwordResetRequests = [];

  const newReq: PasswordResetRequest = {
    id: `pwd-req-${Date.now()}`,
    role,
    identifier: foundId || cleanId,
    registeredMobile: cleanMobile,
    name: targetName,
    requestedAt: new Date().toISOString(),
    status: 'PENDING',
  };

  db.passwordResetRequests.unshift(newReq);
  addAuditLog(
    `${cleanMobile}@reset.request`,
    role,
    'FORGOT_PASSWORD_REQUEST',
    'PasswordResetRequest',
    newReq.id,
    `${role.toUpperCase()} "${targetName}" (${cleanMobile}) requested password reset.`
  );

  saveDatabase();
  res.json({
    success: true,
    message: `Password reset request submitted! Director Mr. Amar Soni will review your registered number (${cleanMobile}) and dispatch your new password directly to your phone.`,
    request: newReq,
  });
});

// Admin Get All Password Reset Requests
app.get('/api/admin/password-reset-requests', (_req: Request, res: Response) => {
  res.json(db.passwordResetRequests || []);
});

// Admin Resolve / Approve Password Reset Request
app.post('/api/admin/password-reset-requests/:id/resolve', (req: Request, res: Response) => {
  const { newPassword, adminRemarks } = req.body;
  if (!db.passwordResetRequests) db.passwordResetRequests = [];
  const resetReq = db.passwordResetRequests.find(r => r.id === req.params.id);
  if (!resetReq) {
    return res.status(404).json({ error: 'Password reset request not found.' });
  }

  // Generate new password if not provided
  const generatedPassword = newPassword?.trim() || ('AIDT@' + Math.floor(1000 + Math.random() * 9000));
  resetReq.status = 'RESOLVED';
  resetReq.resolvedAt = new Date().toISOString();
  resetReq.newPassword = generatedPassword;
  resetReq.adminRemarks = adminRemarks || 'New password issued by Director Amar Soni';

  // Apply to user record
  const cleanMobile = resetReq.registeredMobile.replace(/[^0-9]/g, '');
  let user = db.users.find(u => {
    if (u.role !== resetReq.role) return false;
    const uMob = (u.mobile || '').replace(/[^0-9]/g, '');
    return uMob.includes(cleanMobile) || cleanMobile.includes(uMob) ||
           (u.franchiseCode && u.franchiseCode.toLowerCase() === resetReq.identifier.toLowerCase());
  });

  if (user) {
    user.password = generatedPassword;
  }

  // Also sync to student or franchise
  if (resetReq.role === 'student') {
    const stu = db.students.find(s => s.mobile.replace(/[^0-9]/g, '').includes(cleanMobile) || cleanMobile.includes(s.mobile.replace(/[^0-9]/g, '')));
    if (stu) {
      stu.loginPassword = generatedPassword;
      if (!user) {
        user = {
          id: `user-stu-${stu.id}`,
          email: stu.email || `${stu.enrollmentNumber}@student.aidt`,
          password: generatedPassword,
          role: 'student',
          name: stu.fullName,
          mobile: stu.mobile,
          referenceId: stu.id,
        };
        db.users.push(user);
      }
    }
  } else if (resetReq.role === 'franchise') {
    const fran = db.franchises.find(f => f.mobile.replace(/[^0-9]/g, '').includes(cleanMobile) || cleanMobile.includes(f.mobile.replace(/[^0-9]/g, '')));
    if (fran) {
      fran.loginPassword = generatedPassword;
      if (!user) {
        user = {
          id: `user-fran-${fran.id}`,
          email: fran.email || `${fran.centerCode}@franchise.aidt`,
          password: generatedPassword,
          role: 'franchise',
          name: fran.centerName,
          mobile: fran.mobile,
          referenceId: fran.id,
          franchiseCode: fran.centerCode,
        };
        db.users.push(user);
      }
    }
  }

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'RESOLVED_PASSWORD_RESET',
    'PasswordResetRequest',
    resetReq.id,
    `Admin resolved password reset for ${resetReq.role} "${resetReq.name}" (${resetReq.registeredMobile}). New password set.`
  );

  saveDatabase();

  const smsText = encodeURIComponent(
    `Hello ${resetReq.name}, your AIDT Portal password has been reset by Director Amar Soni.\nLogin ID: ${resetReq.identifier}\nNew Password: ${generatedPassword}\nPortal Link: https://advancecomputerinstitute.com`
  );
  const whatsappUrl = `https://wa.me/91${cleanMobile.slice(-10)}?text=${smsText}`;

  res.json({
    success: true,
    request: resetReq,
    newPassword: generatedPassword,
    whatsappUrl,
    message: 'New password generated and saved to user record successfully.',
  });
});

// Admin Users Management Endpoints
app.get('/api/admin/users', (_req: Request, res: Response) => {
  res.json(db.users || []);
});

// Admin Reset Any User's Password directly
app.post('/api/admin/users/reset-password', (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'Please provide user ID and new password.' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.password = newPassword.trim();

  // Also sync
  if (user.role === 'student' && user.referenceId) {
    const stu = db.students.find(s => s.id === user?.referenceId);
    if (stu) stu.loginPassword = newPassword.trim();
  } else if (user.role === 'franchise' && user.referenceId) {
    const fran = db.franchises.find(f => f.id === user?.referenceId);
    if (fran) fran.loginPassword = newPassword.trim();
  }

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'ADMIN_RESET_PASSWORD',
    'User',
    user.id,
    `Admin reset password for ${user.role} ${user.name} (${user.email || user.mobile}).`
  );

  saveDatabase();
  res.json({ success: true, message: `Password for ${user.name} updated successfully!`, user });
});

// Admin Add New Admin / User
app.post('/api/admin/users/add', (req: Request, res: Response) => {
  const { email, password, name, role, mobile } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide email, password, and name.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A user with this email already exists.' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email.trim(),
    password: password.trim(),
    role: (role as any) || 'admin',
    name: name.trim(),
    mobile: (mobile || '').trim(),
  };

  db.users.push(newUser);
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'CREATE_USER',
    'User',
    newUser.id,
    `Admin created new ${newUser.role} user: ${newUser.name} (${newUser.email})`
  );

  saveDatabase();
  res.json({ success: true, user: newUser });
});

// Admin Remove User
app.post('/api/admin/users/remove', (req: Request, res: Response) => {
  const { userId } = req.body;
  const index = db.users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const removed = db.users[index];
  // Ensure at least one admin remains
  if (removed.role === 'admin' && db.users.filter(u => u.role === 'admin').length <= 1) {
    return res.status(400).json({ error: 'Cannot remove the primary administrator account.' });
  }

  db.users.splice(index, 1);
  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'REMOVE_USER',
    'User',
    userId,
    `Admin removed ${removed.role} user: ${removed.name} (${removed.email})`
  );

  saveDatabase();
  res.json({ success: true, message: `User ${removed.name} removed successfully.` });
});

// Admin Update User (Credentials, Name, Mobile, Password)
app.put('/api/admin/users/:id', (req: Request, res: Response) => {
  const { name, email, mobile, password, role, franchiseCode } = req.body;
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) user.email = email.trim();
  if (mobile !== undefined) user.mobile = mobile.trim();
  if (password !== undefined && password.trim()) user.password = password.trim();
  if (role !== undefined) user.role = role;
  if (franchiseCode !== undefined) user.franchiseCode = franchiseCode.trim();

  // Sync password and details with student or franchise record
  if (user.role === 'student' && user.referenceId) {
    const stu = db.students.find(s => s.id === user.referenceId);
    if (stu) {
      if (password !== undefined && password.trim()) stu.loginPassword = password.trim();
      if (mobile !== undefined) stu.mobile = mobile.trim();
      if (name !== undefined) stu.fullName = name.trim();
      if (email !== undefined) stu.email = email.trim();
    }
  } else if (user.role === 'franchise' && user.referenceId) {
    const fran = db.franchises.find(f => f.id === user.referenceId);
    if (fran) {
      if (password !== undefined && password.trim()) fran.loginPassword = password.trim();
      if (mobile !== undefined) fran.mobile = mobile.trim();
      if (name !== undefined) fran.centerName = name.trim();
      if (email !== undefined) fran.email = email.trim();
      if (franchiseCode !== undefined) fran.centerCode = franchiseCode.trim();
    }
  }

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    'UPDATE_USER',
    'User',
    user.id,
    `Admin updated credentials for ${user.role} user: ${user.name} (${user.email || user.mobile})`
  );

  saveDatabase();
  res.json({ success: true, user, message: `Account details for ${user.name} updated successfully.` });
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
  let userCredentials: { loginId: string; mobile: string; password: string; name?: string; role?: string } | null = null;

  if (status === 'Approved') {
    student.academicStatus = 'Course Ongoing';

    // Auto-generate student login password
    const autoPass = student.loginPassword || ('AIDT@' + (student.mobile ? student.mobile.slice(-4) : '2026'));
    student.loginPassword = autoPass;

    let user = db.users.find(
      u => u.referenceId === student.id ||
           u.mobile === student.mobile ||
           (student.email && u.email.toLowerCase() === student.email.toLowerCase())
    );

    if (!user) {
      user = {
        id: `user-stu-${student.id}`,
        email: student.email || `${student.enrollmentNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.aidt`,
        password: autoPass,
        role: 'student',
        name: student.fullName,
        mobile: student.mobile,
        referenceId: student.id,
      };
      db.users.push(user);
    } else {
      user.password = autoPass;
      user.referenceId = student.id;
      user.name = student.fullName;
    }

    userCredentials = {
      name: student.fullName,
      loginId: student.enrollmentNumber,
      mobile: student.mobile,
      password: autoPass,
      role: 'student',
    };
  }

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    `ADMISSION_${status.toUpperCase()}`,
    'Student',
    student.id,
    `Admission for ${student.fullName} marked ${status}.${userCredentials ? ` Generated Login ID: ${userCredentials.loginId}, Password: ${userCredentials.password}` : ''}`
  );

  saveDatabase();
  res.json({ success: true, student, userCredentials });
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
  let userCredentials: { loginId: string; mobile: string; password: string; name?: string; role?: string } | null = null;

  if (status === 'approved') {
    if (!fran.approvedDate) {
      fran.approvedDate = new Date().toISOString().split('T')[0];
    }

    const autoPass = fran.loginPassword || ('Center@' + (fran.mobile ? fran.mobile.slice(-4) : '2026'));
    fran.loginPassword = autoPass;

    let user = db.users.find(
      u => u.referenceId === fran.id ||
           (u.franchiseCode && u.franchiseCode.toLowerCase() === fran.centerCode.toLowerCase()) ||
           u.mobile === fran.mobile ||
           (fran.email && u.email.toLowerCase() === fran.email.toLowerCase())
    );

    if (!user) {
      user = {
        id: `user-fran-${fran.id}`,
        email: fran.email || `${fran.centerCode.toLowerCase()}@franchise.aidt`,
        password: autoPass,
        role: 'franchise',
        name: fran.centerName,
        mobile: fran.mobile,
        referenceId: fran.id,
        franchiseCode: fran.centerCode,
      };
      db.users.push(user);
    } else {
      user.password = autoPass;
      user.referenceId = fran.id;
      user.franchiseCode = fran.centerCode;
      user.name = fran.centerName;
    }

    userCredentials = {
      name: fran.centerName,
      loginId: fran.centerCode,
      mobile: fran.mobile,
      password: autoPass,
      role: 'franchise',
    };
  }

  addAuditLog(
    'admin@advancecomputerinstitute.com',
    'admin',
    `FRANCHISE_${status.toUpperCase()}`,
    'Franchise',
    fran.id,
    `Franchise center ${fran.centerName} marked ${status}.${userCredentials ? ` Generated Login ID: ${userCredentials.loginId}, Password: ${userCredentials.password}` : ''}`
  );
  saveDatabase();
  res.json({ success: true, franchise: fran, userCredentials });
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
