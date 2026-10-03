import React from 'react';
import { CertificateRecord, InstituteSettings, CertificateTemplateConfig } from '../types/index.ts';
import { ShieldCheck, Award, QrCode as QrIcon, Printer, X } from 'lucide-react';

interface CertificateProps {
  certificate: CertificateRecord;
  settings?: InstituteSettings;
  template?: CertificateTemplateConfig;
  studentPhoto?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const CertificateDocument: React.FC<CertificateProps> = ({
  certificate,
  settings,
  template,
  studentPhoto,
  onClose,
  isModal = false,
}) => {
  const instituteName = template?.headerText || settings?.instituteName || 'ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY';
  const directorName = settings?.directorName || 'Mr. Amar Soni';
  const directorQual = settings?.directorQualification || 'MCA, Data Science';
  const address = settings?.address || 'Near Grammar Academy Chauraha, Kaushalpuri Phase 1, Ayodhya Cantt, Ayodhya – 224001, Uttar Pradesh';

  const certTitle = template?.certificateTitle || 'Certificate of Proficiency';
  const certCitation = template?.certificationText || 'This is to officially certify that';
  const certCompletion = template?.completionText || 'having successfully completed the prescribed curriculum and passed the examination conducted by Advance Institute of Digital Technology for the program:';
  const directorTitle = template?.directorTitle || 'Founder & Director';

  const watermarkLogo = template?.watermarkLogoUrl || settings?.logoUrl || '/aidt-logo.svg';
  const watermarkOpacity = template?.watermarkOpacity ?? 0.09;
  const watermarkSize = template?.watermarkSize || 450;

  const handlePrint = () => {
    window.print();
  };

  const content = (
    <div
      id="printable-document"
      className="relative bg-white text-slate-900 mx-auto select-none print:m-0 print:p-0 print:border-none print:shadow-none"
      style={{
        width: '100%',
        maxWidth: '1050px',
        minHeight: '740px',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer Ornate Border Framing */}
      <div className="relative p-7 border-[10px] border-[#0f2942] bg-[#fdfbf7] shadow-2xl print:shadow-none print:border-[8px]">
        {/* Inner Gold Foil Line */}
        <div className="relative p-5 border-2 border-[#d4af37] bg-white">
          {/* Guilloche Corner Accents */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-[#d4af37]" />
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-[#d4af37]" />
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-[#d4af37]" />
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-[#d4af37]" />

          {/* BIG BACKGROUND LOGO WATERMARK (Uploaded AIDT Seal) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <img
              src={watermarkLogo}
              alt="Institute Logo Watermark"
              className="object-contain select-none"
              style={{
                width: `${watermarkSize}px`,
                height: `${watermarkSize}px`,
                opacity: watermarkOpacity,
              }}
            />
          </div>

          {/* Document Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-amber-200/80 pb-3 mb-4">
            {/* Institute Logo */}
            <div className="flex items-center gap-3">
              <img
                src={settings?.logoUrl || '/aidt-logo.svg'}
                alt="Advance Institute of Digital Technology Logo"
                className="w-20 h-20 object-contain drop-shadow-md"
              />
              <div>
                <div className="font-cinzel text-xs font-bold text-amber-700 tracking-wider">
                  REG. GOVT. OF INDIA &amp; CERTIFIED SKILL INSTITUTION
                </div>
                <h1 className="font-cinzel font-extrabold text-2xl md:text-3xl text-[#0f2942] tracking-wide leading-tight">
                  {instituteName}
                </h1>
                <p className="text-[11px] text-slate-600 font-medium max-w-lg leading-snug">
                  {address}
                </p>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  Website: {settings?.website || 'advancecomputerinstitute.com'} | Email: {settings?.email || 'advancecomputerinstitute2026@gmail.com'}
                </div>
              </div>
            </div>

            {/* Student Photo */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-24 border-2 border-[#d4af37] p-0.5 bg-white shadow-sm overflow-hidden rounded-xs">
                <img
                  src={studentPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                  alt={certificate.studentName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase font-bold">
                Student Photo
              </span>
            </div>
          </div>

          {/* Certificate Title Badge */}
          <div className="relative z-10 text-center my-3">
            <div className="inline-block relative">
              <div className="font-cinzel-decorative font-bold text-2xl md:text-3xl text-[#0f2942] tracking-widest px-8 py-1 uppercase">
                {certTitle}
              </div>
              <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-0.5" />
              <div className="text-[11px] uppercase tracking-widest text-amber-800 font-bold font-sans mt-0.5">
                {certCitation}
              </div>
            </div>
          </div>

          {/* Recipient Details & Citation */}
          <div className="relative z-10 text-center px-4 space-y-3">
            <div className="my-2">
              <h2 className="font-playfair italic font-bold text-3xl md:text-4xl text-[#0f2942] tracking-wide border-b-2 border-dotted border-amber-300 inline-block px-6 pb-1">
                {certificate.studentName}
              </h2>
            </div>

            <p className="text-slate-700 text-sm md:text-base leading-relaxed max-w-3xl mx-auto font-serif">
              Son / Daughter of <strong className="text-slate-900 font-semibold">{certificate.fatherName}</strong>,
              {' '}{certCompletion}
            </p>

            {/* Course Title Banner */}
            <div className="my-2 inline-block bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border border-amber-300/80 px-8 py-2 rounded-sm shadow-xs">
              <span className="font-cinzel font-bold text-lg md:text-xl text-[#0f2942] tracking-wide">
                {certificate.courseName}
              </span>
            </div>

            {/* Academic Credential Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl mx-auto text-left py-2 px-4 bg-slate-50/90 border border-slate-200 text-xs backdrop-blur-xs">
              <div>
                <span className="text-slate-500 font-medium block">Enrollment No:</span>
                <span className="font-mono font-bold text-slate-800">{certificate.enrollmentNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Registration No:</span>
                <span className="font-mono font-bold text-slate-800">{certificate.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Course Duration:</span>
                <span className="font-semibold text-slate-800">{certificate.duration} ({certificate.session})</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Grade &amp; Performance:</span>
                <span className="font-bold text-emerald-700">{certificate.grade} ({certificate.percentage}%)</span>
              </div>
            </div>

            {/* Authorized Study Center Note */}
            <div className="text-[11px] text-slate-600 font-medium">
              Study &amp; Training Center: <strong className="text-slate-800">{certificate.centerName}</strong>
            </div>
          </div>

          {/* Footer Endorsements, Seal & Signatures */}
          <div className="relative z-10 grid grid-cols-3 items-end pt-6 mt-4 border-t border-amber-200/60 px-4">
            {/* Left: QR Code & Verification Data */}
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                {certificate.qrCodeDataUrl ? (
                  <img
                    src={certificate.qrCodeDataUrl}
                    alt="Certificate QR Verification"
                    className="w-20 h-20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 flex items-center justify-center">
                    <QrIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="text-left text-[9px] text-slate-600 space-y-0.5">
                <div className="font-mono font-bold text-slate-800 text-[10px]">
                  {certificate.certificateNumber}
                </div>
                <div>Issue Date: <strong>{certificate.issueDate}</strong></div>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED GENUINE
                </div>
                <div className="text-[8px] text-slate-500">Scan to verify authenticity online</div>
              </div>
            </div>

            {/* Center: Official Institutional Seal */}
            <div className="flex flex-col items-center justify-center">
              <img
                src={settings?.instituteStampUrl || '/stamp-official.svg'}
                alt="Advance Institute of Digital Technology Official Stamp"
                className="w-24 h-24 object-contain drop-shadow-sm select-none"
              />
              <span className="text-[9px] font-cinzel font-bold text-slate-500 mt-1 uppercase tracking-wider">
                Official Institutional Seal
              </span>
            </div>

            {/* Right: Director Amar Soni Signature */}
            <div className="text-right flex flex-col items-end">
              <div className="h-14 flex items-end justify-end mb-1">
                <img
                  src={settings?.directorSignatureUrl || '/signature-amar-soni.svg'}
                  alt="Director Amar Soni Signature"
                  className="h-12 object-contain"
                />
              </div>
              <div className="border-t-2 border-slate-700 pt-1 w-48 text-center">
                <div className="font-cinzel font-bold text-xs text-[#0f2942]">
                  {directorName}
                </div>
                <div className="text-[10px] text-slate-600 font-semibold">
                  {directorQual}
                </div>
                <div className="text-[9px] text-amber-800 uppercase font-bold tracking-wider">
                  {directorTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Security Microprint Line */}
          <div className="text-center text-[7.5px] text-slate-400 font-mono tracking-widest uppercase mt-4">
            ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY AYODHYA CANTT • AUTHENTIC REGISTERED ACADEMIC CREDENTIAL • SECURE VERIFICATION PORTAL: ADVANCECOMPUTERINSTITUTE.COM
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full p-4 relative animate-in fade-in">
          {/* Modal Toolbar */}
          <div className="flex items-center justify-between border-b pb-3 mb-4 no-print">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-lg">
                Official Certificate Preview — {certificate.certificateNumber}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f2942] text-white text-xs font-semibold rounded hover:bg-[#1a3d60] transition-colors"
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
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0f2942] text-white text-xs font-semibold rounded hover:bg-[#1a3d60] transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print / Download PDF
        </button>
      </div>
      {content}
    </div>
  );
};
