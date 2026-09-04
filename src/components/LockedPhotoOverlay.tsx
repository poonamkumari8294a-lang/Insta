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
  onPeek?: () => void;
  variant?: 'card' | 'detail';
}

export const LockedPhotoOverlay: React.FC<LockedPhotoOverlayProps> = ({
  item,
  onUnlock,
  onPeek,
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

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onUnlock();
      }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-between p-3.5 sm:p-5 bg-gradient-to-b from-black/55 via-black/15 to-black/75 backdrop-blur-[1.5px] select-none cursor-pointer transition-all duration-300 hover:backdrop-blur-none group"
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
          {/* Ambient intense hot glow */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-400 opacity-80 blur-md group-hover:animate-pulse" />
          
          <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-black/85 border-2 border-pink-400 backdrop-blur-md flex items-center justify-center shadow-xl shadow-pink-500/50 group-hover:scale-105 transition-transform duration-200">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-pink-300 group-hover:animate-bounce" />
          </div>

          {/* Sparkle badge */}
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
        <div className="w-full max-w-[290px] flex items-center gap-1.5">
          {onPeek && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPeek();
              }}
              className="py-2.5 px-3 rounded-2xl text-[11px] font-black text-white bg-black/70 hover:bg-black/90 border border-pink-400/70 backdrop-blur-md flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95 shadow-lg"
              title="1 सेकंड की झलक देखें"
            >
              <Eye className="w-3.5 h-3.5 text-yellow-300" />
              <span>झलक देखें</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnlock();
            }}
            className={`flex-1 hot-vip-btn py-3 sm:py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-1.5 shadow-2xl shadow-rose-600/60 active:scale-95 transition-all cursor-pointer border border-white/50 ${
              variant === 'detail' ? 'sm:py-4 sm:text-base' : ''
            }`}
          >
            <Lock className="w-4 h-4 text-yellow-200 shrink-0" />
            <span className="truncate tracking-wide uppercase font-display font-black">
              ⚡ अनलॉक • {formatINR(item.price)}
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

