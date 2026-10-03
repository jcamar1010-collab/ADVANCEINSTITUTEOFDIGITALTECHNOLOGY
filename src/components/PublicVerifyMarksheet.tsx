import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { InstituteSettings, MarksheetRecord } from '../types/index.ts';
import { MarksheetDocument } from './MarksheetDocument.tsx';
import { ShieldCheck, Search, AlertTriangle, Eye, CheckCircle, FileSpreadsheet } from 'lucide-react';

interface Props {
  initialSearch?: string;
  settings?: InstituteSettings;
}

export const PublicVerifyMarksheet: React.FC<Props> = ({ initialSearch = '', settings }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch || 'ACI/MARK/2026/000001');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMark, setSelectedMark] = useState<MarksheetRecord | null>(null);

  const handleVerify = async (termToSearch?: string) => {
    const term = (termToSearch || searchTerm).trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.verifyMarksheet(term);
      if (data.valid) {
        setResult(data);
      } else if (data.status === 'REVOKED') {
        setResult(data);
      } else {
        setError(data.message || 'No approved marksheet found matching this identifier.');
      }
    } catch (err: any) {
      setError('Unable to query marksheet database. Please check your network connection.');
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold rounded-full mb-3">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Official Academic Transcript Verification Portal
        </div>
        <h1 className="text-3xl font-extrabold text-[#0f2942] tracking-tight">
          Verify Student Marksheet
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-xl mx-auto">
          Enter Marksheet Number, Student Enrollment Number, or Registration Number to verify academic scores and statement of marks.
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
              placeholder="e.g. ACI/MARK/2026/000001 or ACI/ENR/2026/000001"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm font-mono font-medium focus:ring-2 focus:ring-blue-900 focus:border-blue-900 uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#1e3a8a] text-white font-semibold text-sm rounded-lg hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-blue-200" />
                Verify Marksheet
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
              setSearchTerm('ACI/MARK/2026/000001');
              handleVerify('ACI/MARK/2026/000001');
            }}
            className="text-blue-700 underline font-mono hover:text-blue-800"
          >
            ACI/MARK/2026/000001
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm mt-3 font-medium">Querying authoritative marks database...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center mb-8">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <h3 className="font-bold text-red-900 text-base">Record Not Found or Pending Approval</h3>
          <p className="text-red-700 text-sm mt-1 max-w-lg mx-auto">
            {error} Note: Marks records in 'Pending Admin Verification' are not visible until approved by the Examination Controller.
          </p>
        </div>
      )}

      {/* REVOKED Notice */}
      {result && result.status === 'REVOKED' && !loading && (
        <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg mb-8 text-center animate-in fade-in">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-2xl font-black uppercase tracking-wider">
            MARKSHEET REVOKED
          </h2>
          <p className="font-medium text-red-100 text-sm mt-1 max-w-md mx-auto">
            This marksheet ({result.marksheetNumber}) has been officially cancelled and invalidated.
          </p>
          <div className="mt-4 p-3 bg-red-600/80 rounded-lg inline-block text-xs font-mono">
            Reason: {result.revocationReason || 'Revoked by the examination authority'}
          </div>
        </div>
      )}

      {/* VERIFIED Result Card */}
      {result && result.valid && result.marksheet && !loading && (
        <div className="bg-white border-2 border-blue-600 rounded-xl shadow-xl overflow-hidden mb-8 animate-in fade-in">
          {/* Verified Header Strip */}
          <div className="bg-[#1e3a8a] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-6 h-6 text-white" />
              <div>
                <h3 className="font-bold text-lg tracking-wide uppercase">
                  Verified Statement of Marks — Genuine
                </h3>
                <p className="text-blue-200 text-xs">
                  Official Academic Record issued by Advance Institute of Digital Technology
                </p>
              </div>
            </div>
            <div className="bg-blue-900/80 px-3 py-1 rounded text-xs font-mono font-bold tracking-wider">
              RESULT: {result.marksheet.result}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm mb-6 pb-6 border-b border-slate-200">
              <div>
                <span className="text-slate-500 text-xs font-medium block">Student Name</span>
                <span className="text-slate-900 font-bold text-base">{result.marksheet.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">Father's Name</span>
                <span className="text-slate-800 font-semibold">{result.marksheet.fatherName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">Course Name</span>
                <span className="text-blue-900 font-bold">{result.marksheet.courseName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">Enrollment &amp; Registration</span>
                <span className="text-slate-800 font-mono font-semibold">{result.marksheet.enrollmentNumber} / {result.marksheet.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">Marksheet Number</span>
                <span className="text-[#1e3a8a] font-mono font-bold">{result.marksheet.marksheetNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-medium block">Overall Score &amp; Grade</span>
                <span className="text-emerald-700 font-bold">{result.marksheet.totalObtained} / {result.marksheet.totalMax} ({result.marksheet.percentage}%) — Grade {result.marksheet.grade}</span>
              </div>
            </div>

            {/* Read-Only Subject Table */}
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Verified Module Marks
            </h4>
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2 border-b">Subject</th>
                    <th className="p-2 border-b text-center">Max</th>
                    <th className="p-2 border-b text-center">Theory</th>
                    <th className="p-2 border-b text-center">Practical</th>
                    <th className="p-2 border-b text-center">Internal</th>
                    <th className="p-2 border-b text-center font-bold">Obtained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.marksheet.subjects.map((sub: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-800">{sub.subjectName}</td>
                      <td className="p-2 text-center text-slate-600 font-mono">{sub.maxMarks}</td>
                      <td className="p-2 text-center text-slate-600 font-mono">{sub.theoryMarks}</td>
                      <td className="p-2 text-center text-slate-600 font-mono">{sub.practicalMarks}</td>
                      <td className="p-2 text-center text-slate-600 font-mono">{sub.internalMarks}</td>
                      <td className="p-2 text-center font-mono font-bold text-blue-900 bg-blue-50/50">
                        {sub.obtainedMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Director: <strong className="text-slate-700">Mr. Amar Soni (MCA, Data Science)</strong>
              </div>
              <button
                onClick={() => setSelectedMark(result.marksheet)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a8a] text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4" /> View Full Printable Marksheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marksheet Modal */}
      {selectedMark && (
        <MarksheetDocument
          marksheet={selectedMark}
          settings={settings}
          studentPhoto={result?.marksheet?.photoUrl}
          isModal={true}
          onClose={() => setSelectedMark(null)}
        />
      )}
    </div>
  );
};
