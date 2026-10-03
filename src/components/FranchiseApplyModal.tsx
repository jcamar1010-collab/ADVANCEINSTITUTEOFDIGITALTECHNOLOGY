import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { X, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FranchiseApplyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    centerName: '',
    ownerName: '',
    mobile: '',
    email: '',
    address: '',
    district: 'Ayodhya',
    state: 'Uttar Pradesh',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.centerName || !formData.ownerName || !formData.mobile) {
      setError('Please provide Center Name, Center Director Name, and Mobile Number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.applyFranchise(formData);
      if (res.success && res.franchise) {
        setSubmitted(res.franchise);
      } else {
        setError(res.error || 'Failed to submit franchise application.');
      }
    } catch (err: any) {
      setError('Network error while submitting franchise application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 relative animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-800" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Franchise Center Affiliation Application
              </h3>
              <p className="text-xs text-slate-500">
                Partner with Advance Institute of Digital Technology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              Franchise Application Registered!
            </h4>
            <p className="text-slate-600 text-xs mt-1 max-w-md mx-auto">
              Your application for authorized center affiliation has been submitted to Director Mr. Amar Soni for verification.
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Center Code (Provisional):</span>
                <span className="font-mono font-bold text-blue-900">{submitted.centerCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Center Name:</span>
                <span className="font-semibold text-slate-800">{submitted.centerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Center Head:</span>
                <span className="font-medium text-slate-800">{submitted.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                  Pending Admin Approval
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-[#0f2942] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d60] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Study Center Name *
              </label>
              <input
                type="text"
                required
                value={formData.centerName}
                onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                placeholder="e.g. ACI City Branch / Computer Academy"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Center Director / Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. center@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Physical Address of Proposed Center
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Market, Near Landmark, Ayodhya, Uttar Pradesh"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#1e3a8a] text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Submitting Application...' : 'Submit Affiliation Form'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
