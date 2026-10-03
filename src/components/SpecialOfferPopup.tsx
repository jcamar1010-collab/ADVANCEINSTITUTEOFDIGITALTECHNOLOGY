import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, CheckCircle2, Flame, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import { Course, InstituteSettings } from '../types/index.ts';

interface SpecialOfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmission: (courseId?: string) => void;
  courses: Course[];
  settings: InstituteSettings;
}

export const SpecialOfferPopup: React.FC<SpecialOfferPopupProps> = ({
  isOpen,
  onClose,
  onOpenAdmission,
  courses,
  settings,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const STORAGE_KEY = 'aidt_offer_deadline_v1';
    let deadlineMs: number;
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (stored && !isNaN(parseInt(stored)) && parseInt(stored) > now) {
      deadlineMs = parseInt(stored);
    } else {
      deadlineMs = now + 14 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, deadlineMs.toString());
    }

    const timer = () => {
      const diff = Math.max(0, deadlineMs - Date.now());
      const totalSecs = Math.floor(diff / 1000);
      setTimeLeft({
        hours: Math.floor(totalSecs / 3600),
        minutes: Math.floor((totalSecs % 3600) / 60),
        seconds: totalSecs % 60,
      });
    };
    timer();
    const interval = setInterval(timer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleApplyCourse = (courseId?: string) => {
    onClose();
    onOpenAdmission(courseId);
  };

  const handleDoNotShowAgain = () => {
    localStorage.setItem('aidt_offer_popup_dismissed_v1', Date.now().toString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border-2 border-amber-400 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0f2942] via-[#1a3d60] to-[#0f2942] text-white p-5 sm:p-6 text-center relative border-b-4 border-amber-500">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            Limited Period Admission Offer • Session 2026-2027
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">
            Flat 20% Extra Off On Every Course This Week!
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl mx-auto">
            {settings.instituteName} — Certified by Director Mr. Amar Soni (MCA, Data Science)
          </p>

          {/* Clock Strip */}
          <div className="mt-3 inline-flex items-center gap-2 bg-black/50 border border-amber-400/50 px-4 py-1.5 rounded-xl font-mono shadow-inner">
            <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
              Offer Expires In:
            </span>
            <div className="flex items-center gap-1 font-bold text-base sm:text-lg text-yellow-300">
              <span className="bg-red-950 px-2 py-0.5 rounded border border-red-800">
                {timeLeft.hours.toString().padStart(2, '0')}h
              </span>
              <span className="text-amber-400 animate-pulse">:</span>
              <span className="bg-red-950 px-2 py-0.5 rounded border border-red-800">
                {timeLeft.minutes.toString().padStart(2, '0')}m
              </span>
              <span className="text-amber-400 animate-pulse">:</span>
              <span className="bg-red-950 px-2 py-0.5 rounded border border-red-800">
                {timeLeft.seconds.toString().padStart(2, '0')}s
              </span>
            </div>
            <span className="text-[11px] text-amber-300 font-bold uppercase">Left</span>
          </div>
        </div>

        {/* Courses Pricing List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Special Discounted Fee Structure</span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full">
              Includes Verified Certificate + Marksheet
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {courses.map((course) => {
              const origFee = course.originalFee || Math.round(course.fee * 1.5);
              const discount = course.originalFee ? Math.round(((course.originalFee - course.fee) / course.originalFee) * 100) : 40;

              return (
                <div
                  key={course.id}
                  className="bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 rounded-xl p-3.5 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-mono font-bold rounded">
                        {course.code}
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-200">
                        {course.badgeText || `${discount}% OFF`}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {course.name}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Duration: {course.duration}
                    </div>

                    {/* Price Comparison */}
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-lg font-black text-emerald-700">
                        ₹{course.fee.toLocaleString()}
                      </span>
                      <span className="text-xs line-through text-slate-400 font-semibold">
                        ₹{origFee.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyCourse(course.id)}
                    className="mt-3 w-full py-1.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Apply at ₹{course.fee.toLocaleString()}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust Guarantees */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-slate-700 flex flex-wrap items-center justify-around gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ISO 9001:2015 Registered Board</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Autonomous Government Format Certs</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Instant QR Verification</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={handleDoNotShowAgain}
            className="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
          >
            Don't show this announcement again today
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer text-xs"
            >
              Continue Browsing
            </button>
            <button
              onClick={() => handleApplyCourse()}
              className="flex-1 sm:flex-initial px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>Claim Discount &amp; Apply Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
