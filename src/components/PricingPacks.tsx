import React from 'react';
import { MediaItem } from '../types';
import { formatINR } from '../utils/api';
import { Sparkles, Check, Lock, ShieldCheck, Star } from 'lucide-react';

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
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-pink-100/80 border border-pink-200 text-pink-700 uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 shadow-sm">
            <Star className="w-3.5 h-3.5 text-pink-600 fill-pink-600" />
            VIP Bundle Deals
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-purple-950 tracking-tight">
            Exclusive Premium Combos
          </h2>
          <p className="text-sm sm:text-base text-purple-900/70 mt-2 font-medium">
            Get multi-photo sets and uncut master videos bundled together at heavy discounts.
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
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white uppercase tracking-wider shadow-md shadow-pink-500/20">
                    VIP Special
                  </span>
                  <span className="text-xs text-pink-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    Instant UPI Unlock
                  </span>
                </div>

                {/* Pack Image Preview (Preserves full aspect ratio with ambient blur background) */}
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-purple-100 shadow-inner bg-purple-950/30 flex items-center justify-center">
                  <img
                    src={pack.thumbnailUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110 opacity-50"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    src={pack.thumbnailUrl}
                    alt={pack.title}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    className="relative z-[1] w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 z-[2] bg-gradient-to-t from-purple-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-3 z-[3] text-xs font-extrabold text-white">
                    {pack.photoCount ? `${pack.photoCount} High-Res Items` : 'Full Uncut Video'}
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
                      className="py-2.5 px-5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md cursor-pointer"
                    >
                      View Pack 🎉
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuy(pack)}
                      className="glow-pink-btn py-3 px-5 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-lg shadow-pink-500/25 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock VIP Pack</span>
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
