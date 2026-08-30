import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Zap, Gift, X, Lock, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import confetti from 'canvas-confetti';

interface StopUserExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockItem: (item: MediaItem) => void;
  onOpenWheel: () => void;
  featuredItem?: MediaItem | null;
}

export const StopUserExitModal: React.FC<StopUserExitModalProps> = ({
  isOpen,
  onClose,
  onUnlockItem,
  onOpenWheel,
  featuredItem
}) => {
  const [timeLeft, setTimeLeft] = useState(179); // 2m 59s

  useEffect(() => {
    if (!isOpen) return;

    // Trigger sweet festive confetti when modal opens
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !featuredItem) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const discountedPrice = Math.max(29, Math.min(featuredItem.price, 49));
  const originalPrice = Math.max(featuredItem.price * 4, 399);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-purple-950 via-zinc-950 to-purple-950 rounded-3xl border-2 border-rose-500 shadow-2xl p-5 sm:p-6 text-white overflow-hidden fire-border-glow">
        
        {/* Ambient Top Flame Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-rose-600/50 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Hook */}
        <div className="text-center space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg animate-bounce">
            <Flame className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
            <span>💋 रुको जानेमन! आपके लिए स्पेशल सीक्रेट ऑफर</span>
          </span>

          <h3 className="text-lg sm:text-xl font-black text-white font-display tracking-tight leading-snug drop-shadow-md">
            जा रहे हो क्या? <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-rose-400">90% VIP डिस्काउंट</span> अभी क्लेम करें!
          </h3>

          <p className="text-xs text-rose-200/90 font-medium leading-relaxed">
            कूपन कोड <span className="font-mono font-black text-yellow-300 bg-rose-900/60 px-1.5 py-0.5 rounded border border-rose-400">HOT90</span> आपके लिए एक्टिवेट हो चुका है।
          </p>
        </div>

        {/* Special Item Preview Card with Hot Blur & Scarcity */}
        <div className="my-4 p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-3 backdrop-blur-md relative overflow-hidden">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-rose-400/80">
            <img
              src={featuredItem.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover filter blur-[3px] scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-rose-300 uppercase">🔥 सबसे लोकप्रिय VIP</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate drop-shadow-sm">
              {featuredItem.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/50 line-through">₹{originalPrice}</span>
              <span className="text-base sm:text-lg font-black text-yellow-300 font-display">
                {formatINR(discountedPrice)}
              </span>
              <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded">
                90% OFF
              </span>
            </div>
          </div>
        </div>

        {/* Countdown Urgency Timer */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-black/60 border border-yellow-500/40 text-yellow-300 text-xs font-mono font-black mb-4">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span>ऑफर समाप्त होने में समय: {timeFormatted}</span>
        </div>

        {/* Main 1-Click Unlock CTA Button */}
        <div className="space-y-2.5 relative z-10">
          <button
            id="stop-exit-unlock-btn"
            type="button"
            onClick={() => {
              onClose();
              onUnlockItem(featuredItem);
            }}
            className="w-full hot-vip-btn py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 shadow-2xl shadow-rose-600/60 active:scale-95 cursor-pointer border border-white/40 uppercase tracking-wide font-display"
          >
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-bounce" />
            <span>⚡ 1-क्लिक में अभी अनलॉक करें • {formatINR(discountedPrice)}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenWheel();
            }}
            className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-yellow-200 bg-white/10 hover:bg-white/15 border border-yellow-400/40 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Gift className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
            <span>या डेली स्पिन करके फ्री कूपन जीतें 🎁</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-[10px] text-white/60 font-semibold">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 0-सेकंड फास्ट UPI
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-pink-400" /> 100% प्राइवेट & सेफ
          </span>
        </div>
      </div>
    </div>
  );
};
