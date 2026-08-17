import React from 'react';
import { Home, Film, Sparkles, Lock, ShieldCheck } from 'lucide-react';

interface BottomMobileNavProps {
  activeTab: string;
  unlockedCount: number;
  onNavigate: (route: string) => void;
  onOpenPurchases: () => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  activeTab,
  unlockedCount,
  onNavigate,
  onOpenPurchases,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-2xl border-t border-white/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        
        {/* Home */}
        <button
          id="mobile-nav-home"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-h-[48px] min-w-[56px] transition-all ${
            activeTab === 'home'
              ? 'text-pink-600 font-black scale-105'
              : 'text-purple-900/60 hover:text-purple-950'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Content / Explore */}
        <button
          id="mobile-nav-content"
          onClick={() => onNavigate('content')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-h-[48px] min-w-[56px] transition-all ${
            activeTab === 'content'
              ? 'text-pink-600 font-black scale-105'
              : 'text-purple-900/60 hover:text-purple-950'
          }`}
        >
          <Film className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Feed</span>
        </button>

        {/* VIP Packs */}
        <button
          id="mobile-nav-vip"
          onClick={() => onNavigate('vip-packs')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-h-[48px] min-w-[56px] transition-all ${
            activeTab === 'vip-packs'
              ? 'text-pink-600 font-black scale-105'
              : 'text-purple-900/60 hover:text-purple-950'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-pink-600" />
          <span className="text-[10px] tracking-tight">VIP Deals</span>
        </button>

        {/* My Unlocks */}
        <button
          id="mobile-nav-unlocks"
          onClick={onOpenPurchases}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-h-[48px] min-w-[56px] text-purple-900/70 hover:text-pink-600 transition-all"
        >
          <div className="relative">
            <Lock className="w-5 h-5 mb-0.5 text-pink-600" />
            {unlockedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-sm">
                {unlockedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-bold">Unlocks</span>
        </button>

      </div>
    </div>
  );
};
