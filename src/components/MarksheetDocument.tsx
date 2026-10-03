import React from 'react';
import { MarksheetRecord, InstituteSettings, MarksheetTemplateConfig } from '../types/index.ts';
import { ShieldCheck, FileSpreadsheet, QrCode as QrIcon, Printer, X } from 'lucide-react';

interface MarksheetProps {
  marksheet: MarksheetRecord;
  settings?: InstituteSettings;
  template?: MarksheetTemplateConfig;
  studentPhoto?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const MarksheetDocument: React.FC<MarksheetProps> = ({
  marksheet,
  settings,
  template,
  studentPhoto,
  onClose,
  isModal = false,
}) => {
  const instituteName = settings?.instituteName || 'ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY';
  const directorName = settings?.directorName || 'Mr. Amar Soni';
  const directorQual = settings?.directorQualification || 'MCA, Data Science';
  const address = settings?.address || 'Near Grammar Academy Chauraha, Kaushalpuri Phase 1, Ayodhya Cantt, Ayodhya – 224001, Uttar Pradesh';

  const marksheetTitle = template?.marksheetTitle || 'Statement of Marks / Academic Transcript';
  const subHeaderTitle = template?.subHeaderTitle || 'Issued by the Controller of Examinations, Advance Institute of Digital Technology';
  const footerNotice = template?.footerNotice || 'Official Marks Statement issued by Advance Institute of Digital Technology Ayodhya Cantt • Online Public Verification at advancecomputerinstitute.com/verify-marksheet';

  const watermarkLogo = template?.watermarkLogoUrl || settings?.logoUrl || '/aidt-logo.svg';
  const watermarkOpacity = template?.watermarkOpacity ?? 0.08;
  const watermarkSize = template?.watermarkSize || 390;

  const handlePrint = () => {
    window.print();
  };

  const content = (
    <div
      id="printable-document"
      className="relative bg-white text-slate-900 mx-auto select-none print:m-0 print:p-0 print:border-none print:shadow-none"
      style={{
        width: '100%',
        maxWidth: '850px',
        minHeight: '1100px',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer Formal Academic Double Border */}
      <div className="relative p-6 border-[8px] border-[#1e3a8a] bg-[#fafbfc] shadow-2xl print:shadow-none print:border-[6px]">
        <div className="relative p-4 border border-[#1e3a8a] bg-white">
          {/* BIG BACKGROUND LOGO WATERMARK (Uploaded AIDT Seal) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <img
              src={watermarkLogo}
              alt="Marksheet Logo Watermark"
              className="object-contain select-none"
              style={{
                width: `${watermarkSize}px`,
                height: `${watermarkSize}px`,
                opacity: watermarkOpacity,
              }}
            />
          </div>

          {/* Academic Header */}
          <div className="relative z-10 border-b-2 border-[#1e3a8a] pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={settings?.logoUrl || '/aidt-logo.svg'}
                  alt="ACI Logo"
                  className="w-20 h-20 object-contain drop-shadow-md"
                />
                <div>
                  <div className="text-[10px] font-bold text-blue-900 uppercase tracking-widest font-mono">
                    AUTONOMOUS SKILL &amp; IT EDUCATION BOARD • ISO CERTIFIED
                  </div>
                  <h1 className="font-cinzel font-black text-2xl md:text-3xl text-[#0f2942] tracking-wide leading-tight">
                    {instituteName}
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium max-w-md leading-tight">
                    {address}
                  </p>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Website: {settings?.website || 'advancecomputerinstitute.com'} | Contact: {settings?.mobile || '6306242129'}
                  </div>
                </div>
              </div>

              {/* Student Photo */}
              <div className="text-center">
                <div className="w-20 h-24 border-2 border-slate-700 p-0.5 bg-white shadow-xs overflow-hidden rounded-xs">
                  <img
                    src={studentPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                    alt={marksheet.studentName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[8.5px] font-mono text-slate-500 uppercase font-semibold">
                  Photo
                </span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="mt-4 text-center">
              <div className="inline-block bg-[#1e3a8a] text-white px-8 py-1 rounded-xs shadow-xs">
                <h2 className="font-cinzel font-bold text-sm md:text-base tracking-widest uppercase">
                  {marksheetTitle}
                </h2>
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                {subHeaderTitle}
              </div>
            </div>
          </div>

          {/* Student & Course Credentials Table */}
          <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 bg-slate-50/90 border border-slate-300 text-xs mb-4 backdrop-blur-xs">
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Student's Name:</span>
              <span className="font-bold text-slate-900 uppercase">{marksheet.studentName}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Marksheet No:</span>
              <span className="font-mono font-bold text-[#1e3a8a]">{marksheet.marksheetNumber}</span>
            </div>

            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Father's Name:</span>
              <span className="font-semibold text-slate-800">{marksheet.fatherName}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Enrollment No:</span>
              <span className="font-mono font-bold text-slate-800">{marksheet.enrollmentNumber}</span>
            </div>

            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Mother's Name:</span>
              <span className="font-semibold text-slate-800">{marksheet.motherName || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Registration No:</span>
              <span className="font-mono font-bold text-slate-800">{marksheet.registrationNumber}</span>
            </div>

            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Course Enrolled:</span>
              <span className="font-bold text-blue-950">{marksheet.courseName}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">Course Duration:</span>
              <span className="font-semibold text-slate-800">{marksheet.duration} ({marksheet.session})</span>
            </div>

            <div className="col-span-2 flex border-t border-slate-200 pt-1 mt-0.5">
              <span className="w-32 text-slate-500 font-medium">Authorized Center:</span>
              <span className="font-medium text-slate-800">{marksheet.centerName}</span>
            </div>
          </div>

          {/* Subject-Wise Marks Matrix Table */}
          <div className="relative z-10 mb-4 overflow-hidden border border-slate-400 bg-white/95">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1e3a8a] text-white font-semibold text-[11px] text-center">
                  <th className="p-2 border border-slate-400 text-left w-10">Sr.</th>
                  <th className="p-2 border border-slate-400 text-left">Subject / Module Description</th>
                  <th className="p-2 border border-slate-400 w-16">Max</th>
                  <th className="p-2 border border-slate-400 w-16">Min</th>
                  <th className="p-2 border border-slate-400 w-16">Theory</th>
                  <th className="p-2 border border-slate-400 w-16">Practical</th>
                  <th className="p-2 border border-slate-400 w-16">Internal</th>
                  <th className="p-2 border border-slate-400 w-20">Obtained</th>
                  <th className="p-2 border border-slate-400 w-16">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {marksheet.subjects.map((sub, idx) => {
                  const subjectGrade =
                    sub.obtainedMarks >= 85 ? 'A+' : sub.obtainedMarks >= 75 ? 'A' : sub.obtainedMarks >= 65 ? 'B+' : sub.obtainedMarks >= 55 ? 'B' : 'C';
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-medium text-slate-800">{sub.subjectName}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{sub.maxMarks}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{sub.minMarks}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{sub.theoryMarks}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{sub.practicalMarks}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{sub.internalMarks}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-900 bg-amber-50/50">
                        {sub.obtainedMarks}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold text-emerald-700">
                        {subjectGrade}
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400 text-xs">
                  <td colSpan={2} className="p-2.5 border border-slate-400 text-right uppercase tracking-wider">
                    Grand Total
                  </td>
                  <td className="p-2.5 border border-slate-400 text-center font-mono">{marksheet.totalMax}</td>
                  <td className="p-2.5 border border-slate-400 text-center font-mono">—</td>
                  <td colSpan={3} className="p-2.5 border border-slate-400 text-center text-slate-500 font-normal">
                    Aggregate Obtained
                  </td>
                  <td className="p-2.5 border border-slate-400 text-center font-mono text-sm text-[#1e3a8a]">
                    {marksheet.totalObtained}
                  </td>
                  <td className="p-2.5 border border-slate-400 text-center text-emerald-800">
                    {marksheet.grade}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Performance & Grading Summary Strip */}
          <div className="relative z-10 grid grid-cols-4 gap-2 text-center p-2.5 bg-blue-50/90 border border-blue-200 text-xs mb-4">
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-medium">Total Marks</span>
              <span className="font-mono font-bold text-slate-800">{marksheet.totalObtained} / {marksheet.totalMax}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-medium">Percentage</span>
              <span className="font-mono font-bold text-blue-900">{marksheet.percentage}%</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-medium">Overall Grade</span>
              <span className="font-bold text-emerald-700">{marksheet.grade}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-medium">Final Result</span>
              <span className="font-bold text-emerald-800 uppercase tracking-wide">{marksheet.result}</span>
            </div>
          </div>

          {/* Grading Legend Bar */}
          <div className="relative z-10 text-[9px] text-slate-500 border border-slate-200 p-1.5 mb-4 bg-slate-50 flex justify-between">
            <span><strong>Grading Scale:</strong> A+ (85%+ Distinction)</span>
            <span>A (75% to 84% Very Good)</span>
            <span>B+ (65% to 74% Good)</span>
            <span>B (55% to 64% Satisfactory)</span>
            <span>C (40% to 54% Pass)</span>
            <span>F (Below 40% Fail)</span>
          </div>

          {/* Signatures, Seal & QR Verification */}
          <div className="relative z-10 grid grid-cols-3 items-end pt-4 mt-2 border-t border-slate-300">
            {/* Left: QR Code & Verification */}
            <div className="flex items-center gap-2.5">
              <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                {marksheet.qrCodeDataUrl ? (
                  <img
                    src={marksheet.qrCodeDataUrl}
                    alt="Marksheet QR Code"
                    className="w-18 h-18"
                  />
                ) : (
                  <div className="w-18 h-18 bg-slate-100 flex items-center justify-center">
                    <QrIcon className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-600 space-y-0.5">
                <div className="font-mono font-bold text-slate-800">{marksheet.marksheetNumber}</div>
                <div>Issue Date: <strong>{marksheet.issueDate}</strong></div>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED RECORD
                </div>
                <div className="text-[8px] text-slate-500">Scan QR to verify live transcript</div>
              </div>
            </div>

            {/* Center: Controller Signature & Official Seal */}
            <div className="flex flex-col items-center text-center">
              <img
                src={settings?.instituteStampUrl || '/stamp-official.svg'}
                alt="ACI Seal"
                className="w-20 h-20 object-contain drop-shadow-sm mb-1"
              />
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                Authorized Institute Seal
              </div>
            </div>

            {/* Right: Director Amar Soni Signature */}
            <div className="text-right flex flex-col items-end">
              <div className="h-12 flex items-end justify-end mb-1">
                <img
                  src={settings?.directorSignatureUrl || '/signature-amar-soni.svg'}
                  alt="Director Amar Soni Signature"
                  className="h-10 object-contain"
                />
              </div>
              <div className="border-t-2 border-slate-700 pt-1 w-44 text-center">
                <div className="font-cinzel font-bold text-xs text-[#0f2942]">
                  {directorName}
                </div>
                <div className="text-[9.5px] text-slate-600 font-semibold">
                  {directorQual}
                </div>
                <div className="text-[8.5px] text-blue-900 uppercase font-bold tracking-wider">
                  Founder &amp; Director
                </div>
              </div>
            </div>
          </div>

          {/* Verification URL Footer Notice */}
          <div className="text-center text-[8px] text-slate-400 font-mono tracking-wider uppercase mt-4">
            {footerNotice}
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-4 relative animate-in fade-in">
          {/* Modal Toolbar */}
          <div className="flex items-center justify-between border-b pb-3 mb-4 no-print">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-lg">
                Official Marksheet Preview — {marksheet.marksheetNumber}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1e3a8a] text-white text-xs font-semibold rounded hover:bg-[#1e40af] transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a8a] text-white text-xs font-semibold rounded hover:bg-[#1e40af] transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print / Download PDF
        </button>
      </div>
      {content}
    </div>
  );
};
