import React, { useState } from 'react';
import { MediaItem } from '../types';
import { formatINR, getCachedSiteSettingsSync } from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { LockedPhotoOverlay } from './LockedPhotoOverlay';
import {
  Lock,
  Play,
  Eye,
  Heart,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Layers,
  Share2,
  Check
} from 'lucide-react';

interface ContentCardProps {
  item: MediaItem;
  isUnlocked: boolean;
  onOpen: (item: MediaItem) => void;
  onBuy: (item: MediaItem) => void;
  onOpenShare?: (item: MediaItem) => void;
  priority?: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';
const FALLBACK_AVATAR = 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788385961/website-media/izxcajoa6ne2frpzc4k3.jpg';

const ContentCardComponent: React.FC<ContentCardProps> = ({
  item,
  isUnlocked,
  onOpen,
  onBuy,
  onOpenShare,
  priority = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [liked, setLiked] = useState(() => {
    try {
      return localStorage.getItem(`post_liked_${item.id}`) === 'true';
    } catch {
      return false;
    }
  });
  const [likeCount, setLikeCount] = useState(() => item.likes + (liked ? 1 : 0));

  const isFree = item.access === 'free';
  const canAccess = isFree || isUnlocked;

  const settings = getCachedSiteSettingsSync();
  const creatorName = settings?.creatorName || 'Ruma Kumari';
  const creatorAvatar = settings?.profilePicUrl || FALLBACK_AVATAR;
  const creatorHandle = settings?.instagramHandle || '@ruma__cutegirl';

  const postUrl = `${window.location.origin}${window.location.pathname}#media/${item.id}`;
  const shareText = `🔥 Check out "${item.title}" by ${creatorName}:`;

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      if (newLiked) {
        localStorage.setItem(`post_liked_${item.id}`, 'true');
      } else {
        localStorage.removeItem(`post_liked_${item.id}`);
      }
    } catch {}
  };

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
        return item.duration ? `4K Reel • ${item.duration}` : 'VIP Video';
      case 'pack':
        return count && count > 1 ? `Photoset • ${count} HD Photos` : 'VIP Album';
      default:
        return count && count > 1 ? `Album • ${count} HD Photos` : 'HD Photo';
    }
  };

  // Image source with intelligent fallback
  const rawImageUrl = item.thumbnailUrl || item.mediaUrl || FALLBACK_IMAGE;
  const imageSource = imgFailed
    ? (item.mediaUrl && item.mediaUrl !== item.thumbnailUrl ? item.mediaUrl : FALLBACK_IMAGE)
    : (canAccess
        ? getOptimizedImageUrl(rawImageUrl, 640, 80, false)
        : getOptimizedImageUrl(rawImageUrl, 480, 70, true));

  return (
    <article
      id={`content-card-${item.id}`}
      className="bg-white/90 backdrop-blur-xl border border-pink-100/90 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 overflow-hidden flex flex-col group select-none relative [content-visibility:auto] [contain-intrinsic-size:420px]"
    >
      {/* 1. CREATOR HEADER (Feed Post Identity) */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-pink-50/80 bg-white/70">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Seductive Story Ring Avatar */}
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shrink-0 shadow-xs">
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="font-display font-extrabold text-xs sm:text-sm text-purple-950 truncate tracking-tight">
                {creatorName}
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500 text-white shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-900/60 font-medium">
              <span className="truncate">{creatorHandle}</span>
              <span>•</span>
              <span className="text-pink-600 font-bold">VIP Drop</span>
            </div>
          </div>
        </div>

        {/* Media Type Badge */}
        <div className="shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 border border-pink-200/80 flex items-center gap-1 shadow-2xs">
            {getTypeIcon()}
            <span>{getTypeText()}</span>
          </span>
        </div>
      </div>

      {/* 2. MEDIA CANVAS (The Visual Hero) */}
      <div
        onClick={() => (canAccess ? onOpen(item) : onBuy(item))}
        onContextMenu={(e) => e.preventDefault()}
        className="relative w-full aspect-[4/5] bg-gradient-to-br from-purple-950/20 via-pink-950/15 to-purple-900/25 overflow-hidden cursor-pointer flex items-center justify-center select-none"
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-black/30 pointer-events-none" />

        {/* Foreground Image */}
        <img
          src={imageSource}
          alt={item.title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setImgFailed(true)}
          className={`w-full h-full object-cover transition-all duration-500 pointer-events-none ${
            !canAccess
              ? 'filter blur-[7px] brightness-[0.92] contrast-[1.08] saturate-[1.1] scale-105 opacity-95'
              : 'group-hover:scale-105 opacity-100'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Top-Right Access Ribbon */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {canAccess ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white backdrop-blur-md flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3 h-3 text-white" />
              {isFree ? 'FREE' : 'UNLOCKED'}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/70 border border-amber-300/40 text-amber-300 backdrop-blur-md flex items-center gap-1 shadow-md">
              <Lock className="w-2.5 h-2.5 text-amber-300" />
              VIP EXCLUSIVE
            </span>
          )}
        </div>

        {/* Locked Overlay with refined floating capsule */}
        {!canAccess ? (
          <LockedPhotoOverlay
            item={item}
            onUnlock={() => onBuy(item)}
            variant="card"
          />
        ) : (
          item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/15 backdrop-blur-[1px] hover:bg-black/25 transition-colors">
              <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-md text-pink-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>
          )
        )}
      </div>

      {/* 3. SOCIAL ENGAGEMENT ACTION TOOLBAR */}
      <div className="px-3.5 sm:px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Like / Heart Button with real interaction */}
          <button
            type="button"
            onClick={handleToggleLike}
            className="flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-125 cursor-pointer"
            title="Like this post"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                liked ? 'fill-rose-500 text-rose-500' : 'text-purple-900/70 hover:text-rose-500'
              }`}
            />
            <span className={liked ? 'text-rose-600 font-extrabold' : 'text-purple-900/80'}>
              {likeCount.toLocaleString()}
            </span>
          </button>

          {/* Views */}
          <div className="flex items-center gap-1 text-xs text-purple-900/60 font-semibold">
            <Eye className="w-4 h-4 text-purple-400" />
            <span>{item.views.toLocaleString()}</span>
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={handleShareClick}
            className="flex items-center gap-1 text-xs text-purple-900/70 hover:text-pink-600 font-bold transition-colors cursor-pointer"
            title="Share post"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="text-[11px]">{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Price Pill */}
        <div>
          <span className="text-xs font-black text-pink-700 bg-pink-50 border border-pink-200/70 px-2.5 py-0.5 rounded-full shadow-2xs">
            {canAccess ? (isFree ? 'FREE' : 'UNLOCKED') : formatINR(item.price)}
          </span>
        </div>
      </div>

      {/* 4. POST CAPTION & DESCRIPTION */}
      <div className="px-3.5 sm:px-4 py-2 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs sm:text-[13px] text-purple-950 font-medium leading-relaxed">
            <span className="font-extrabold mr-1.5 text-purple-950">{creatorName}</span>
            {item.description || item.title}
          </p>

          {/* Hashtags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold text-pink-600 hover:text-pink-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 5. BOTTOM CTA ACTION BUTTON */}
        <div className="mt-3 pt-2.5 border-t border-purple-100/70">
          {canAccess ? (
            <button
              id={`btn-view-${item.id}`}
              onClick={() => onOpen(item)}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-purple-950 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-purple-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              {item.type === 'video' ? (
                <Play className="w-4 h-4 fill-pink-600 text-pink-600" />
              ) : (
                <Eye className="w-4 h-4 text-pink-600" />
              )}
              <span>{item.type === 'video' ? 'Watch Full Video' : 'View HD Photos'}</span>
            </button>
          ) : (
            <button
              id={`btn-unlock-${item.id}`}
              onClick={() => onBuy(item)}
              className="w-full hot-vip-btn py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer active:scale-98 transition-all uppercase tracking-wider font-display"
            >
              <Lock className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span className="truncate">⚡ अनलॉक करें • {formatINR(item.price)}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const ContentCard = React.memo(ContentCardComponent);
