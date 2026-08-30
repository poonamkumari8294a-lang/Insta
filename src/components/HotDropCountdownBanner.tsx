import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Clock, Crown, ArrowRight, Zap, Bell, Check } from 'lucide-react';
import { requestNotificationSubscription } from '../services/notificationService';

interface HotDropCountdownBannerProps {
  onOpenWheel?: () => void;
  onExploreVip?: () => void;
}

export const HotDropCountdownBanner: React.FC<HotDropCountdownBannerProps> = ({
  onOpenWheel,
  onExploreVip
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // Calculate time until next midnight or 4-hour drop
    const calculateTime = () => {
      const now = new Date();
      const nextDrop = new Date();
      // Drop every 6 hours
      const curHour = now.getHours();
      const nextHour = Math.ceil((curHour + 1) / 6) * 6;
      nextDrop.setHours(nextHour % 24, 0, 0, 0);
      if (nextHour >= 24) {
        nextDrop.setDate(nextDrop.getDate() + 1);
      }

      const diff = Math.max(0, nextDrop.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNotifyMe = async () => {
    setSubscribing(true);
    try {
      const res = await requestNotificationSubscription();
      if (res.success || res.token) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(true);
      }
    } catch {
      setIsSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950 via-zinc-950 to-purple-950 border-2 border-pink-500/40 p-4 sm:p-6 shadow-2xl">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
        
        {/* Left: Teaser info */}
        <div className="text-center lg:text-left space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[11px] font-black uppercase shadow-lg shadow-rose-600/30">
            <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>🔥 अगला एक्सक्लूसिव 4K हॉट ड्रॉप (Upcoming Midnight Drop)</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white tracking-tight">
            Uncut VIP Photo & Reel Collection 💋
          </h3>
          
          <p className="text-xs sm:text-sm text-pink-200/80 font-medium">
            नया प्राइवेट हॉट सेट अपलोड हो रहा है। सबसे पहले अनलॉक करने के लिए बने रहें!
          </p>
        </div>

        {/* Center: Live Timer Box */}
        <div className="flex items-center gap-2 sm:gap-3 bg-black/60 p-3 sm:p-4 rounded-2xl border border-pink-500/50 shadow-inner">
          
          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-pink-500/40 flex items-center justify-center shadow-lg">
              <span className="font-mono font-black text-xl sm:text-2xl text-yellow-300">
                {pad(timeLeft.hours)}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-pink-200/70 mt-1">Hours</span>
          </div>

          <span className="font-mono font-black text-xl text-pink-400 -mt-3">:</span>

          {/* Mins */}
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-pink-500/40 flex items-center justify-center shadow-lg">
              <span className="font-mono font-black text-xl sm:text-2xl text-yellow-300">
                {pad(timeLeft.minutes)}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-pink-200/70 mt-1">Mins</span>
          </div>

          <span className="font-mono font-black text-xl text-pink-400 -mt-3">:</span>

          {/* Secs */}
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-pink-500/40 flex items-center justify-center shadow-lg">
              <span className="font-mono font-black text-xl sm:text-2xl text-rose-400">
                {pad(timeLeft.seconds)}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-pink-200/70 mt-1">Secs</span>
          </div>

        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
          {onOpenWheel && (
            <button
              onClick={onOpenWheel}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-purple-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>🎁 Daily Free Spin</span>
            </button>
          )}

          <button
            onClick={handleNotifyMe}
            disabled={subscribing || isSubscribed}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              isSubscribed
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-600/30 active:scale-95'
            }`}
          >
            {isSubscribed ? (
              <>
                <Check className="w-4 h-4" />
                <span>ड्रॉप अलर्ट चालू ✓</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 animate-bounce" />
                <span>हॉट ड्रॉप अलर्ट पाएं</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
