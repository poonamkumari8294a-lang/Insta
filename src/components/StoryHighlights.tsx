import React, { useState, useEffect, useRef } from 'react';
import { StoryHighlight } from '../types';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';

interface StoryHighlightsProps {
  highlights: StoryHighlight[];
  onOpenItem?: (id: string) => void;
}

export const StoryHighlights: React.FC<StoryHighlightsProps> = ({
  highlights,
}) => {
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);
  const [activeStoryItemIndex, setActiveStoryItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const timerRef = useRef<any>(null);

  const currentHighlight = activeHighlightIndex !== null ? highlights[activeHighlightIndex] : null;
  const currentItem = currentHighlight ? currentHighlight.items[activeStoryItemIndex] : null;

  // Auto progression timer
  useEffect(() => {
    if (activeHighlightIndex === null || !currentHighlight || isPaused) return;

    const duration = 5000; // 5 seconds per story slide
    const interval = 50; // update step

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next slide
          if (activeStoryItemIndex < currentHighlight.items.length - 1) {
            setActiveStoryItemIndex(activeStoryItemIndex + 1);
            return 0;
          } else if (activeHighlightIndex < highlights.length - 1) {
            // Next highlight
            setActiveHighlightIndex(activeHighlightIndex + 1);
            setActiveStoryItemIndex(0);
            return 0;
          } else {
            // Close player
            setActiveHighlightIndex(null);
            return 0;
          }
        }
        return prev + (interval / duration) * 100;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeHighlightIndex, activeStoryItemIndex, isPaused, currentHighlight, highlights.length]);

  const handleNext = () => {
    if (!currentHighlight) return;
    setProgress(0);
    if (activeStoryItemIndex < currentHighlight.items.length - 1) {
      setActiveStoryItemIndex(activeStoryItemIndex + 1);
    } else if (activeHighlightIndex !== null && activeHighlightIndex < highlights.length - 1) {
      setActiveHighlightIndex(activeHighlightIndex + 1);
      setActiveStoryItemIndex(0);
    } else {
      setActiveHighlightIndex(null);
    }
  };

  const handlePrev = () => {
    if (!currentHighlight) return;
    setProgress(0);
    if (activeStoryItemIndex > 0) {
      setActiveStoryItemIndex(activeStoryItemIndex - 1);
    } else if (activeHighlightIndex !== null && activeHighlightIndex > 0) {
      const prevHighlight = highlights[activeHighlightIndex - 1];
      setActiveHighlightIndex(activeHighlightIndex - 1);
      setActiveStoryItemIndex(prevHighlight.items.length - 1);
    }
  };

  const openHighlight = (index: number) => {
    setActiveHighlightIndex(index);
    setActiveStoryItemIndex(0);
    setProgress(0);
  };

  return (
    <div className="w-full py-4">
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2 px-1">
        
        {/* Story Circle Items */}
        {highlights.map((hl, idx) => (
          <button
            key={hl.id}
            id={`highlight-btn-${hl.id}`}
            onClick={() => openHighlight(idx)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-105 group-active:scale-95 transition-all duration-300 shadow-md shadow-pink-500/20">
              <div className="w-full h-full rounded-full p-[2px] bg-[#0f0715]">
                <img
                  src={hl.coverImage}
                  alt={hl.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full group-hover:brightness-110 transition-all"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-pink-100/90 group-hover:text-pink-300 max-w-[70px] truncate text-center">
              {hl.title}
            </span>
          </button>
        ))}

      </div>

      {/* Story Viewer Modal */}
      {activeHighlightIndex !== null && currentHighlight && currentItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          
          {/* Main Story Container */}
          <div 
            className="relative w-full max-w-sm h-full sm:h-[88vh] sm:max-h-[750px] sm:rounded-3xl overflow-hidden bg-zinc-950 flex flex-col justify-between shadow-2xl border border-pink-500/30"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Top Progress Bars */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
              {currentHighlight.items.map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear"
                    style={{
                      width:
                        i < activeStoryItemIndex
                          ? '100%'
                          : i === activeStoryItemIndex
                          ? `${progress}%`
                          : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Top Header info */}
            <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={currentHighlight.coverImage}
                  alt={currentHighlight.title}
                  className="w-8 h-8 rounded-full border border-pink-400 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-xs font-bold text-white tracking-wide block">
                    {currentHighlight.title}
                  </span>
                  <span className="text-[10px] text-pink-300/80">Creator Story</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentItem.type === 'video' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}

                <button
                  id="story-modal-close-btn"
                  onClick={() => setActiveHighlightIndex(null)}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {currentItem.type === 'image' ? (
                <img
                  src={currentItem.url}
                  alt={currentItem.caption || currentHighlight.title}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <video
                  src={currentItem.url}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover select-none"
                />
              )}

              {/* Tap Left / Right touch zones */}
              <div 
                className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
              />
              <div 
                className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              />
            </div>

            {/* Bottom Caption & Interactive Heart */}
            <div className="absolute bottom-4 left-3 right-3 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 rounded-2xl flex items-center justify-between">
              <div className="pr-4">
                <p className="text-sm font-medium text-white drop-shadow-md">
                  {currentItem.caption || '🌸 Exclusive daily vibe'}
                </p>
                <span className="text-[11px] text-pink-300 flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3" /> VIP Diary
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-2.5 rounded-full bg-pink-600/80 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/40 active:scale-90 transition-transform"
                >
                  <Heart className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>

            {/* Desktop Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>
        </div>
      )}
    </div>
  );
};
