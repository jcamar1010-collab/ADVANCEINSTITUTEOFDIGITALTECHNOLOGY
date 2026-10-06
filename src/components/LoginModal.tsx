import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { UserRole, User } from '../types/index.ts';
import {
  X,
  Lock,
  ShieldCheck,
  Building2,
  GraduationCap,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Phone,
} from 'lucide-react';

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

  // Forgot password mode
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotRole, setForgotRole] = useState<'student' | 'franchise'>('student');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please provide your login ID, email, enrollment number or registered mobile.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ identifier: identifier.trim(), password, role });
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError('Connection error while logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotMobile.trim()) {
      setError('Please enter your registered mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    setForgotSuccess(null);

    try {
      const res = await api.requestForgotPassword({
        role: forgotRole,
        registeredMobile: forgotMobile.trim(),
        identifier: forgotIdentifier.trim(),
      });
      if (res.success) {
        setForgotSuccess(res.message);
      } else {
        setError(res.error || 'Failed to submit password reset request.');
      }
    } catch (err: any) {
      setError('Network error while requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0f2942] text-amber-400 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {isForgotMode ? 'Password Recovery' : 'Institute Portal Login'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Advance Institute of Digital Technology • Ayodhya Cantt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Regular Login View */}
        {!isForgotMode ? (
          <>
            {/* Role Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-white text-[#0f2942] shadow-xs font-bold'
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
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'franchise'
                    ? 'bg-white text-blue-900 shadow-xs font-bold'
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
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Student
              </button>
            </div>

            {/* Login Form */}
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
                    ? 'Enrollment No / Registration No / Registered Mobile'
                    : role === 'franchise'
                    ? 'Center Code / Email / Registered Mobile'
                    : 'Admin User ID, Email or Mobile'}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    role === 'student'
                      ? 'e.g. ACI/ENR/2026/000001 or 9876543210'
                      : role === 'franchise'
                      ? 'e.g. ACI-AYD-01 or registered mobile'
                      : 'e.g. admin or admin@advancecomputerinstitute.com'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  {(role === 'student' || role === 'franchise') && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setForgotRole(role);
                        setError(null);
                        setForgotSuccess(null);
                        setForgotMobile(identifier.replace(/[^0-9]/g, ''));
                      }}
                      className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
                  className="w-full py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : `Sign in to ${role.toUpperCase()} Portal`}
                </button>
              </div>

              {role === 'admin' && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 text-center">
                  <span>Protected Director &amp; Administrator Gateway • Authorized personnel only.</span>
                </div>
              )}
            </form>
          </>
        ) : (
          /* Forgot Password View */
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setIsForgotMode(false);
                setError(null);
                setForgotSuccess(null);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Request Submitted Successfully!
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {forgotSuccess}
                </p>
                <div className="p-3 bg-white rounded-lg border border-emerald-200 text-[11px] text-slate-600 text-left space-y-1">
                  <div>📞 Central Helpline: <strong>6306242129 / 8382819908</strong></div>
                  <div>Director Amar Soni will dispatch your new credentials directly to your registered number.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setError(null);
                    setForgotSuccess(null);
                  }}
                  className="w-full py-2 bg-[#0f2942] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#1a3d60]"
                >
                  Return to Login Screen
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Registered Mobile Verification</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Enter the phone number used during admission or franchise affiliation. Director Amar Soni will review and dispatch your new password directly to this number.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotRole('student')}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        forgotRole === 'student'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotRole('franchise')}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        forgotRole === 'franchise'
                          ? 'bg-blue-50 border-blue-500 text-blue-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Franchise Center
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={forgotMobile}
                    onChange={(e) => setForgotMobile(e.target.value)}
                    placeholder="10-digit registered mobile number"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {forgotRole === 'student' ? 'Enrollment Number (Optional)' : 'Center Code (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder={forgotRole === 'student' ? 'e.g. ACI/ENR/2026/000001' : 'e.g. ACI-AYD-02'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Submitting Request...' : 'Send Password Reset Request to Admin'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
