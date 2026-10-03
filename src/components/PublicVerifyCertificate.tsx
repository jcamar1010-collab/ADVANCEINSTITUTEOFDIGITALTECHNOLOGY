import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { InstituteSettings, CertificateRecord } from '../types/index.ts';
import { CertificateDocument } from './CertificateDocument.tsx';
import { ShieldCheck, Search, AlertTriangle, Eye, Printer, Award, ExternalLink, CheckCircle } from 'lucide-react';

interface Props {
  initialSearch?: string;
  settings?: InstituteSettings;
}

export const PublicVerifyCertificate: React.FC<Props> = ({ initialSearch = '', settings }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch || 'ACI/CERT/2026/000001');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);

  const handleVerify = async (termToSearch?: string) => {
    const term = (termToSearch || searchTerm).trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.verifyCertificate(term);
      if (data.valid) {
        setResult(data);
      } else if (data.status === 'REVOKED') {
        setResult(data);
      } else {
        setError(data.message || 'No valid certificate found matching this record.');
      }
    } catch (err: any) {
      setError('Unable to reach the verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearch) {
      handleVerify(initialSearch);
    }
  }, [initialSearch]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Title & Accreditation Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-full mb-3">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          Official Advance Institute of Digital Technology Online Verification System
        </div>
        <h1 className="text-3xl font-extrabold text-[#0f2942] tracking-tight">
          Verify Student Certificate
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-xl mx-auto">
          Enter the Certificate Number, Student Enrollment Number, or Registration Number printed on the physical credential or scan the QR code.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. ACI/CERT/2026/000001 or ACI/ENR/2026/000001"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm font-mono font-medium focus:ring-2 focus:ring-[#0f2942] focus:border-[#0f2942] uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#0f2942] text-white font-semibold text-sm rounded-lg hover:bg-[#1a3d60] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Verify Credential
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>Try sample verified ID:</span>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('ACI/CERT/2026/000001');
              handleVerify('ACI/CERT/2026/000001');
            }}
            className="text-amber-700 underline font-mono hover:text-amber-800"
          >
            ACI/CERT/2026/000001
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-3 border-[#0f2942] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm mt-3 font-medium">Querying authoritative institutional records...</p>
        </div>
      )}

      {/* Error / Not Found Message */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center mb-8">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <h3 className="font-bold text-red-900 text-base">Record Not Found or Not Yet Approved</h3>
          <p className="text-red-700 text-sm mt-1 max-w-lg mx-auto">
            {error} Note: Only officially approved and published certificates are visible in public verification.
          </p>
        </div>
      )}

      {/* REVOKED Notice */}
      {result && result.status === 'REVOKED' && !loading && (
        <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg mb-8 text-center animate-in fade-in">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-2xl font-black uppercase tracking-wider">
            DOCUMENT REVOKED
          </h2>
          <p className="font-medium text-red-100 text-sm mt-1 max-w-md mx-auto">
            This certificate ({result.certificateNumber}) has been officially cancelled and invalidated by Advance Institute of Digital Technology.
          </p>
          <div className="mt-4 p-3 bg-red-600/80 rounded-lg inline-block text-xs font-mono">
            Reason: {result.revocationReason || 'Revoked by the examination authority'}
          </div>
        </div>
      )}

      {/* VERIFIED Result Card */}
      {result && result.valid && result.certificate && !loading && (
        <div className="bg-white border-2 border-emerald-500 rounded-xl shadow-xl overflow-hidden mb-8 animate-in fade-in">
          {/* Verified Header Strip */}
          <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-6 h-6 text-white" />
              <div>
                <h3 className="font-bold text-lg tracking-wide uppercase">
                  Authenticated Record — Valid &amp; Genuine
                </h3>
                <p className="text-emerald-100 text-xs">
                  Official verification confirmed by Advance Institute of Digital Technology, Ayodhya
                </p>
              </div>
            </div>
            <div className="bg-emerald-700/60 px-3 py-1 rounded text-xs font-mono font-bold tracking-wider">
              STATUS: VALID
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Photo */}
              <div className="w-28 h-32 border-2 border-slate-300 p-0.5 rounded shadow-sm bg-white shrink-0 mx-auto md:mx-0">
                <img
                  src={result.certificate.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                  alt={result.certificate.studentName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Data Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Student Name</span>
                  <span className="text-slate-900 font-bold text-base">{result.certificate.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Father's Name</span>
                  <span className="text-slate-800 font-semibold">{result.certificate.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Course Completed</span>
                  <span className="text-[#0f2942] font-bold">{result.certificate.courseName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Course Duration &amp; Session</span>
                  <span className="text-slate-800 font-semibold">{result.certificate.duration} ({result.certificate.session})</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Certificate Number</span>
                  <span className="text-amber-800 font-mono font-bold">{result.certificate.certificateNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Enrollment Number</span>
                  <span className="text-slate-800 font-mono font-semibold">{result.certificate.enrollmentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Registration Number</span>
                  <span className="text-slate-800 font-mono font-semibold">{result.certificate.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Grade &amp; Percentage</span>
                  <span className="text-emerald-700 font-bold">{result.certificate.grade} ({result.certificate.percentage}%)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Issue Date</span>
                  <span className="text-slate-800 font-semibold">{result.certificate.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-medium block">Director / Founder</span>
                  <span className="text-slate-900 font-semibold">Mr. Amar Soni (MCA, Data Science)</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Official Center: <strong className="text-slate-700">{result.certificate.centerName}</strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCert(result.certificate)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0f2942] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d60] transition-colors shadow-sm"
                >
                  <Eye className="w-4 h-4" /> View Full Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateDocument
          certificate={selectedCert}
          settings={settings}
          studentPhoto={result?.certificate?.photoUrl}
          isModal={true}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
