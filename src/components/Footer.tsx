import React from 'react';
import { InstituteSettings } from '../types/index.ts';
import { ShieldCheck, MapPin, Phone, Mail, Globe, Award, CheckCircle2 } from 'lucide-react';

interface Props {
  settings: InstituteSettings;
  setActiveView: (view: any) => void;
  onOpenAdmission: () => void;
  onOpenFranchise: () => void;
  onOpenLogin: (role?: any) => void;
}

export const Footer: React.FC<Props> = ({
  settings,
  setActiveView,
  onOpenAdmission,
  onOpenFranchise,
  onOpenLogin,
}) => {
  return (
    <footer className="bg-[#0b1c2d] text-slate-300 text-xs border-t-4 border-[#d4af37] no-print">
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Column 1: Institute Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={settings.logoUrl || '/logo.svg'}
              alt="Advance Institute of Digital Technology"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className="font-cinzel font-bold text-sm text-white tracking-wider">
                {settings.instituteName}
              </h3>
              <p className="text-[10px] text-amber-400 font-semibold">
                Director: {settings.directorName} ({settings.directorQualification})
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Autonomous computer training and professional information technology institute dedicated to youth empowerment, vocational computer literacy, and advanced data sciences.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO 9001:2015 Certified Educational Institution</span>
          </div>
        </div>

        {/* Column 2: Quick Portals & Verification */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-700 pb-2">
            Verification &amp; Portals
          </h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveView('verify-cert')}
                className="hover:text-amber-300 transition-colors text-left flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Verify Student Certificate</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveView('verify-mark')}
                className="hover:text-blue-300 transition-colors text-left flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Verify Academic Marksheet</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLogin('student')}
                className="hover:text-slate-100 transition-colors text-left"
              >
                Student Portal Login
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLogin('franchise')}
                className="hover:text-slate-100 transition-colors text-left"
              >
                Franchise Center Login
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLogin('admin')}
                className="hover:text-slate-100 transition-colors text-left"
              >
                Admin Examination Board Login
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Popular Programs */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-700 pb-2">
            Academic Courses
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>ADCA (Advanced Diploma in Computer Applications)</li>
            <li>DCA (Diploma in Computer Applications)</li>
            <li>CCC (Course on Computer Concepts)</li>
            <li>Python &amp; Data Science Specialist</li>
            <li>Tally Prime with GST &amp; Financial Accounting</li>
            <li>Desktop Publishing (Photoshop / CorelDraw)</li>
            <li>Full Stack Web Development</li>
          </ul>
        </div>

        {/* Column 4: Official Headquarters & Address */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-700 pb-2">
            Head Office / Ayodhya Cantt
          </h4>
          <div className="space-y-2 text-slate-400 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Near Grammar Academy Chauraha, Kaushalpuri Phase 1, Ayodhya Cantt, Ayodhya – 224001, Uttar Pradesh, India
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono">6306242129 / 8382819908</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <span>advancecomputerinstitute2026@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-mono">advancecomputerinstitute.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#071320] border-t border-slate-800 py-4 px-4 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY. All Rights Reserved. Director: Mr. Amar Soni (MCA, Data Science).
          </div>
          <div className="text-[10px] text-slate-400">
            Official QR Verification Enabled • ISO 9001:2015 Educational Standard
          </div>
        </div>
      </div>
    </footer>
  );
};
