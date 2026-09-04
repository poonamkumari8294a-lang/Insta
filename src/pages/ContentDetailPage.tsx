import React, { useState } from 'react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import { ContentCard } from '../components/ContentCard';
import { LockedPhotoOverlay } from '../components/LockedPhotoOverlay';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import {
  Lock,
  Play,
  Eye,
  Heart,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Film,
  Image as ImageIcon,
  Layers,
  CheckCircle2,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ContentDetailPageProps {
  item: MediaItem;
  allContent: MediaItem[];
  isUnlocked: boolean;
  unlockedIds?: string[];
  onBack: () => void;
  onBuy: (item: MediaItem) => void;
  onOpenMedia: (item: MediaItem) => void;
  onOpenShare?: (item: MediaItem) => void;
}

export const ContentDetailPage: React.FC<ContentDetailPageProps> = ({
  item,
  allContent,
  isUnlocked,
  unlockedIds = [],
  onBack,
  onBuy,
  onOpenMedia,
  onOpenShare,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const isFree = item.access === 'free';
  const canAccess = isFree || isUnlocked;

  const galleryList = (item.galleryUrls && item.galleryUrls.length > 0)
    ? item.galleryUrls
    : (item.mediaUrl ? [item.mediaUrl] : [item.thumbnailUrl]);

  const activeMediaSrc = galleryList[activePhotoIdx] || item.mediaUrl || item.thumbnailUrl;
  const photoCount = item.galleryUrls?.length || item.photoCount || 1;
  const isMultiPhoto = item.type === 'pack' || photoCount > 1;

  const related = allContent
    .filter((c) => c.id !== item.id && (c.type === item.type || c.featured))
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
      
      {/* Top Bar: Back Button & Share (Share hidden if content is unlocked) */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-black text-purple-950 hover:text-pink-600 bg-white/80 hover:bg-pink-50 px-4 py-2.5 rounded-2xl border border-purple-200 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to VIP Gallery</span>
        </button>

        {!isUnlocked ? (
          onOpenShare && (
            <button
              id="detail-top-btn-share"
              type="button"
              onClick={() => onOpenShare(item)}
              className="inline-flex items-center gap-2 text-xs font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-105 px-4 py-2.5 rounded-2xl shadow-md shadow-pink-500/20 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Preview Link</span>
            </button>
          )
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold shadow-xs">
            <Lock className="w-3.5 h-3.5 text-pink-600" />
            <span>VIP Unlocked • Non-Shareable</span>
          </div>
        )}
      </div>

      {/* Main Content Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Media Display */}
        <div className="lg:col-span-7 space-y-3">
          <div className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-2xl relative select-none protected-media-container">
            
            <div 
              onContextMenu={(e) => e.preventDefault()}
              className="relative min-h-[320px] max-h-[85vh] w-full bg-purple-950 flex items-center justify-center overflow-hidden"
            >
              {/* Subtle ambient blurred background */}
              <img
                src={getOptimizedImageUrl(item.thumbnailUrl, 160, 30)}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-125 opacity-25 select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              
              {canAccess ? (
                item.type === 'video' ? (
                  <video
                    src={item.mediaUrl || item.thumbnailUrl}
                    controls
                    autoPlay
                    loop
                    className="relative z-[1] w-full h-full max-h-[85vh] object-contain"
                  />
                ) : (
                  <img
                    src={activeMediaSrc}
                    alt={item.title}
                    className="relative z-[1] w-full h-auto max-h-[85vh] object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                )
              ) : (
                <div className="relative w-full h-full min-h-[360px] flex flex-col items-center justify-center select-none overflow-hidden">
                  {/* Blurred Locked Silhouette */}
                  <img
                    src={getOptimizedImageUrl(item.thumbnailUrl, 480, 50, true)}
                    alt={item.title}
                    className="w-full h-full object-contain filter blur-[28px] scale-110 opacity-85 select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                  />

                  {/* Premium Animated Lock Overlay */}
                  <LockedPhotoOverlay
                    item={item}
                    onUnlock={() => onBuy(item)}
                    variant="detail"
                  />
                </div>
              )}

              {/* Multi-Photo Carousel Controls when Unlocked */}
              {canAccess && item.type !== 'video' && galleryList.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx((prev) => (prev - 1 + galleryList.length) % galleryList.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-transform active:scale-90"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx((prev) => (prev + 1) % galleryList.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-transform active:scale-90"
                    title="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-md">
                    {activePhotoIdx + 1} / {galleryList.length} Photos
                  </div>
                </>
              )}

            </div>

          </div>

          {/* Unlocked Multi-Photo Thumbnail Bar */}
          {canAccess && item.type !== 'video' && galleryList.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto p-2 no-scrollbar">
              {galleryList.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activePhotoIdx === idx ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/30' : 'border-purple-200/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(url, 120, 60)}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-lg space-y-5">
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-pink-100 text-pink-700 border border-pink-200 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                {item.type === 'video' ? <Film className="w-3.5 h-3.5 text-pink-600" /> : <ImageIcon className="w-3.5 h-3.5 text-pink-600" />}
                <span>{item.type === 'pack' ? `VIP PACK (${photoCount})` : item.type.toUpperCase()}</span>
              </span>

              {canAccess ? (
                <span className="text-xs font-black text-emerald-700 flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Unlocked
                </span>
              ) : (
                <span className="font-display text-2xl font-black text-purple-950">
                  {formatINR(item.price)}
                </span>
              )}
            </div>

            <div>
              <h1 className="font-display font-black text-xl sm:text-2xl text-purple-950 leading-snug">
                {item.title}
              </h1>
              <p className="text-xs sm:text-sm text-purple-900/70 mt-2 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-xs text-purple-900/70 py-3 border-y border-purple-100 font-semibold">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-pink-600" /> {item.views.toLocaleString()} Views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-600" /> {item.likes.toLocaleString()} Likes
              </span>
            </div>

            {/* What you get list */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                What's Included:
              </h4>
              <ul className="space-y-2 text-xs text-purple-900/80 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isMultiPhoto ? `Complete set of all ${photoCount} uncut HD photos` : 'Uncut uncompressed 1080p full resolution photo'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant lifetime access saved in your browser</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero account registration or password required</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            {!canAccess ? (
              <div className="pt-2">
                <button
                  id="detail-btn-buy-now"
                  onClick={() => onBuy(item)}
                  className="w-full glow-pink-btn animate-btn-breathe py-3.5 px-6 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isMultiPhoto ? `Unlock ${photoCount} Photos for ${formatINR(item.price)}` : `Unlock Now for ${formatINR(item.price)}`}</span>
                </button>
                <p className="text-[11px] text-center text-purple-900/60 mt-2 flex items-center justify-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Instant UPI QR Scan • Direct Access
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => onOpenMedia(item)}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm font-black text-purple-950 bg-white hover:bg-pink-50 border border-purple-200 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-pink-600 text-pink-600" />
                  <span>{item.type === 'video' ? 'Open Fullscreen Video' : `Open Fullscreen Viewer (${photoCount} Photos)`}</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Related Content Recommendations */}
      {related.length > 0 && (
        <div className="pt-10 border-t border-purple-100">
          <h3 className="font-display font-black text-xl text-purple-950 mb-6">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((rel) => (
              <ContentCard
                key={rel.id}
                item={rel}
                isUnlocked={unlockedIds.includes(rel.id)}
                onOpen={onOpenMedia}
                onBuy={onBuy}
                onOpenShare={onOpenShare}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

