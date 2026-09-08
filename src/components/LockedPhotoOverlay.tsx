import React from 'react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import {
  Lock,
  Sparkles,
  Layers,
  Film,
  Flame,
  ShieldCheck,
  Zap,
  Eye,
  Crown
} from 'lucide-react';

interface LockedPhotoOverlayProps {
  item: MediaItem;
  onUnlock: () => void;
  variant?: 'card' | 'detail';
}

export const LockedPhotoOverlay: React.FC<LockedPhotoOverlayProps> = ({
  item,
  onUnlock,
  variant = 'card',
}) => {
  const photoCount = item.galleryUrls?.length || item.photoCount || 1;
  const isMultiPhoto = item.type === 'pack' || photoCount > 1;
  const isVideo = item.type === 'video';

  const originalPrice = Math.max(item.price * 3, item.price + 150);
  const liveViewers = 800 + (parseInt(item.id.replace(/\D/g, '') || '42', 10) % 750);

  const getHeaderBadge = () => {
    if (isVideo) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-gradient-to-r from-rose-600/90 to-pink-600/90 text-white border border-rose-400 shadow-md shadow-rose-600/30">
          <Film className="w-3.5 h-3.5 text-yellow-300" />
          <span>🔥 18+ PRIVATE VIP VIDEO</span>
        </span>
      );
    }
    if (isMultiPhoto) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-gradient-to-r from-amber-500/90 to-rose-600/90 text-white border border-amber-300 shadow-md shadow-amber-500/30">
          <Layers className="w-3.5 h-3.5 text-yellow-200" />
          <span>💋 VIP ALBUM • {photoCount} HD PHOTOS</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-gradient-to-r from-pink-600/90 to-purple-600/90 text-white border border-pink-400 shadow-md shadow-pink-600/30">
        <Crown className="w-3.5 h-3.5 text-yellow-300" />
        <span>🔥 18+ UNCENSORED VIP SHOOT</span>
      </span>
    );
  };

  const getSubtitle = () => {
    if (isVideo) {
      return 'एक्सक्लूसिव प्राइवेट वीडियो तुरंत अनलॉक करने के लिए टैप करें';
    }
    if (isMultiPhoto) {
      return `पूरा प्राइवेट एल्बम (${photoCount} फ़ोटो) तुरंत अनलॉक करें`;
    }
    return '100% प्राइवेट व अनसेंसर्ड फ़ोटो तुरंत अनलॉक करें';
  };

  // Card Variant: Clean, elegant frosted glass center capsule that lets the photo shine through!
  if (variant === 'card') {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onUnlock();
        }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/50 via-black/20 to-black/60 backdrop-blur-[1.5px] select-none cursor-pointer transition-all duration-300 group"
      >
        {/* Top Header Tag & Live Viewers */}
        <div className="w-full flex items-center justify-between gap-1.5 pt-0.5">
          <div className="shrink-0 drop-shadow-md">{getHeaderBadge()}</div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold shadow-sm">
            <Flame className="w-3 h-3 text-orange-400 animate-flame" />
            <span>{liveViewers} Live</span>
          </div>
        </div>

        {/* Center Floating Frosted Glass Lock Capsule */}
        <div className="p-3 sm:p-4 rounded-2xl bg-black/65 backdrop-blur-md border border-amber-400/40 shadow-2xl shadow-black/60 flex flex-col items-center text-center max-w-[210px] group-hover:scale-105 transition-transform duration-300 my-auto">
          {/* Glowing Lock Icon */}
          <div className="relative mb-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-amber-400/30 border border-amber-300/60 flex items-center justify-center shadow-lg">
              <Lock className="w-5 h-5 text-amber-300 group-hover:animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-purple-950 font-black text-[9px] shadow-sm">
              🔥
            </span>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 font-display">
            VIP LOCKED
          </span>

          {/* Price Tag Pill */}
          <div className="mt-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/50 border border-amber-400/60">
            <span className="text-[10px] text-pink-300 line-through font-semibold">
              ₹{originalPrice}
            </span>
            <span className="text-xs sm:text-sm font-black text-yellow-300 flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-yellow-300 fill-yellow-400" />
              {formatINR(item.price)}
            </span>
          </div>

          <span className="text-[9px] text-pink-200 mt-1 font-semibold">
            टैप करके तुरंत अनलॉक करें ⚡
          </span>
        </div>

        {/* Bottom Trust Pill */}
        <div className="w-full flex items-center justify-center pb-0.5">
          <div className="text-[10px] text-white/90 font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>🔒 0-Sec Instant UPI Unlock</span>
          </div>
        </div>
      </div>
    );
  }

  // Detail Variant: Full screen media detail overlay
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onUnlock();
      }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/75 via-black/45 to-black/85 backdrop-blur-[2.5px] select-none cursor-pointer transition-all duration-300 group"
    >
      {/* Top Header Tag & Live Viewer Counter */}
      <div className="w-full flex items-center justify-between gap-2 pt-0.5">
        <div className="shrink-0 drop-shadow-md">{getHeaderBadge()}</div>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold shadow-sm">
          <Flame className="w-3 h-3 text-orange-400 animate-flame" />
          <span>{liveViewers} Live</span>
        </div>
      </div>

      {/* Center Icon & Seductive Info */}
      <div className="flex flex-col items-center text-center my-auto py-1">
        {/* Pulsing Seductive Neon Lock Ring */}
        <div className="relative mb-2.5">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-400 opacity-80 blur-md group-hover:animate-pulse" />
          
          <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-black/85 border-2 border-pink-400 backdrop-blur-md flex items-center justify-center shadow-xl shadow-pink-500/50 group-hover:scale-105 transition-transform duration-200">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-pink-300 group-hover:animate-bounce" />
          </div>

          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-purple-950 font-black text-[11px] shadow-lg">
            🔥
          </span>
        </div>

        {/* Title */}
        <h4 className="font-display font-black text-sm sm:text-base text-white line-clamp-1 max-w-[270px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight">
          {item.title}
        </h4>

        <p className="text-[11px] sm:text-xs text-pink-100 mt-0.5 max-w-[250px] font-bold leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {getSubtitle()}
        </p>

        {/* Quality notice badge */}
        <div className="mt-1.5 px-3 py-1 rounded-full bg-rose-950/85 border border-rose-500/70 backdrop-blur-md inline-flex items-center gap-1.5 text-[10px] text-rose-200 font-bold shadow-md">
          <Lock className="w-3 h-3 text-amber-300" />
          <span>🔒 पेमेंट के बाद तुरंत फुल अनब्लर Ultra-HD</span>
        </div>

        {/* Glowing Price Tag with Seductive Strikethrough & 85% OFF */}
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/80 shadow-xl shadow-amber-500/30">
          <span className="text-[11px] text-pink-300 line-through font-semibold">
            ₹{originalPrice}
          </span>
          <span className="text-base sm:text-lg font-black text-yellow-300 font-display flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-400" />
            {formatINR(item.price)}
          </span>
          <span className="text-[9px] font-black uppercase bg-gradient-to-r from-rose-600 to-pink-600 text-white px-1.5 py-0.5 rounded shadow-xs">
            85% OFF
          </span>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="w-full flex flex-col items-center gap-1.5 pb-0.5">
        <div className="w-full max-w-[290px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnlock();
            }}
            className="w-full hot-vip-btn py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-1.5 shadow-2xl shadow-rose-600/60 active:scale-95 transition-all cursor-pointer border border-white/50"
          >
            <Lock className="w-4 h-4 text-yellow-200 shrink-0" />
            <span className="truncate tracking-wide uppercase font-display font-black">
              ⚡ अनलॉक करें • {formatINR(item.price)}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-white font-bold bg-black/60 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10 shadow-sm">
          <span className="flex items-center gap-0.5 text-amber-300">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> तुरंत 0-सेकंड UPI अनलॉक
          </span>
          <span>•</span>
          <span className="flex items-center gap-0.5 text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% गोपनीय
          </span>
        </div>
      </div>
    </div>
  );
};

