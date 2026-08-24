import React from 'react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import {
  Lock,
  Sparkles,
  Layers,
  Film,
  Image as ImageIcon,
  ShieldCheck,
  Zap
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

  const getHeaderBadge = () => {
    if (isVideo) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm">
          <Film className="w-3.5 h-3.5 text-pink-400" />
          <span>LOCKED VIP VIDEO</span>
        </span>
      );
    }
    if (isMultiPhoto) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>LOCKED VIP ALBUM • {photoCount} PHOTOS</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span>LOCKED PREMIUM PHOTO</span>
      </span>
    );
  };

  const getSubtitle = () => {
    if (isVideo) {
      return 'यह exclusive video unlock करने के लिए खरीदें';
    }
    if (isMultiPhoto) {
      return `पूरा album (${photoCount} HD Photos) unlock करने के लिए खरीदें`;
    }
    return 'यह photo unlock करने के लिए खरीदें';
  };

  const getCtaText = () => {
    if (isVideo) {
      return `Unlock Video • ${formatINR(item.price)}`;
    }
    if (isMultiPhoto) {
      return `Unlock ${photoCount} Photos • ${formatINR(item.price)}`;
    }
    return `Unlock Now • ${formatINR(item.price)}`;
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onUnlock();
      }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/85 via-black/75 to-black/92 backdrop-blur-md animate-overlay-ambient select-none cursor-pointer transition-colors hover:bg-black/80"
    >
      {/* Top Header Tag */}
      <div className="w-full flex items-center justify-center pt-1">
        {getHeaderBadge()}
      </div>

      {/* Center Icon & Info with Subtle Pulse Animation */}
      <div className="flex flex-col items-center text-center my-auto py-2">
        {/* Pulsing Lock Icon Ring */}
        <div className="relative mb-3.5 animate-lock-pulse">
          {/* Ambient glow */}
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-400 opacity-60 blur-md" />
          
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-950/90 border-2 border-pink-500/80 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-pink-500/40">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-pink-400" />
          </div>

          {/* Sparkle badge */}
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-[11px] shadow-md animate-bounce" style={{ animationDuration: '3s' }}>
            ✦
          </span>
        </div>

        {/* Title / Description */}
        <h4 className="font-display font-black text-sm sm:text-base text-white line-clamp-1 max-w-[260px] drop-shadow-md">
          {item.title}
        </h4>

        <p className="text-xs text-purple-200/90 mt-1 max-w-[240px] font-medium leading-tight">
          {getSubtitle()}
        </p>

        {/* Glowing Price Tag */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-sm font-black animate-badge-glow">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{formatINR(item.price)}</span>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="w-full flex flex-col items-center gap-1.5 pb-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnlock();
          }}
          className={`w-full max-w-[280px] glow-pink-btn animate-btn-breathe py-3 px-4 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-pink-600/35 active:scale-95 transition-transform cursor-pointer border border-pink-300/40 ${
            variant === 'detail' ? 'sm:py-3.5 sm:text-base' : ''
          }`}
        >
          <Lock className="w-4 h-4 text-pink-200" />
          <span className="truncate tracking-wide">{getCtaText()}</span>
        </button>

        <span className="text-[10px] text-purple-200/60 font-semibold flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          Instant UPI Unlock • One-time payment
        </span>
      </div>
    </div>
  );
};
