import React, { useState } from 'react';
import { MediaItem } from '../types';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Sparkles, Download, Check, ShieldAlert } from 'lucide-react';

interface MediaModalProps {
  item: MediaItem | null;
  onClose: () => void;
  creatorName: string;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  item,
  onClose,
  creatorName,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/content/${item.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mediaSource = item.mediaUrl || item.thumbnailUrl;

  return (
    <div className="fixed inset-0 z-50 bg-purple-950/40 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white/85 backdrop-blur-2xl rounded-3xl border border-white/90 overflow-hidden shadow-2xl">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-purple-100 bg-white/70">
          <div className="flex items-center gap-2 sm:gap-3 pr-2">
            <span className="bg-pink-100 text-pink-700 border border-pink-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-pink-600" />
              {item.access === 'free' ? 'Free Preview' : 'VIP Unlocked'}
            </span>
            <h2 className="text-sm sm:text-base font-black text-purple-950 truncate max-w-[200px] sm:max-w-md">
              {item.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="text-xs px-3 py-1.5 rounded-2xl bg-white hover:bg-pink-50 text-purple-900 border border-purple-100 flex items-center gap-1 font-bold shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              id="media-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-2xl bg-white text-purple-900/60 hover:text-purple-950 hover:bg-pink-50 border border-purple-100 transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Player Area */}
        <div className="relative flex-1 bg-purple-950 flex items-center justify-center min-h-[300px] sm:min-h-[460px] max-h-[65vh] overflow-hidden select-none">
          {item.type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center group">
              <video
                src={mediaSource}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                controls
                className="w-full h-full max-h-[65vh] object-contain"
              />

              {/* Watermark Protection Overlay */}
              <div className="absolute bottom-4 right-4 pointer-events-none opacity-50 text-xs font-mono text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                @{creatorName} VIP • {item.id}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <img
                src={mediaSource}
                alt={item.title}
                className="w-full h-full max-h-[65vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
              {/* Subtle Watermark */}
              <div className="absolute bottom-6 right-6 pointer-events-none opacity-50 text-xs font-mono text-white bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                @{creatorName} • Exclusive Photo
              </div>
            </div>
          )}
        </div>

        {/* Bottom Details Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white/80 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs text-purple-900/80 leading-relaxed max-w-2xl font-medium">
              {item.description}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-purple-900/60 mt-1 font-semibold">
              <span>{item.views} views</span>
              <span>•</span>
              <span>{item.likes} likes</span>
              <span>•</span>
              <span className="text-pink-600 font-bold">{item.type.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-pink-700 flex items-center gap-1 font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-pink-600" />
              Creator Protected Media
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
