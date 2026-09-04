import React, { useState } from 'react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import { getOptimizedImageUrl, getResponsiveSrcSet } from '../utils/imageOptimizer';
import { LockedPhotoOverlay } from './LockedPhotoOverlay';
import {
  Lock,
  Play,
  Eye,
  Heart,
  Sparkles,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Layers,
  Share2,
  Instagram,
  Check
} from 'lucide-react';

interface ContentCardProps {
  item: MediaItem;
  isUnlocked: boolean;
  onOpen: (item: MediaItem) => void;
  onBuy: (item: MediaItem) => void;
  onPeek?: (item: MediaItem) => void;
  onOpenShare?: (item: MediaItem) => void;
  priority?: boolean;
}

const ContentCardComponent: React.FC<ContentCardProps> = ({
  item,
  isUnlocked,
  onOpen,
  onBuy,
  onPeek,
  onOpenShare,
  priority = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isFree = item.access === 'free';
  const canAccess = isFree || isUnlocked;

  const postUrl = `${window.location.origin}${window.location.pathname}#media/${item.id}`;
  const shareText = `🔥 Check out "${item.title}" VIP Content:`;

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenShare) {
      onOpenShare(item);
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: shareText,
        url: postUrl,
      }).catch(() => {});
      return;
    }

    try {
      navigator.clipboard.writeText(`${shareText}\n${postUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      prompt('Copy post link:', postUrl);
    }
  };

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
    const count = item.galleryUrls?.length || item.photoCount;
    switch (item.type) {
      case 'video':
        return item.duration ? `Video • ${item.duration}` : 'VIP Video';
      case 'pack':
        return count && count > 1 ? `VIP Pack • ${count} Photos` : 'VIP Pack';
      default:
        return count && count > 1 ? `Album • ${count} Photos` : 'HD Photo';
    }
  };

  return (
    <div
      id={`content-card-${item.id}`}
      className="glass-card glass-card-hover rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col group relative border border-white/80 transition-all duration-300 select-none protected-media-container [content-visibility:auto] [contain-intrinsic-size:360px]"
    >
      {/* Media Wrapper (Natural Aspect Ratio - 100% Zero Cropping across 9:16, 4:5, 1:1, 16:9, 4:3) */}
      <div 
        onContextMenu={(e) => e.preventDefault()}
        className="relative w-full overflow-hidden bg-purple-950/15 select-none flex items-center justify-center min-h-[220px]"
      >
        {/* Ambient Gradient Fill behind photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-pink-950/15 to-purple-950/40 pointer-events-none" />

        {/* Media Thumbnail Foreground (Natural Ratio, Height Auto, Width 100%, Never Cropped, Never Distorted) */}
        <img
          src={canAccess ? getOptimizedImageUrl(item.thumbnailUrl, 540, 75, false) : getOptimizedImageUrl(item.thumbnailUrl, 400, 60, true)}
          srcSet={getResponsiveSrcSet(item.thumbnailUrl, !canAccess) || undefined}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={item.title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          className={`relative z-[1] block w-full h-auto max-h-[85vh] object-contain transition-all duration-300 pointer-events-none ${
            !canAccess
              ? 'filter blur-[26px] brightness-[0.85] contrast-[1.15] saturate-[1.25] scale-110 opacity-90'
              : 'opacity-100 filter-none scale-100 group-hover:scale-105'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Ambient Gradient Overlay for Unlocked items */}
        {canAccess && (
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-purple-950/60 via-transparent to-black/20 pointer-events-none" />
        )}

        {/* Top Badges (Only displayed when item is unlocked, locked items show premium overlay header) */}
        {canAccess && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Type Badge */}
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/85 backdrop-blur-md text-purple-950 border border-white/80 flex items-center gap-1.5 shadow-sm">
              {getTypeIcon()}
              <span>{getTypeText()}</span>
            </span>

            {/* Access Badge */}
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-white" />
              {isFree ? 'FREE' : 'UNLOCKED'}
            </span>
          </div>
        )}

        {/* Premium Animated Lock Overlay */}
        {!canAccess ? (
          <LockedPhotoOverlay
            item={item}
            onUnlock={() => onBuy(item)}
            onPeek={onPeek ? () => onPeek(item) : undefined}
            variant="card"
          />
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

        {/* Bottom stats inside thumbnail (Visible on unlocked items) */}
        {canAccess && (
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white font-medium z-10">
            <span className="flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
              <Eye className="w-3 h-3 text-pink-300" /> {item.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
              <Heart className="w-3 h-3 text-pink-300" /> {item.likes.toLocaleString()}
            </span>
          </div>
        )}
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

        {/* Action Button & Share (Disabled/Hidden once unlocked) */}
        <div className="mt-4 pt-3 border-t border-purple-100/80 flex items-center gap-2">
          {canAccess ? (
            <button
              id={`btn-view-${item.id}`}
              onClick={() => onOpen(item)}
              className="flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-extrabold text-purple-950 bg-white hover:bg-pink-50 border border-purple-200 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {item.type === 'video' ? <Play className="w-4 h-4 fill-pink-600 text-pink-600" /> : <Eye className="w-4 h-4 text-pink-600" />}
              <span className="truncate">{item.type === 'video' ? 'Watch Video' : 'View Photos'}</span>
            </button>
          ) : (
            <button
              id={`btn-unlock-${item.id}`}
              onClick={() => onBuy(item)}
              className="flex-1 hot-vip-btn py-2.5 sm:py-3 px-3 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer uppercase tracking-wider font-display"
            >
              <Lock className="w-3.5 h-3.5 text-yellow-300" />
              <span className="truncate">⚡ अनलॉक • {formatINR(item.price)}</span>
            </button>
          )}

          {/* Quick Share Button - Only visible for locked content (buying referral) and hidden for unlocked/purchased media */}
          {!isUnlocked && (
            <button
              type="button"
              onClick={handleShareClick}
              className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-pink-500 hover:brightness-110 text-white shadow-sm transition-transform active:scale-90 cursor-pointer shrink-0"
              title="पोस्ट शेयर करें (WhatsApp, Instagram, Link)"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4 text-white" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ContentCard = React.memo(ContentCardComponent);
