import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft, ChevronRight, Pause, Play, Sparkles, ExternalLink, Megaphone } from 'lucide-react';
import { NoticeItem } from '../types/index.ts';

interface NoticeBoardTickerProps {
  notices: NoticeItem[];
  onOpenAdmission?: () => void;
  onOpenFranchise?: () => void;
  onNavigateVerification?: (type: 'certificate' | 'marksheet') => void;
  onOpenAdminNotices?: () => void;
  isAdmin?: boolean;
}

export const NoticeBoardTicker: React.FC<NoticeBoardTickerProps> = ({
  notices,
  onOpenAdmission,
  onOpenFranchise,
  onNavigateVerification,
  onOpenAdminNotices,
  isAdmin,
}) => {
  const activeNotices = notices.filter((n) => n.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto transition every 4.5 seconds
  useEffect(() => {
    if (activeNotices.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, activeNotices.length]);

  if (activeNotices.length === 0) return null;

  const currentNotice = activeNotices[currentIndex] || activeNotices[0];

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeNotices.length);
      setIsAnimating(false);
    }, 250);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + activeNotices.length) % activeNotices.length);
      setIsAnimating(false);
    }, 250);
  };

  const handleNoticeClick = (notice: NoticeItem) => {
    if (!notice.linkUrl) return;
    const url = notice.linkUrl.toLowerCase();
    if (url.includes('admission') && onOpenAdmission) {
      onOpenAdmission();
    } else if (url.includes('franchise') && onOpenFranchise) {
      onOpenFranchise();
    } else if (url.includes('verify') && onNavigateVerification) {
      onNavigateVerification('certificate');
    } else if (url.includes('course')) {
      const el = document.getElementById('courses-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0f2942] to-slate-900 text-white border-y border-amber-500/40 shadow-sm relative z-30">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs">
        {/* Left Notice Board Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-md tracking-wider uppercase text-[10px] sm:text-xs shadow-xs">
            <Megaphone className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
            <span>Notice Board</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 text-amber-300 font-mono text-[10px] rounded">
            {currentIndex + 1} of {activeNotices.length}
          </span>
        </div>

        {/* Center: Alternating Notice Message */}
        <div
          className="flex-1 min-w-0 overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => handleNoticeClick(currentNotice)}
        >
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Priority Tag */}
            {currentNotice.priority === 'urgent' && (
              <span className="shrink-0 px-2 py-0.5 bg-red-600 text-white font-extrabold text-[10px] rounded uppercase tracking-wider animate-pulse">
                URGENT
              </span>
            )}
            {currentNotice.priority === 'highlight' && (
              <span className="shrink-0 px-2 py-0.5 bg-amber-400 text-slate-950 font-bold text-[10px] rounded uppercase tracking-wider">
                FEATURED
              </span>
            )}
            {currentNotice.priority === 'normal' && (
              <span className="shrink-0 px-2 py-0.5 bg-blue-600 text-white font-semibold text-[10px] rounded uppercase tracking-wider">
                ANNOUNCEMENT
              </span>
            )}

            {/* Title & Body */}
            <span className="font-bold text-amber-200 truncate">
              {currentNotice.title}:
            </span>
            <span className="text-slate-200 truncate font-normal">
              {currentNotice.content}
            </span>

            {/* Action CTA */}
            {currentNotice.linkText && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white underline shrink-0 ml-1">
                <span>{currentNotice.linkText}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume notice auto-scroll' : 'Pause notice auto-scroll'}
            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          <button
            onClick={handlePrev}
            title="Previous notice"
            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            title="Next notice"
            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {isAdmin && onOpenAdminNotices && (
            <button
              onClick={onOpenAdminNotices}
              className="ml-2 px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Notices</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
