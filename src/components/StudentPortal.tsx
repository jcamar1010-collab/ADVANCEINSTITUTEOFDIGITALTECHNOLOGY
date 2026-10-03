import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { InstituteSettings, Student, CertificateRecord, MarksheetRecord } from '../types/index.ts';
import { CertificateDocument } from './CertificateDocument.tsx';
import { MarksheetDocument } from './MarksheetDocument.tsx';
import {
  GraduationCap,
  Award,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface Props {
  settings: InstituteSettings;
  studentId?: string;
}

export const StudentPortal: React.FC<Props> = ({ settings, studentId = 'stu-01' }) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    student: Student;
    marksRecord: any | null;
    marksStatus: string;
    certificate: CertificateRecord | null;
    marksheet: MarksheetRecord | null;
    isVerifiedAndApproved: boolean;
  } | null>(null);

  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [previewMark, setPreviewMark] = useState<MarksheetRecord | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getStudentProfile(studentId);
        setProfileData(res);
      } catch (e) {
        console.error('Failed to load student profile', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  if (loading || !profileData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-3 border-[#0f2942] border-t-transparent rounded-full animate-spin mb-2" />
        <div>Loading Student Dashboard...</div>
      </div>
    );
  }

  const { student, marksRecord, marksStatus, certificate, marksheet, isVerifiedAndApproved } = profileData;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-28 border-2 border-slate-300 p-0.5 rounded shadow-xs bg-white shrink-0 overflow-hidden">
            <img
              src={student.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
              alt={student.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold rounded-full">
              <GraduationCap className="w-3.5 h-3.5" /> Enrolled Student
            </div>
            <h1 className="text-2xl font-black text-slate-900">{student.fullName}</h1>
            <p className="text-xs text-slate-600 font-medium">
              Father's Name: <strong className="text-slate-800">{student.fatherName}</strong> | Center: <strong>{student.franchiseName}</strong>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Enrollment Number</span>
                <span className="font-bold text-[#0f2942]">{student.enrollmentNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Registration Number</span>
                <span className="font-bold text-slate-800">{student.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Course</span>
                <span className="font-sans font-semibold text-slate-800">{student.courseName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Academic Status</span>
                <span className="font-sans font-bold text-emerald-700">{student.academicStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Status Tracker Banner */}
      {!isVerifiedAndApproved ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 text-center space-y-3 shadow-xs">
          <Clock className="w-12 h-12 text-amber-600 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold text-amber-950">
            Document Pending Admin Verification
          </h2>
          <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
            Your admission and examination records are currently undergoing verification by Director Mr. Amar Soni and the examination authority.
            In compliance with Advance Institute of Digital Technology regulations, official marksheets and certificates will only become available for viewing and download once approved.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" /> Official Documents Locked
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-emerald-950">
                Official Academic Credentials Approved &amp; Published
              </h2>
              <p className="text-xs text-emerald-800">
                Your certificate and statement of marks have been officially signed and sealed by Director Mr. Amar Soni.
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold uppercase tracking-wider">
            Verified
          </div>
        </div>
      )}

      {/* Official Document Cards (Only accessible when approved) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificate Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Official Certificate of Proficiency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official parchment credential with high-resolution ornate border, Director Amar Soni signature, authorized institute stamp, and QR verification code.
            </p>
            {certificate ? (
              <div className="p-3 bg-slate-50 border rounded text-xs space-y-1 font-mono">
                <div>Certificate No: <strong>{certificate.certificateNumber}</strong></div>
                <div>Issued: <strong>{certificate.issueDate}</strong></div>
                <div>Grade: <strong className="text-emerald-700">{certificate.grade}</strong></div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border rounded text-xs text-slate-500 italic">
                Awaiting final generation from Admin examination panel.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end">
            {certificate ? (
              <button
                onClick={() => setPreviewCert(certificate)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <Eye className="w-4 h-4" /> View &amp; Download Certificate
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
              >
                Certificate Not Available Yet
              </button>
            )}
          </div>
        </div>

        {/* Marksheet Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Official Statement of Marks</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authorized academic transcript with subject-wise marks, Theory &amp; Practical breakdown, grand total, aggregate percentage, and official seal.
            </p>
            {marksheet ? (
              <div className="p-3 bg-slate-50 border rounded text-xs space-y-1 font-mono">
                <div>Marksheet No: <strong>{marksheet.marksheetNumber}</strong></div>
                <div>Aggregate Score: <strong>{marksheet.totalObtained} / {marksheet.totalMax}</strong></div>
                <div>Percentage: <strong className="text-blue-900">{marksheet.percentage}%</strong></div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border rounded text-xs text-slate-500 italic">
                Awaiting approval by the Director and Examination Controller.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end">
            {marksheet ? (
              <button
                onClick={() => setPreviewMark(marksheet)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <Eye className="w-4 h-4" /> View &amp; Download Marksheet
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
              >
                Marksheet Not Available Yet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {previewCert && (
        <CertificateDocument
          certificate={previewCert}
          settings={settings}
          studentPhoto={student.photoUrl}
          isModal={true}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* Marksheet Modal */}
      {previewMark && (
        <MarksheetDocument
          marksheet={previewMark}
          settings={settings}
          studentPhoto={student.photoUrl}
          isModal={true}
          onClose={() => setPreviewMark(null)}
        />
      )}
    </div>
  );
};
