import React from 'react';
import { MediaItem } from '../types';
import { X, Lock, Play, Eye, Sparkles, Film, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface PurchasedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedItems: MediaItem[];
  onOpenItem: (item: MediaItem) => void;
  onExplore: () => void;
}

export const PurchasedDrawer: React.FC<PurchasedDrawerProps> = ({
  isOpen,
  onClose,
  unlockedItems,
  onOpenItem,
  onExplore,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-purple-950/30 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl h-full border-l border-white/90 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-purple-100 bg-white/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-pink-100 text-pink-600 border border-pink-200 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-purple-950">
                My Unlocked Content
              </h3>
              <p className="text-xs text-pink-700 font-semibold">
                {unlockedItems.length} active unlocked items in this session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-pink-50 text-purple-900/60 hover:text-purple-950 border border-purple-100 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {unlockedItems.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 border-2 border-pink-300 flex items-center justify-center text-pink-600 mb-4 shadow-lg shadow-pink-500/10">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-base text-purple-950">
                No Unlocked Content Yet
              </h4>
              <p className="text-xs text-purple-900/70 max-w-xs mt-1 leading-relaxed font-medium">
                Choose any exclusive photo or video, scan the dynamic UPI QR code, and it will appear here immediately!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExplore();
                }}
                className="mt-6 glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white shadow-md shadow-pink-500/20"
              >
                Browse VIP Content
              </button>
            </div>
          ) : (
            unlockedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white/70 border border-white/90 shadow-sm flex items-center gap-3.5 hover:border-pink-300 hover:shadow-md transition-all group"
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-16 h-16 rounded-2xl object-cover border border-purple-100 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-pink-600" />
                    Unlocked
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-purple-950 truncate mt-0.5">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-purple-900/60 font-medium flex items-center gap-1 mt-0.5">
                    {item.type === 'video' ? <Film className="w-3 h-3 text-pink-600" /> : <ImageIcon className="w-3 h-3 text-pink-600" />}
                    {item.type.toUpperCase()}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenItem(item);
                  }}
                  className="p-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white shrink-0 shadow-md shadow-pink-600/20 transition-transform active:scale-95"
                  title="View / Play"
                >
                  {item.type === 'video' ? <Play className="w-4 h-4 fill-white ml-0.5" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Notice */}
        <div className="p-4 bg-white/70 border-t border-purple-100 text-center">
          <p className="text-[11px] text-purple-900/70 font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Tokens safely saved on this browser for 30 days
          </p>
        </div>

      </div>
    </div>
  );
};
