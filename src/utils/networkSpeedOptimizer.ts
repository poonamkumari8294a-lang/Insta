/**
 * Network Speed & Low-Bandwidth Adaptive Optimizer
 * 
 * Detects slow networks (2G, 3G, slow-2g, or Save-Data mode)
 * and dynamically adapts image resolutions, quality, and animation load
 * so the website loads instantly even on weak 2G/3G mobile data.
 */

export interface NetworkSpeedStatus {
  isSlowNetwork: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  saveData: boolean;
  isLiteMode: boolean;
}

const LITE_MODE_STORAGE_KEY = 'ruma_data_saver_lite_mode';

// Helper to check if user manually forced Lite Mode
export function getStoredLiteModePreference(): boolean | null {
  try {
    const val = localStorage.getItem(LITE_MODE_STORAGE_KEY);
    if (val !== null) return val === 'true';
  } catch (_) {}
  return null;
}

export function setStoredLiteModePreference(enabled: boolean) {
  try {
    localStorage.setItem(LITE_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('network-lite-mode-changed'));
  } catch (_) {}
}

export function getNetworkSpeedStatus(): NetworkSpeedStatus {
  const manualPref = getStoredLiteModePreference();

  // Inspect navigator.connection if available (Chrome, Android Chrome, Edge)
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
  const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;

  const effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown' =
    conn?.effectiveType || 'unknown';
  const saveData: boolean = Boolean(conn?.saveData);
  const rtt: number = conn?.rtt || 0; // Round-trip time in ms

  // Automatically classify as slow if 2G/3G, Save-Data is active, or RTT > 700ms
  const isAutoSlow =
    effectiveType === 'slow-2g' ||
    effectiveType === '2g' ||
    effectiveType === '3g' ||
    saveData ||
    rtt > 700;

  const isLiteMode = manualPref !== null ? manualPref : isAutoSlow;

  return {
    isSlowNetwork: isAutoSlow,
    effectiveType,
    saveData,
    isLiteMode,
  };
}

/**
 * Returns optimized image width & quality based on real-time network conditions.
 * On slow 2G/3G connections, serves ultra-compact WebP thumbnails (~12KB to 25KB).
 */
export function getAdaptiveImageParams(defaultWidth = 480, defaultQuality = 75) {
  const { isLiteMode } = getNetworkSpeedStatus();

  if (isLiteMode) {
    // Ultra-lightweight payload for slow networks (<20KB)
    return {
      width: Math.min(defaultWidth, 340),
      quality: 60,
    };
  }

  return {
    width: defaultWidth,
    quality: defaultQuality,
  };
}
