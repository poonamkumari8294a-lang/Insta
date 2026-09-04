import React, { useState, useEffect } from 'react';
import { Flame, Lock, Zap, X, Eye, ShieldCheck, CheckCircle2, Film } from 'lucide-react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';

interface TeaserPeekModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (item: MediaItem) => void;
}

export const TeaserPeekModal: React.FC<TeaserPeekModalProps> = ({
  item,
  isOpen,
  onClose,
  onUnlock
}) => {
  const [peekCountdown, setPeekCountdown] = useState(3);
  const [isLockedPhase, setIsLockedPhase] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) {
      setPeekCountdown(3);
      setIsLockedPhase(false);
      return;
    }

    setPeekCountdown(3);
    setIsLockedPhase(false);

    const timer = setInterval(() => {
      setPeekCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLockedPhase(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl border-2 border-rose-500 shadow-2xl p-4 sm:p-6 text-white overflow-hidden fire-border-glow flex flex-col items-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-1.5 mb-3 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-yellow-200 animate-flame" />
            <span>🔥 1-Sec VIP Sneak Peek Preview</span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-white truncate px-6">
            {item.title}
          </h3>
        </div>

        {/* Media Preview Box with Dramatic Lock Transition */}
        <div className="relative w-full max-h-[50vh] sm:max-h-[55vh] aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/20">
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isLockedPhase
                ? 'filter blur-[28px] scale-110 opacity-70'
                : 'filter blur-[10px] scale-105 opacity-85'
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Countdown before Lock */}
          {!isLockedPhase ? (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-rose-600/90 text-white font-mono font-black text-xs flex items-center gap-1 shadow-lg animate-pulse">
              <Eye className="w-3.5 h-3.5 text-yellow-300" />
              <span>झलक समाप्त: 00:0{peekCountdown}s</span>
            </div>
          ) : (
            /* Dramatic Hot VIP Lock Overlay */
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3 animate-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 p-0.5 shadow-2xl shadow-rose-600/70 flex items-center justify-center animate-bounce">
                  <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-pink-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1 max-w-xs">
                <h4 className="text-base sm:text-lg font-black text-white font-display">
                  🔞 आगे का सबसे हॉट सीन लॉक्ड है!
                </h4>
                <p className="text-xs text-pink-200/90 font-medium leading-relaxed">
                  पूरा 4K अनसेंसर्ड वीडियो और प्राइवेट फोटो सेट अभी तुरंत 1-क्लिक में अनलॉक करें।
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-pink-500/30 border border-amber-400/60 text-yellow-300 font-mono font-black text-sm">
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                <span>सिर्फ {formatINR(item.price)} में लाइफटाइम एक्सेस</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Action Button */}
        <div className="w-full mt-4 space-y-2">
          <button
            id="peek-unlock-now-btn"
            type="button"
            onClick={() => {
              onClose();
              onUnlock(item);
            }}
            className="w-full hot-vip-btn py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 shadow-2xl shadow-rose-600/70 active:scale-95 cursor-pointer border border-white/40 uppercase tracking-wider font-display"
          >
            <Lock className="w-4 h-4 text-yellow-300" />
            <span>⚡ पूरा वीडियो अनलॉक करें • {formatINR(item.price)}</span>
          </button>

          <p className="text-[10px] text-center text-white/60 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 0-Sec Instant QR & UPI Payment
            <span>•</span>
            <ShieldCheck className="w-3 h-3 text-pink-400" /> 100% गोपनीय
          </p>
        </div>
      </div>
    </div>
  );
};
