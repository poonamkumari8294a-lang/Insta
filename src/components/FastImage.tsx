import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, getMicroBlurUrl } from '../utils/imageOptimizer';
import { ImageOff, RefreshCw } from 'lucide-react';

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  width?: number;
  quality?: number;
  className?: string;
  aspectRatio?: string; // e.g. '1/1', '4/5', '16/9'
  priority?: boolean;
}

export const FastImage: React.FC<FastImageProps> = ({
  src,
  alt = '',
  width,
  quality,
  className = '',
  aspectRatio,
  priority = false,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const optimizedSrc = getOptimizedImageUrl(src, width, quality);
  const microBlurSrc = getMicroBlurUrl(src);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src, retryCount]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div
      className={`relative overflow-hidden bg-purple-950/20 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* 1. Micro-blur Low-Resolution Placeholder (Loads in ~0.05s on 2G) */}
      {!isLoaded && microBlurSrc && !hasError && (
        <img
          src={microBlurSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110 opacity-70 transition-opacity duration-300"
          referrerPolicy="no-referrer"
        />
      )}

      {/* 2. Loading Shimmer Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none" />
      )}

      {/* 3. Main Optimized Image */}
      {!hasError ? (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          fetchPriority={priority ? 'high' : 'low'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-105'
          } ${className}`}
          {...rest}
        />
      ) : (
        /* 4. Slow-network fallback & 1-tap retry */
        <div className="absolute inset-0 bg-purple-950/80 flex flex-col items-center justify-center p-3 text-center text-white/80 gap-1.5">
          <ImageOff className="w-6 h-6 text-pink-400 opacity-60" />
          <span className="text-[11px] font-medium text-pink-200">धीमा इंटरनेट कनेक्शन</span>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white flex items-center gap-1 border border-white/20 transition-all active:scale-95"
          >
            <RefreshCw className="w-3 h-3 text-yellow-300 animate-spin" />
            <span>पुनः लोड करें</span>
          </button>
        </div>
      )}
    </div>
  );
};
