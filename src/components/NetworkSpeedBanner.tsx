import React, { useState, useEffect } from 'react';
import { Zap, Wifi, WifiOff, X, Sparkles } from 'lucide-react';
import {
  getNetworkSpeedStatus,
  setStoredLiteModePreference,
  getStoredLiteModePreference,
  NetworkSpeedStatus
} from '../utils/networkSpeedOptimizer';

export const NetworkSpeedBanner: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkSpeedStatus>(getNetworkSpeedStatus);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('speed_banner_dismissed') === 'true';
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleLiteChange = () => setNetworkStatus(getNetworkSpeedStatus());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('network-lite-mode-changed', handleLiteChange);

    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    if (conn) {
      conn.addEventListener('change', handleLiteChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('network-lite-mode-changed', handleLiteChange);
      if (conn) {
        conn.removeEventListener('change', handleLiteChange);
      }
    };
  }, []);

  const handleToggleLiteMode = () => {
    const nextState = !networkStatus.isLiteMode;
    setStoredLiteModePreference(nextState);
    setNetworkStatus(getNetworkSpeedStatus());
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('speed_banner_dismissed', 'true');
  };

  // Only show if offline, or if user is on slow network & hasn't dismissed, or if lite mode is active
  const shouldShow = (!isOnline || networkStatus.isSlowNetwork || networkStatus.isLiteMode) && !isDismissed;

  if (!shouldShow) return null;

  return (
    <div
      id="low-speed-network-bar"
      className="w-full bg-gradient-to-r from-purple-950 via-pink-950 to-purple-950 text-white border-b border-pink-500/40 px-3 py-1.5 text-xs font-semibold backdrop-blur-md shadow-md z-30 select-none animate-in fade-in duration-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {!isOnline ? (
            <span className="inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
              <WifiOff className="w-3.5 h-3.5" />
              <span>ऑफ़लाइन मोड (कैश्ड डेटा चालू)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-yellow-300 font-black bg-rose-900/60 px-2 py-0.5 rounded-full border border-rose-400/40">
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span>⚡ 2G/3G लो-स्पीड फास्ट मोड</span>
            </span>
          )}

          <span className="text-pink-100 text-[11px] sm:text-xs">
            {networkStatus.isLiteMode
              ? 'कम स्पीड में भी साइट 0-सेकंड में तेजी से लोड हो रही है'
              : 'धीमा इंटरनेट डिटेक्ट हुआ। सुपर फास्ट मोड एक्टिवेट करें?'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleLiteMode}
            className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
              networkStatus.isLiteMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:scale-105 text-white shadow-md'
            }`}
          >
            {networkStatus.isLiteMode ? (
              <>
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>फास्ट मोड सक्रिय ✔</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-yellow-300" />
                <span>फास्ट मोड ऑन करें</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full text-white/50 hover:text-white transition-colors"
            title="छुपाएं"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
