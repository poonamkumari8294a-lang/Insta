import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Gift,
  Flame,
  Zap,
  CheckCircle2,
  Crown,
  Share2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { getStoredUserProfile, saveStoredUserProfile } from '../utils/api';

interface DailyRewardWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimCoupon?: (couponCode: string, discountText: string) => void;
}

const REWARDS = [
  { label: '80% OFF', desc: 'VIP All-Access Coupon', code: 'VIP80HOT', color: 'from-rose-500 to-pink-600', icon: '🔥' },
  { label: '₹30 FLAT OFF', desc: 'Instant Discount', code: 'FLAT30RUMA', color: 'from-amber-500 to-yellow-600', icon: '💰' },
  { label: 'FREE VIP PASS', desc: '1-Day Gold VIP Access', code: 'GOLDVIP1D', color: 'from-purple-600 to-indigo-600', icon: '👑' },
  { label: '50% OFF', desc: 'Photo Packs Coupon', code: 'HOT50PACK', color: 'from-pink-500 to-rose-600', icon: '💋' },
  { label: '₹50 CASHBACK', desc: 'Instant UPI Cashback', code: 'CASH50UPI', color: 'from-emerald-500 to-teal-600', icon: '⚡' },
  { label: 'SECRET TEASER', desc: 'Uncensored 4K Teaser', code: 'SECRETHD4K', color: 'from-violet-600 to-purple-800', icon: '⭐' },
];

export const DailyRewardWheelModal: React.FC<DailyRewardWheelModalProps> = ({
  isOpen,
  onClose,
  onClaimCoupon,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<typeof REWARDS[0] | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState('');

  useEffect(() => {
    const profile = getStoredUserProfile();
    if (profile?.lastSpinDate) {
      const lastSpin = new Date(profile.lastSpinDate).getTime();
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (now - lastSpin < twentyFourHours) {
        setHasSpunToday(true);
        const diff = twentyFourHours - (now - lastSpin);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilNextSpin(`${hours}h ${mins}m`);
      } else {
        setHasSpunToday(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setWonReward(null);

    // Pick a high-value reward
    const targetIndex = Math.floor(Math.random() * REWARDS.length);
    const segmentAngle = 360 / REWARDS.length;
    const totalSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
    const targetRotation = totalSpins * 360 + (REWARDS.length - targetIndex) * segmentAngle - segmentAngle / 2;

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const selected = REWARDS[targetIndex];
      setWonReward(selected);
      setHasSpunToday(true);

      const profile = getStoredUserProfile() || { name: '', phone: '' };
      const currentStreak = (profile.streakDays || 0) + 1;
      saveStoredUserProfile({
        ...profile,
        lastSpinDate: new Date().toISOString(),
        streakDays: currentStreak
      });

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#ec4899', '#f43f5e', '#fbbf24', '#a855f7']
      });
    }, 4500);
  };

  const handleCopyCoupon = () => {
    if (!wonReward) return;
    navigator.clipboard.writeText(wonReward.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    if (onClaimCoupon) {
      onClaimCoupon(wonReward.code, wonReward.label);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-purple-950 via-zinc-950 to-purple-950 text-white rounded-3xl border-2 border-pink-500/80 shadow-2xl p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[11px] font-black uppercase shadow-lg shadow-rose-600/30">
            <Flame className="w-3.5 h-3.5 text-yellow-300 animate-flame" />
            <span>दैनिक फ्री VIP लकी स्पिन (Daily Free Spin)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display text-white mt-2">
            🎁 रोज़ाना घुमाएं & मुफ्त रिवॉर्ड जीतें!
          </h3>
          <p className="text-xs text-pink-200/80 font-medium">
            हर 24 घंटे में 1 फ्री स्पिन • स्पेशल VIP डिस्काउंट व सीक्रेट कूपन
          </p>
        </div>

        {/* The Wheel Container */}
        <div className="relative my-6 flex flex-col items-center justify-center">
          
          {/* Wheel Pointer Pin */}
          <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-yellow-400 filter drop-shadow-[0_2px_8px_rgba(250,204,21,0.8)]" />
          </div>

          {/* Seductive Glowing Outer Ring */}
          <div className="relative p-2.5 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 shadow-[0_0_35px_rgba(244,63,94,0.6)]">
            
            {/* Spinning Wheel */}
            <div
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-yellow-300 relative overflow-hidden bg-zinc-900 shadow-inner transition-all duration-[4500ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {REWARDS.map((reward, idx) => {
                const angle = (360 / REWARDS.length) * idx;
                return (
                  <div
                    key={idx}
                    className="absolute w-full h-full flex items-start justify-center pt-3"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: '50% 50%'
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="text-lg">{reward.icon}</span>
                      <span className="text-[11px] font-black text-white uppercase tracking-tighter drop-shadow-md">
                        {reward.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Center Hub */}
              <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 border-4 border-white shadow-xl flex items-center justify-center z-20">
                <Crown className="w-7 h-7 text-purple-950" />
              </div>
            </div>
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-6 w-full">
            {wonReward ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/80 to-purple-950/80 border-2 border-yellow-400/80 text-center space-y-2 animate-in zoom-in-95">
                <span className="text-xs text-yellow-300 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> बधाई हो! आपको मिला:
                </span>
                <h4 className="text-xl font-black text-white font-display">
                  {wonReward.icon} {wonReward.label} ({wonReward.desc})
                </h4>
                <div className="p-2.5 rounded-xl bg-black/60 border border-yellow-400/40 flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-sm text-yellow-300 tracking-wider">
                    {wonReward.code}
                  </span>
                  <button
                    onClick={handleCopyCoupon}
                    className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs cursor-pointer shadow"
                  >
                    {copiedCode ? 'कॉपी हुआ ✓' : 'Copy Coupon'}
                  </button>
                </div>
                <p className="text-[11px] text-pink-200/80">
                  यह कूपन पेमेंट करते समय तुरंत लागू हो जाएगा!
                </p>
              </div>
            ) : hasSpunToday ? (
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>आज का फ्री स्पिन पूरा हो चुका है!</span>
                </div>
                <p className="text-xs text-white/70">
                  अगला फ्री स्पिन उपलब्ध होगा: <strong className="text-yellow-300">{timeUntilNextSpin}</strong> में।
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full hot-vip-btn py-4 px-6 rounded-2xl text-sm font-black text-white uppercase tracking-wider font-display flex items-center justify-center gap-2 shadow-2xl shadow-rose-600/50 active:scale-95 transition-all cursor-pointer border border-white/30"
              >
                {isSpinning ? (
                  <span>व्हील घूम रहा है... 🎡</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>🔥 अभी फ्री स्पिन करें (Spin Now)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center border-t border-white/10">
          <p className="text-[10px] text-pink-200/60 font-semibold">
            ⚡ रोज़ाना साइट पर आने पर आपको अतिरिक्त VIP रिवॉर्ड्स और एक्सक्लूसिव डिस्काउंट्स मिलते हैं।
          </p>
        </div>

      </div>
    </div>
  );
};
