import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import {
  X,
  Sparkles,
  ShieldCheck,
  Lock,
  AlertTriangle,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import { LockedPhotoOverlay } from './LockedPhotoOverlay';

interface MediaModalProps {
  item: MediaItem | null;
  isOpen?: boolean;
  onClose: () => void;
  creatorName?: string;
  isUnlocked?: boolean;
  onBuy?: (item: MediaItem) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  item,
  isOpen = true,
  onClose,
  creatorName = 'Ruma Kumari',
  isUnlocked = false,
  onBuy,
}) => {
  const [isScreenProtected, setIsScreenProtected] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Reset photo index on item change
  useEffect(() => {
    setPhotoIndex(0);
  }, [item?.id]);

  // Anti-Screenshot & Screen-Recording Deterrence
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenProtected(true);
      } else {
        setTimeout(() => setIsScreenProtected(false), 300);
      }
    };

    const handleBlur = () => {
      // When screen capture / snipping tool captures focus, protect the canvas
      setIsScreenProtected(true);
    };

    const handleFocus = () => {
      setIsScreenProtected(false);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // PrintScreen key deterrence
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        try {
          navigator.clipboard.writeText('🔒 Media is protected by creator DRM');
        } catch (_) {}
        setSecurityWarning('⚠️ स्क्रीनशॉट और शेयरिंग प्रतिबंधित है (Screenshots & Sharing are disabled for VIP content).');
        setTimeout(() => setSecurityWarning(null), 4000);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Save Page / Print Page shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
        e.preventDefault();
        setSecurityWarning('⚠️ Saving, sharing and printing protected media is disabled.');
        setTimeout(() => setSecurityWarning(null), 3000);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isOpen || !item) return null;

  const canAccess = item.access === 'free' || isUnlocked;

  const galleryList = (item.galleryUrls && item.galleryUrls.length > 0)
    ? item.galleryUrls
    : (item.mediaUrl ? [item.mediaUrl] : [item.thumbnailUrl]);

  const activePhotoSrc = galleryList[photoIndex] || item.mediaUrl || item.thumbnailUrl;
  const mediaSource = item.mediaUrl || item.thumbnailUrl;
  const hasMultiplePhotos = canAccess && item.type !== 'video' && galleryList.length > 1;

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPhotoIndex(prev => (prev + 1) % galleryList.length);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPhotoIndex(prev => (prev - 1 + galleryList.length) % galleryList.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/90 overflow-hidden shadow-2xl">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-purple-100 bg-white/80">
          <div className="flex items-center gap-2 sm:gap-3 pr-2">
            <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm ${
              item.access === 'free'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : canAccess
                ? 'bg-pink-100 text-pink-700 border border-pink-200'
                : 'bg-purple-100 text-purple-800 border border-purple-200'
            }`}>
              <Sparkles className="w-3 h-3 text-pink-600" />
              {item.access === 'free' ? 'Free Preview' : canAccess ? 'VIP Unlocked' : 'VIP Locked'}
            </span>
            <h2 className="text-sm sm:text-base font-black text-purple-950 truncate max-w-[200px] sm:max-w-md">
              {item.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Private Non-Shareable Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold shadow-xs">
              <Lock className="w-3.5 h-3.5 text-pink-600" />
              <span>Private VIP • Non-Shareable</span>
            </div>

            <button
              id="media-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-2xl bg-white text-purple-900/70 hover:text-purple-950 hover:bg-pink-50 border border-purple-200 transition-all shadow-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Warning Notification */}
        {securityWarning && (
          <div className="px-4 py-2 bg-amber-500 text-amber-950 text-xs font-black flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{securityWarning}</span>
          </div>
        )}

        {/* Media Player Area with DRM & Anti-Recording Watermarks */}
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="relative flex-1 bg-zinc-950 flex items-center justify-center min-h-[300px] sm:min-h-[460px] max-h-[65vh] overflow-hidden select-none protected-media-container"
        >
          {/* Obfuscation Shield when recording or app lost focus */}
          {isScreenProtected && (
            <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-14 h-14 rounded-full bg-pink-500/20 border border-pink-500 flex items-center justify-center text-pink-400">
                <EyeOff className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black">Content Protected</h4>
              <p className="text-xs text-zinc-400 max-w-sm">
                Screenshots, sharing & screen recording are strictly prohibited for creator content.
              </p>
            </div>
          )}

          {/* Dynamic Floating Watermark Tile Grid */}
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-wrap items-center justify-around opacity-[0.18] overflow-hidden select-none rotate-[-15deg] scale-125">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="p-8 text-[11px] font-mono font-black text-white/90 whitespace-nowrap">
                @{creatorName} VIP • PRIVATE • NON-TRANSFERABLE
              </div>
            ))}
          </div>

          {/* Media Content or Locked Overlay */}
          {!canAccess ? (
            <div className="relative w-full h-full min-h-[340px] flex items-center justify-center">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover filter blur-[20px] scale-105 opacity-40 select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <LockedPhotoOverlay
                item={item}
                onUnlock={() => {
                  onClose();
                  if (onBuy) onBuy(item);
                }}
                variant="detail"
              />
            </div>
          ) : item.type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center group">
              <video
                src={mediaSource}
                autoPlay
                loop
                playsInline
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full max-h-[65vh] object-contain pointer-events-auto"
              />

              {/* Dynamic Timestamp & Viewer Watermark */}
              <div className="absolute bottom-4 right-4 pointer-events-none opacity-70 text-[10px] font-mono text-white bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-sm z-20">
                @{creatorName} VIP • {item.id} • {new Date().toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
              <img
                key={activePhotoSrc}
                src={activePhotoSrc}
                alt={`${item.title} - ${photoIndex + 1}`}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full max-h-[60vh] object-contain rounded-lg pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                referrerPolicy="no-referrer"
              />

              {/* Multi-Photo Carousel Controls */}
              {hasMultiplePhotos && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-transform active:scale-90 z-20 cursor-pointer shadow-lg"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-transform active:scale-90 z-20 cursor-pointer shadow-lg"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Photo Counter Pill */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 text-white border border-white/20 backdrop-blur-md text-xs font-black z-20">
                    <Layers className="w-3.5 h-3.5 text-pink-400" />
                    <span>{photoIndex + 1} / {galleryList.length}</span>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/70 border border-white/20 backdrop-blur-md max-w-[90%] overflow-x-auto no-scrollbar z-20">
                    {galleryList.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoIndex(idx);
                        }}
                        className={`relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          idx === photoIndex ? 'border-pink-500 scale-105 ring-2 ring-pink-500/50' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={photo} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Corner Watermark */}
              <div className="absolute bottom-4 right-4 pointer-events-none opacity-70 text-[10px] font-mono text-white bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-sm z-10">
                @{creatorName} • Exclusive VIP Photo
              </div>
            </div>
          )}
        </div>

        {/* Bottom Details Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-white/90 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-black">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              DRM Protected • Non-Shareable
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
