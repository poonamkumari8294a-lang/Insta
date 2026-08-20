import React from 'react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import { ContentCard } from '../components/ContentCard';
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
  Share2
} from 'lucide-react';

interface ContentDetailPageProps {
  item: MediaItem;
  allContent: MediaItem[];
  isUnlocked: boolean;
  onBack: () => void;
  onBuy: (item: MediaItem) => void;
  onOpenMedia: (item: MediaItem) => void;
  onOpenShare?: (item: MediaItem) => void;
}

export const ContentDetailPage: React.FC<ContentDetailPageProps> = ({
  item,
  allContent,
  isUnlocked,
  onBack,
  onBuy,
  onOpenMedia,
  onOpenShare,
}) => {
  const isFree = item.access === 'free';
  const canAccess = isFree || isUnlocked;

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
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-2xl relative">
            
            <div className="relative aspect-[4/5] sm:aspect-square w-full bg-purple-950 flex items-center justify-center overflow-hidden">
              
              {canAccess ? (
                item.type === 'video' ? (
                  <video
                    src={item.mediaUrl || item.thumbnailUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={item.mediaUrl || item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                )
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
                  {/* Blurred Background Preview */}
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover filter blur-2xl scale-110 opacity-70"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute inset-0 bg-purple-950/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 border-2 border-pink-400 flex items-center justify-center mb-4 shadow-2xl shadow-pink-500/40">
                      <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600 animate-pulse" />
                    </div>

                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md mb-2">
                      Locked VIP Content
                    </span>

                    <h2 className="font-display font-black text-lg sm:text-xl text-white max-w-sm">
                      {item.title}
                    </h2>

                    <p className="text-xs text-purple-100 mt-1 max-w-xs font-medium">
                      Unlock instantly for {formatINR(item.price)} with UPI QR scan.
                    </p>

                    <button
                      onClick={() => onBuy(item)}
                      className="mt-5 glow-pink-btn px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center gap-2 shadow-xl shadow-pink-500/25"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Unlock with UPI ({formatINR(item.price)})</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Right: Info & Purchase Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-lg space-y-5">
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-pink-100 text-pink-700 border border-pink-200 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                {item.type === 'video' ? <Film className="w-3.5 h-3.5 text-pink-600" /> : <ImageIcon className="w-3.5 h-3.5 text-pink-600" />}
                <span>{item.type.toUpperCase()}</span>
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
                  <span>Uncut uncompressed 1080p full resolution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-day instant access on this browser</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero account login required</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            {!canAccess ? (
              <div className="pt-2">
                <button
                  id="detail-btn-buy-now"
                  onClick={() => onBuy(item)}
                  className="w-full glow-pink-btn py-3.5 px-6 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25"
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock Now for {formatINR(item.price)}</span>
                </button>
                <p className="text-[11px] text-center text-purple-900/60 mt-2 flex items-center justify-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Direct UPI Bank Verification (No fake UTRs accepted)
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => onOpenMedia(item)}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm font-black text-purple-950 bg-white hover:bg-pink-50 border border-purple-200 shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-pink-600 text-pink-600" />
                  <span>Open Fullscreen Player</span>
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
                isUnlocked={isUnlocked}
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
