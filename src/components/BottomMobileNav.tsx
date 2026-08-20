import React from 'react';
import { Home, Film, Sparkles, Lock, Share2 } from 'lucide-react';

interface BottomMobileNavProps {
  activeTab: string;
  unlockedCount: number;
  onNavigate: (route: string) => void;
  onOpenPurchases: () => void;
  onOpenShare?: () => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  activeTab,
  unlockedCount,
  onNavigate,
  onOpenPurchases,
  onOpenShare,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100/80 px-2 pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_25px_rgba(147,51,234,0.08)] hardware-accelerated"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <button
          id="mobile-nav-home"
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl min-h-[44px] min-w-[48px] transition-transform active:scale-90 ${
            activeTab === 'home'
              ? 'text-pink-600 font-extrabold'
              : 'text-purple-900/65 active:text-pink-600'
          }`}
        >
          <Home className={`w-4 h-4 mb-0.5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight font-medium">Home</span>
        </button>

        {/* Content / Explore */}
        <button
          id="mobile-nav-content"
          type="button"
          onClick={() => onNavigate('content')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl min-h-[44px] min-w-[48px] transition-transform active:scale-90 ${
            activeTab === 'content'
              ? 'text-pink-600 font-extrabold'
              : 'text-purple-900/65 active:text-pink-600'
          }`}
        >
          <Film className={`w-4 h-4 mb-0.5 ${activeTab === 'content' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight font-medium">Feed</span>
        </button>

        {/* VIP Deals */}
        <button
          id="mobile-nav-vip"
          type="button"
          onClick={() => onNavigate('vip-packs')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl min-h-[44px] min-w-[48px] transition-transform active:scale-90 ${
            activeTab === 'vip-packs'
              ? 'text-pink-600 font-extrabold'
              : 'text-purple-900/65 active:text-pink-600'
          }`}
        >
          <Sparkles className={`w-4 h-4 mb-0.5 text-pink-600 ${activeTab === 'vip-packs' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight font-medium">Deals</span>
        </button>

        {/* My Unlocks */}
        <button
          id="mobile-nav-unlocks"
          type="button"
          onClick={onOpenPurchases}
          className="relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl min-h-[44px] min-w-[48px] text-purple-900/70 active:text-pink-600 transition-transform active:scale-90"
        >
          <div className="relative">
            <Lock className="w-4 h-4 mb-0.5 text-pink-600" />
            {unlockedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-xs">
                {unlockedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-bold">Unlocks</span>
        </button>

        {/* Share Action */}
        {onOpenShare && (
          <button
            id="mobile-nav-share"
            type="button"
            onClick={onOpenShare}
            className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl min-h-[44px] min-w-[48px] text-purple-900/70 active:text-pink-600 transition-transform active:scale-90"
          >
            <Share2 className="w-4 h-4 mb-0.5 text-pink-600" />
            <span className="text-[10px] tracking-tight font-bold">Share</span>
          </button>
        )}

      </div>
    </nav>
  );
};
