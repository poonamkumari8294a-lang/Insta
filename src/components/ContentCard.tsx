import React from 'react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import { Lock, Play, Eye, Heart, Sparkles, CheckCircle2, Film, Image as ImageIcon, Layers } from 'lucide-react';

interface ContentCardProps {
  item: MediaItem;
  isUnlocked: boolean;
  onOpen: (item: MediaItem) => void;
  onBuy: (item: MediaItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  isUnlocked,
  onOpen,
  onBuy,
}) => {
  const isFree = item.access === 'free';
  const canAccess = isFree || isUnlocked;

  const getTypeIcon = () => {
    switch (item.type) {
      case 'video':
        return <Film className="w-3.5 h-3.5" />;
      case 'pack':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <ImageIcon className="w-3.5 h-3.5" />;
    }
  };

  const getTypeText = () => {
    switch (item.type) {
      case 'video':
        return item.duration ? `Video • ${item.duration}` : 'VIP Video';
      case 'pack':
        return item.photoCount ? `VIP Pack • ${item.photoCount} HD Photos` : 'VIP Pack';
      default:
        return 'HD Photo Set';
    }
  };

  return (
    <div
      id={`content-card-${item.id}`}
      className="glass-card glass-card-hover rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col group relative border border-white/80 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-purple-100/50 select-none">
        
        {/* Media Thumbnail */}
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !canAccess ? 'filter blur-[10px] scale-105 opacity-80' : 'opacity-95'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          
          {/* Type Badge */}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/85 backdrop-blur-md text-purple-950 border border-white/80 flex items-center gap-1.5 shadow-sm">
            {getTypeIcon()}
            <span>{getTypeText()}</span>
          </span>

          {/* Access / Price Badge */}
          {canAccess ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-white" />
              {isFree ? 'FREE' : 'UNLOCKED'}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              {formatINR(item.price)}
            </span>
          )}
        </div>

        {/* Center Action / Lock Icon */}
        {!canAccess ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
            <div 
              onClick={() => onBuy(item)}
              className="cursor-pointer flex flex-col items-center group-hover:scale-105 transition-all duration-300"
            >
              {/* Pulsing Lock Ring Aura */}
              <div className="relative mb-2.5">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 opacity-75 blur-md animate-pulse group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 border-2 border-pink-400 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-pink-600/40 group-hover:rotate-6 transition-transform">
                  <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-pink-600 animate-bounce" />
                </div>
                {/* Sparkle Badge */}
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-[10px] shadow-sm animate-spin" style={{ animationDuration: '6s' }}>
                  ✦
                </span>
              </div>

              {/* Glowing CTA Pill */}
              <span className="text-xs font-black text-white tracking-wide bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:200%_auto] hover:bg-right px-4 py-1.5 rounded-full border border-white/40 shadow-xl shadow-pink-500/30 flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>Unlock VIP ({formatINR(item.price)})</span>
              </span>
            </div>
          </div>
        ) : (
          item.type === 'video' && (
            <div 
              onClick={() => onOpen(item)}
              className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md text-pink-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>
          )
        )}

        {/* Bottom stats inside thumbnail */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white font-medium z-10">
          <span className="flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
            <Eye className="w-3 h-3 text-pink-300" /> {item.views.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
            <Heart className="w-3 h-3 text-pink-300" /> {item.likes.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white/40">
        <div>
          <h3 className="font-display font-bold text-sm sm:text-base text-purple-950 line-clamp-1 group-hover:text-pink-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-purple-900/70 mt-1 line-clamp-2 leading-relaxed font-medium">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold text-pink-700 bg-pink-100/70 px-2 py-0.5 rounded-full border border-pink-200/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-purple-100/80">
          {canAccess ? (
            <button
              id={`btn-view-${item.id}`}
              onClick={() => onOpen(item)}
              className="w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold text-purple-950 bg-white hover:bg-pink-50 border border-purple-200 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {item.type === 'video' ? <Play className="w-4 h-4 fill-pink-600 text-pink-600" /> : <Eye className="w-4 h-4 text-pink-600" />}
              <span>{item.type === 'video' ? 'Watch Full Video' : 'View Full Photo Set'}</span>
            </button>
          ) : (
            <button
              id={`btn-unlock-${item.id}`}
              onClick={() => onBuy(item)}
              className="w-full glow-pink-btn py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 shadow-md shadow-pink-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Now • {formatINR(item.price)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
