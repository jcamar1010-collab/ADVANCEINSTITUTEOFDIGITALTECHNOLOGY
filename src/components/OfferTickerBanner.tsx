import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, ArrowRight, X, Flame, Building2 } from 'lucide-react';
import { InstituteSettings } from '../types/index.ts';

interface OfferTickerBannerProps {
  settings: InstituteSettings;
  onOpenOfferModal: () => void;
  onOpenAdmission: () => void;
  onOpenFranchise?: () => void;
}

export const OfferTickerBanner: React.FC<OfferTickerBannerProps> = ({
  settings,
  onOpenOfferModal,
  onOpenAdmission,
  onOpenFranchise,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 0,
    seconds: 0,
  });
  const [isDismissed, setIsDismissed] = useState(false);

  // Persistent 14-hour countdown timer stored in localStorage so it remains synchronized
  // across page reloads and when users log in
  useEffect(() => {
    const STORAGE_KEY = 'aidt_offer_deadline_v1';
    let deadlineMs: number;

    const storedDeadline = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (storedDeadline && !isNaN(parseInt(storedDeadline)) && parseInt(storedDeadline) > now) {
      deadlineMs = parseInt(storedDeadline);
    } else {
      // 14 hours from now
      deadlineMs = now + 14 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, deadlineMs.toString());
    }

    const updateTimer = () => {
      const current = Date.now();
      const diff = Math.max(0, deadlineMs - current);

      if (diff <= 0) {
        // If expired, loop or set 0
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isDismissed || settings.offerTickerEnabled === false) {
    return null;
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-red-700 via-amber-600 to-red-800 text-white shadow-md relative z-40 overflow-hidden border-b border-amber-400/30">
      {/* Animated subtle shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 relative text-xs">
        {/* Left: Offer Tagline with Pulse Fire */}
        <div className="flex items-center gap-2 font-bold tracking-wide">
          <span className="flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border border-amber-300/40 text-amber-200">
            <Flame className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
            20% Extra Off This Week
          </span>
          <span className="hidden md:inline font-medium text-amber-100">
            {settings.offerTickerText || 'Flat 20% discount on every course this week • ADCA at ₹6,500, Tally Prime + GST at ₹3,000!'}
          </span>
        </div>

        {/* Center: Live 14-Hour Countdown Clock */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-lg border border-amber-400/40 font-mono shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin-slow shrink-0" />
          <span className="text-[11px] text-amber-200 font-sans font-semibold mr-1 hidden sm:inline">
            Offer Ends In:
          </span>
          <div className="flex items-center gap-1 font-bold text-white tracking-widest text-xs sm:text-sm">
            <span className="bg-red-950/80 px-1.5 py-0.5 rounded text-yellow-300">
              {formatNumber(timeLeft.hours)}h
            </span>
            <span className="text-amber-300 animate-pulse">:</span>
            <span className="bg-red-950/80 px-1.5 py-0.5 rounded text-yellow-300">
              {formatNumber(timeLeft.minutes)}m
            </span>
            <span className="text-amber-300 animate-pulse">:</span>
            <span className="bg-red-950/80 px-1.5 py-0.5 rounded text-yellow-300">
              {formatNumber(timeLeft.seconds)}s
            </span>
          </div>
          <span className="text-[10px] text-yellow-200 uppercase font-sans font-bold ml-1">
            Left
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          {onOpenFranchise && (
            <button
              onClick={onOpenFranchise}
              className="px-2.5 py-1 bg-blue-950 hover:bg-slate-900 border border-amber-300 text-white rounded-md text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Building2 className="w-3 h-3 text-amber-300" />
              <span>Free Franchise:</span>
              <span className="line-through text-red-300 text-[10px] font-normal">₹1,100</span>
              <span className="bg-emerald-600 text-white text-[9px] px-1 rounded font-black">₹0 (ZERO FEE)</span>
            </button>
          )}

          <button
            onClick={onOpenOfferModal}
            className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold rounded-md shadow-sm text-[11px] flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-red-700" />
            <span>Discounts</span>
          </button>

          <button
            onClick={onOpenAdmission}
            className="hidden lg:flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-md text-[11px] transition-colors cursor-pointer"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Close notification"
            className="p-1 hover:bg-black/20 rounded text-amber-200 hover:text-white transition-colors ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
