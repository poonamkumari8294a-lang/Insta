import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Flame, ShieldCheck, Phone, User, Edit3, Check, Gift } from 'lucide-react';
import { getStoredUserProfile, saveStoredUserProfile } from '../utils/api';

interface VipMemberPassCardProps {
  onOpenWheel?: () => void;
  onEditProfile?: () => void;
}

export const VipMemberPassCard: React.FC<VipMemberPassCardProps> = ({
  onOpenWheel,
  onEditProfile,
}) => {
  const [profile, setProfile] = useState<{ name: string; phone: string; streakDays?: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    const saved = getStoredUserProfile();
    if (saved?.name || saved?.phone) {
      setProfile(saved);
      setEditName(saved.name || '');
      setEditPhone(saved.phone || '');
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPhone || editPhone.length < 10) return;
    const updated = {
      name: editName.trim() || 'VIP Member',
      phone: editPhone.trim().replace(/[^0-9]/g, ''),
      streakDays: profile?.streakDays || 1
    };
    saveStoredUserProfile(updated);
    setProfile(updated);
    setIsEditing(false);
  };

  const maskPhone = (ph: string) => {
    if (!ph || ph.length < 10) return ph;
    return `${ph.slice(0, 3)}****${ph.slice(-3)}`;
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-tr from-zinc-950 via-purple-950 to-zinc-900 border-2 border-yellow-400/40 p-5 sm:p-6 shadow-2xl text-white">
      {/* Background Foil Shine */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Ribbon */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-purple-950 shadow-md">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black font-display text-base sm:text-lg text-white tracking-wide">
                EXCLUSIVE VIP MEMBER PASS
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-black uppercase border border-yellow-400/40">
                Gold Tier
              </span>
            </div>
            <p className="text-[11px] text-pink-200/70">
              प्राइवेट व अनसेंसर्ड कंटेंट एक्सेस पास
            </p>
          </div>
        </div>

        {profile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-pink-200 hover:text-white transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="py-4">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10">
            <h5 className="text-xs font-black text-yellow-300 uppercase">
              अपना VIP विवरण अपडेट करें
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-pink-200/80 font-bold block mb-1">आपका नाम</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="अपना नाम दर्ज करें"
                  className="w-full bg-zinc-900 border border-purple-400/40 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-pink-200/80 font-bold block mb-1">व्हाट्सएप मोबाइल नंबर</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="10 अंकों का नंबर"
                  className="w-full bg-zinc-900 border border-purple-400/40 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white font-bold"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 text-xs font-black shadow"
              >
                सेव करें ✓
              </button>
            </div>
          </form>
        ) : profile?.phone ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-black text-white">{profile.name || 'VIP Member'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-pink-200/80 font-mono">
                <Phone className="w-3.5 h-3.5 text-yellow-400" />
                <span>+91 {maskPhone(profile.phone)}</span>
                <span className="text-emerald-400 font-sans font-bold text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  सत्यापित ✓
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-black/50 px-3.5 py-2 rounded-2xl border border-yellow-400/30 text-center">
                <div className="flex items-center gap-1 text-yellow-300 text-xs font-black">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>{profile.streakDays || 1} Day Streak</span>
                </div>
                <span className="text-[10px] text-pink-200/60">लगातार विज़िट</span>
              </div>

              {onOpenWheel && (
                <button
                  onClick={onOpenWheel}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95 transition-transform"
                >
                  <Gift className="w-4 h-4 text-yellow-300" />
                  <span>Free Spin</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/10">
            <div className="space-y-0.5">
              <h5 className="text-xs sm:text-sm font-black text-yellow-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> अपना VIP मेंबर पास एक्टिवेट करें!
              </h5>
              <p className="text-[11px] text-pink-200/70">
                नाम व मोबाइल नंबर दर्ज करने पर अनलॉक कंटेंट सीधे आपके नाम से सुरक्षित रहता है।
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-purple-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform whitespace-nowrap cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>पास बनाएं (Create Pass)</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Tags */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-[10px] text-pink-200/60 font-semibold">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          100% प्राइवेट व एन्क्रिप्टेड
        </span>
        <span className="font-mono text-yellow-400/80">
          CARD ID: VIP-{(profile?.phone ? profile.phone.slice(-4) : '8899')}
        </span>
      </div>
    </div>
  );
};
