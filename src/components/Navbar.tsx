import React, { useState } from 'react';
import { InstituteSettings, User } from '../types/index.ts';
import {
  ShieldCheck,
  FileCheck,
  Award,
  UserPlus,
  Building2,
  Lock,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface Props {
  settings: InstituteSettings;
  activeView: string;
  setActiveView: (view: any) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAdmission: () => void;
  onOpenFranchise: () => void;
  onOpenLogin: (role?: any) => void;
}

export const Navbar: React.FC<Props> = ({
  settings,
  activeView,
  setActiveView,
  currentUser,
  onLogout,
  onOpenAdmission,
  onOpenFranchise,
  onOpenLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verifyDropdownOpen, setVerifyDropdownOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      {/* Top Institutional Notification Bar */}
      <div className="bg-[#0f2942] text-slate-200 text-[11px] py-1.5 px-4 border-b border-[#1a3d60]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-amber-300 font-medium">
              <MapPin className="w-3 h-3 text-amber-400" />
              Ayodhya Cantt – 224001, Uttar Pradesh
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:flex items-center gap-1 font-mono text-slate-300">
              <Phone className="w-3 h-3 text-emerald-400" />
              6306242129 / 8382819908
            </span>
            <span className="hidden lg:inline text-slate-400">|</span>
            <span className="hidden lg:flex items-center gap-1 text-slate-300">
              <Mail className="w-3 h-3 text-sky-400" />
              advancecomputerinstitute2026@gmail.com
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-[#1a3d60] px-2 py-0.5 rounded text-amber-300 font-semibold tracking-wider uppercase">
              Director: Mr. Amar Soni (MCA, Data Science)
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Institute Branding & Logo */}
        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <img
            src={settings.logoUrl || '/logo.svg'}
            alt="Advance Institute of Digital Technology Logo"
            className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="font-cinzel text-xs font-bold text-amber-700 tracking-wider">
              ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY
            </div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight">
              Near Grammar Academy Chauraha, Kaushalpuri Phase 1, Ayodhya Cantt
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setActiveView('home')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'home' ? 'text-amber-800 bg-amber-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </button>

          {/* Verification Dropdown */}
          <div className="relative">
            <button
              onClick={() => setVerifyDropdownOpen(!verifyDropdownOpen)}
              onBlur={() => setTimeout(() => setVerifyDropdownOpen(false), 200)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                activeView === 'verify-cert' || activeView === 'verify-mark'
                  ? 'text-amber-800 bg-amber-50 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online Verification</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {verifyDropdownOpen && (
              <div className="absolute left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
                <button
                  onClick={() => {
                    setActiveView('verify-cert');
                    setVerifyDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Verify Student Certificate</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('verify-mark');
                    setVerifyDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Verify Marksheet Transcript</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenAdmission}
            className="flex items-center gap-1 px-3 py-1.5 text-amber-900 hover:bg-amber-50 rounded-md font-semibold"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-700" /> Admission
          </button>

          <button
            onClick={onOpenFranchise}
            className="flex items-center gap-1 px-3 py-1.5 text-blue-900 hover:bg-blue-50 rounded-md font-semibold"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-700" /> Franchise Center
          </button>

          {/* User Logged in / Portals Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setActiveView(currentUser.role)}
                className="px-3 py-1.5 bg-[#0f2942] text-white rounded-md text-xs font-semibold hover:bg-[#1a3d60] shadow-xs flex items-center gap-1.5"
              >
                <span>{currentUser.role.toUpperCase()} PORTAL</span>
              </button>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative ml-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                onBlur={() => setTimeout(() => setPortalDropdownOpen(false), 200)}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-[#0f2942] text-white text-xs font-semibold rounded-md hover:bg-[#1a3d60] transition-colors shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Portal Logins</span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
                  <button
                    onClick={() => {
                      onOpenLogin('student');
                      setPortalDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                  >
                    Student Portal
                  </button>
                  <button
                    onClick={() => {
                      onOpenLogin('franchise');
                      setPortalDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                  >
                    Franchise Center Portal
                  </button>
                  <button
                    onClick={() => {
                      onOpenLogin('admin');
                      setPortalDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900"
                  >
                    Admin Examination Board
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => setActiveView(currentUser.role)}
              className="px-2.5 py-1 bg-[#0f2942] text-white text-xs rounded font-semibold"
            >
              {currentUser.role.toUpperCase()}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveView('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-slate-800 border-b border-slate-100"
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveView('verify-cert');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-amber-900 border-b border-slate-100 flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-amber-600" /> Verify Certificate
          </button>
          <button
            onClick={() => {
              setActiveView('verify-mark');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-blue-900 border-b border-slate-100 flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-blue-600" /> Verify Marksheet
          </button>
          <button
            onClick={() => {
              onOpenAdmission();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-slate-800 border-b border-slate-100"
          >
            Student Admission Form
          </button>
          <button
            onClick={() => {
              onOpenFranchise();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-slate-800 border-b border-slate-100"
          >
            Franchise Application
          </button>

          {!currentUser ? (
            <div className="pt-2 grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  onOpenLogin('student');
                  setMobileMenuOpen(false);
                }}
                className="py-2 bg-emerald-50 text-emerald-800 rounded text-center text-[11px] font-bold"
              >
                Student Login
              </button>
              <button
                onClick={() => {
                  onOpenLogin('franchise');
                  setMobileMenuOpen(false);
                }}
                className="py-2 bg-blue-50 text-blue-800 rounded text-center text-[11px] font-bold"
              >
                Franchise
              </button>
              <button
                onClick={() => {
                  onOpenLogin('admin');
                  setMobileMenuOpen(false);
                }}
                className="py-2 bg-[#0f2942] text-white rounded text-center text-[11px] font-bold"
              >
                Admin
              </button>
            </div>
          ) : (
            <div className="pt-2 flex justify-between items-center border-t border-slate-200">
              <span className="text-slate-500 font-normal">Logged in as {currentUser.name}</span>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-red-600 font-bold"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
