import React from 'react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { Sparkles, Check, Lock, ShieldCheck, Star, Eye } from 'lucide-react';

interface PricingPacksProps {
  packs: MediaItem[];
  unlockedIds: string[];
  onBuy: (item: MediaItem) => void;
  onOpen: (item: MediaItem) => void;
}

export const PricingPacks: React.FC<PricingPacksProps> = ({
  packs,
  unlockedIds,
  onBuy,
  onOpen,
}) => {
  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-rose-600 to-amber-500 text-white uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 shadow-lg shadow-rose-600/30 animate-pulse">
            <Star className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
            🔥 VIP ऑल-एक्सेस मेगा बंडल डील्स
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-purple-950 tracking-tight">
            Ruma के <span className="hot-neon-text">सबसे बोल्ड और प्राइवेट</span> VIP पैक्स
          </h2>
          <p className="text-sm sm:text-base text-purple-900/70 mt-2 font-semibold">
            पूरे अनकट मास्टर वीडियो और अनसेंसर्ड 4K HD फोटो सेट्स को 85% भारी डिस्काउंट पर 1-क्लिक में तुरंत अनलॉक करें।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => {
            const isUnlocked = unlockedIds.includes(pack.id);

            return (
              <div
                key={pack.id}
                className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border border-white/80 hover:border-pink-300 shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Top ribbon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-rose-600 to-amber-500 text-white uppercase tracking-wider shadow-md shadow-rose-600/30 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                    <span>🔥 18+ VIP ऑल-एक्सेस</span>
                  </span>
                  <span className="text-xs text-rose-600 font-black flex items-center gap-1">
                    ⚡ 0-Sec UPI तुरंत अनलॉक
                  </span>
                </div>

                {/* Pack Image Preview (Preserves full aspect ratio with ambient blur background) */}
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-purple-100 shadow-inner bg-purple-950/30 flex items-center justify-center">
                  <img
                    src={getOptimizedImageUrl(pack.thumbnailUrl, 160, 30, true)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-125 opacity-60 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    src={getOptimizedImageUrl(pack.thumbnailUrl, 540, 75, !isUnlocked)}
                    alt={pack.title}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    className={`relative z-[1] w-full h-full object-contain transition-all duration-500 pointer-events-none ${
                      !isUnlocked
                        ? 'filter blur-[24px] brightness-[0.85] contrast-[1.15] scale-110 opacity-90'
                        : 'opacity-100 filter-none scale-100 group-hover:scale-105'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Frosted locked overlay for locked packs */}
                  {!isUnlocked ? (
                    <div 
                      onClick={() => onBuy(pack)}
                      className="absolute inset-0 z-[4] bg-gradient-to-t from-black/85 via-black/45 to-black/60 backdrop-blur-[3px] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/80 border-2 border-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/50 mb-1.5 animate-pulse">
                        <Lock className="w-5 h-5 text-yellow-300" />
                      </div>
                      <span className="text-xs font-black text-white drop-shadow-md">
                        🔒 VIP बंडल लॉक्ड
                      </span>
                      <span className="text-[10px] text-pink-200 font-bold mt-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-pink-500/40">
                        सिर्फ झलक • पेमेंट के बाद फुल HD अनलॉक
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-[2] bg-gradient-to-t from-purple-950/80 via-transparent to-transparent pointer-events-none" />
                  )}

                  <div className="absolute bottom-2 left-3 z-[5] text-xs font-extrabold text-white flex items-center gap-1.5">
                    {isUnlocked && (
                      <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs">
                        ✓ UNLOCKED
                      </span>
                    )}
                    <span>{pack.photoCount ? `${pack.photoCount} High-Res Items` : 'Full Uncut Video'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-purple-950 group-hover:text-pink-600 transition-colors">
                    {pack.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-900/70 mt-2 leading-relaxed font-medium">
                    {pack.description}
                  </p>

                  {/* Bullet perks */}
                  <ul className="mt-4 space-y-2 text-xs text-purple-950/80 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Original Uncompressed HD Quality</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>30-Day Instant Browser Access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct Creator Support</span>
                    </li>
                  </ul>
                </div>

                {/* Price and CTA Button */}
                <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-pink-700 block uppercase font-extrabold tracking-wider line-through">
                      ₹{Math.max(pack.price * 3, pack.price + 250)}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-2xl font-black text-purple-950">
                        {formatINR(pack.price)}
                      </span>
                      <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        75% OFF
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => onOpen(pack)}
                      className="py-2.5 px-5 rounded-2xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>पैक देखें 🎉</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuy(pack)}
                      className="hot-vip-btn py-3 px-5 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-xl shadow-rose-600/40 cursor-pointer hover:scale-105 active:scale-95 transition-all uppercase tracking-wide font-display border border-white/40"
                    >
                      <Lock className="w-3.5 h-3.5 text-yellow-300" />
                      <span>⚡ 1-क्लिक VIP अनलॉक</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
