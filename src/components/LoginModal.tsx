import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { UserRole, User } from '../types/index.ts';
import { X, Lock, ShieldCheck, Building2, GraduationCap, AlertCircle, KeyRound } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  defaultRole?: UserRole;
}

export const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'admin',
}) => {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please provide email, enrollment number or registered mobile.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ identifier, password, role });
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError('Connection error while logging in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    setRole(demoRole);
    if (demoRole === 'admin') {
      setIdentifier('admin@advancecomputerinstitute.com');
      setPassword('admin');
    } else if (demoRole === 'franchise') {
      setIdentifier('franchise@advancecomputerinstitute.com');
      setPassword('admin');
    } else if (demoRole === 'student') {
      setIdentifier('student@advancecomputerinstitute.com');
      setPassword('admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#0f2942]" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Institute Portal Login
              </h3>
              <p className="text-xs text-slate-500">
                Advance Institute of Digital Technology • Ayodhya Cantt
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

        {/* Role Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              role === 'admin'
                ? 'bg-white text-[#0f2942] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('franchise');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              role === 'franchise'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Franchise
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              role === 'student'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Student
          </button>
        </div>

        {/* Quick Demo Autofill Bar */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-amber-900 font-semibold mb-1">
            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
            <span>Instant Demo Account Sign-In:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-medium text-[11px]"
            >
              Demo Admin (Director)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('franchise')}
              className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded font-medium text-[11px]"
            >
              Demo Franchise Center
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-medium text-[11px]"
            >
              Demo Student
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'student'
                ? 'Enrollment No / Email / Mobile'
                : 'Registered Email or Center ID'}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                role === 'student'
                  ? 'e.g. ACI/ENR/2026/000001 or student@advance...'
                  : role === 'franchise'
                  ? 'franchise@advancecomputerinstitute.com'
                  : 'admin@advancecomputerinstitute.com'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0f2942] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d60] transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : `Sign in to ${role.toUpperCase()} Portal`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
