import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, ArrowRight, X, Sparkles, Crown } from 'lucide-react';
import { MediaItem } from '../types';

interface HotFlashSaleStickyBannerProps {
  onUnlockFlashSale: () => void;
  bestDealItem?: MediaItem | null;
}

export const HotFlashSaleStickyBanner: React.FC<HotFlashSaleStickyBannerProps> = ({
  onUnlockFlashSale,
  bestDealItem
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem('flash_sale_sec');
    return saved ? parseInt(saved, 10) : 348; // 5 mins 48 secs
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 360; // reset to 6 mins
        }
        const next = prev - 1;
        sessionStorage.setItem('flash_sale_sec', next.toString());
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (!isVisible) return null;

  return (
    <div
      id="hot-flash-sale-sticky-banner"
      className="sticky top-0 z-40 w-full bg-gradient-to-r from-rose-950 via-purple-950 to-rose-950 text-white border-b-2 border-rose-500/80 shadow-2xl py-2 px-3 sm:px-4 backdrop-blur-xl animate-in slide-in-from-top duration-300 select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Fire Pulse & Urgency Message */}
        <div className="flex items-center gap-2.5 text-center sm:text-left flex-wrap justify-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider animate-pulse shadow-md">
            <Flame className="w-3.5 h-3.5 text-yellow-200 fill-yellow-300 animate-flame" />
            <span>🔥 85% छूट MEGA OFFER</span>
          </span>

          <p className="text-xs sm:text-sm font-black text-rose-100 flex items-center gap-1.5 drop-shadow-sm">
            <span>Ruma का सबसे बोल्ड अनसेंसर्ड VIP कंटेंट आज सिर्फ</span>
            <span className="text-yellow-300 font-extrabold text-sm sm:text-base underline decoration-rose-400 font-mono">
              ₹49
            </span>
            <span>में!</span>
          </p>

          {/* Countdown Clock */}
          <div className="inline-flex items-center gap-1 bg-black/60 border border-rose-400/50 px-2 py-0.5 rounded-lg text-yellow-300 font-mono font-black text-xs shadow-inner">
            <Clock className="w-3 h-3 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{timeFormatted}</span>
            <span className="text-[10px] text-rose-300 font-normal">बाकी</span>
          </div>
        </div>

        {/* Right: Instant 1-Click CTA & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="flash-sale-cta-btn"
            type="button"
            onClick={onUnlockFlashSale}
            className="hot-vip-btn py-1.5 sm:py-2 px-3.5 sm:px-5 rounded-full text-xs font-black text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/50 hover:scale-105 active:scale-95 transition-transform cursor-pointer border border-white/40 uppercase tracking-tight font-display"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-bounce" />
            <span>⚡ 1-क्लिक अनलॉक करें</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </button>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="बंद करें"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
