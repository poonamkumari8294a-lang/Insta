/**
 * High-performance Media Processing & Upload Utilities
 * Zero-copy Object URLs, hardware-accelerated image scaling, and zero-blocking video pipelines.
 */

export interface VideoMetadata {
  thumbnailDataUrl: string;
  posterBlob?: Blob;
  durationFormatted: string;
  durationSeconds: number;
  width: number;
  height: number;
}

export interface UploadTimings {
  fileSize: number;
  fileSizeBytes: number;
  preprocessTimeMs: number;
  uploadStartDelayMs: number;
  ttfbMs: number;
  uploadDurationMs: number;
  totalDurationMs: number;
  effectiveSpeedMbps: number;
}

/**
 * Checks whether an image requires client-side downscaling.
 * Images <= 2MB (or SVG/GIF) are uploaded directly as native Files with 0ms preprocessing.
 */
export function shouldCompressImage(fileOrBlob: File | Blob): boolean {
  if (!fileOrBlob || fileOrBlob.size === 0) return false;
  if (fileOrBlob.type === 'image/gif' || fileOrBlob.type === 'image/svg+xml') {
    return false;
  }
  // If file is 2MB or less, upload original directly (no preprocessing CPU delay)
  if (fileOrBlob.size <= 2 * 1024 * 1024) {
    return false;
  }
  return true;
}

/**
 * High-performance, lightweight image optimizer for large images (>2MB).
 * Uses native createImageBitmap when available for off-main-thread hardware decoding.
 * Skips processing immediately if file is already small (<= 2MB).
 */
export async function compressImageToBlob(
  file: File | Blob,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.80
): Promise<{ blob: Blob; mimeType: string; preprocessed: boolean; durationMs: number }> {
  const startTime = performance.now();

  // Fast path: If compression is not needed, return original immediately (0ms delay)
  if (!shouldCompressImage(file)) {
    return {
      blob: file,
      mimeType: file.type || 'image/jpeg',
      preprocessed: false,
      durationMs: Math.round(performance.now() - startTime)
    };
  }

  // Hardware-Accelerated Path: createImageBitmap (Off-main-thread)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file);
      let width = bitmap.width;
      let height = bitmap.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              const durationMs = Math.round(performance.now() - startTime);
              if (blob) {
                resolve({
                  blob,
                  mimeType: blob.type || 'image/webp',
                  preprocessed: true,
                  durationMs
                });
              } else {
                canvas.toBlob(
                  (jpgBlob) => {
                    resolve({
                      blob: jpgBlob || file,
                      mimeType: 'image/jpeg',
                      preprocessed: true,
                      durationMs: Math.round(performance.now() - startTime)
                    });
                  },
                  'image/jpeg',
                  quality
                );
              }
            },
            'image/webp',
            quality
          );
        });
      }
      bitmap.close();
    } catch (bitmapErr) {
      console.warn('[ImageBitmap fallback to standard Image]', bitmapErr);
    }
  }

  // Fallback Canvas Image Scaling
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const safetyTimer = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        blob: file,
        mimeType: file.type || 'image/jpeg',
        preprocessed: false,
        durationMs: Math.round(performance.now() - startTime)
      });
    }, 3000);

    img.onload = () => {
      clearTimeout(safetyTimer);
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });

      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        resolve({
          blob: file,
          mimeType: file.type || 'image/jpeg',
          preprocessed: false,
          durationMs: Math.round(performance.now() - startTime)
        });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(
        (blob) => {
          const durationMs = Math.round(performance.now() - startTime);
          if (blob) {
            resolve({
              blob,
              mimeType: blob.type || 'image/webp',
              preprocessed: true,
              durationMs
            });
          } else {
            canvas.toBlob(
              (jpgBlob) => {
                resolve({
                  blob: jpgBlob || file,
                  mimeType: 'image/jpeg',
                  preprocessed: true,
                  durationMs: Math.round(performance.now() - startTime)
                });
              },
              'image/jpeg',
              quality
            );
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      clearTimeout(safetyTimer);
      URL.revokeObjectURL(objectUrl);
      resolve({
        blob: file,
        mimeType: file.type || 'image/jpeg',
        preprocessed: false,
        durationMs: Math.round(performance.now() - startTime)
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Reads a File object as base64 Data URL (used only when strictly necessary, e.g. Payment receipt snapshot)
 */
export function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Fast helper to compress image and return as data URL (e.g. for offline payment receipt previews)
 */
export async function compressImageFile(
  file: File | Blob,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.80
): Promise<string> {
  const { blob } = await compressImageToBlob(file, maxWidth, maxHeight, quality);
  return readFileAsDataURL(blob);
}

/**
 * Prints a clean, structured Timing Report in browser dev console
 */
export function printUploadTimingReport(report: {
  mediaType: 'photo' | 'video' | 'album_photo' | 'document';
  fileName: string;
  originalSizeBytes: number;
  uploadSizeBytes: number;
  preprocessTimeMs: number;
  uploadStartDelayMs: number;
  ttfbMs: number;
  uploadDurationMs: number;
  totalDurationMs: number;
  secureUrl: string;
}) {
  const speedMbps =
    report.uploadDurationMs > 0
      ? ((report.uploadSizeBytes * 8) / (report.uploadDurationMs / 1000) / 1000000).toFixed(2)
      : '0.00';

  console.group(`⚡ [Upload Timing Report] ${report.mediaType.toUpperCase()} - ${report.fileName}`);
  console.log(`📦 File Size: ${formatFileSize(report.originalSizeBytes)} (Upload Payload: ${formatFileSize(report.uploadSizeBytes)})`);
  console.log(`⏱️ Preprocessing Time: ${report.preprocessTimeMs} ms ${report.preprocessTimeMs === 0 ? '(Skipped - Direct Native Upload)' : ''}`);
  console.log(`🚀 Upload Start Delay: ${report.uploadStartDelayMs} ms`);
  console.log(`📡 Time To First Byte (TTFB): ${report.ttfbMs} ms`);
  console.log(`📤 Upload Transfer Duration: ${report.uploadDurationMs} ms (Avg Speed: ${speedMbps} Mbps)`);
  console.log(`🏁 Total Duration: ${report.totalDurationMs} ms`);
  console.log(`🔗 CDN Secure URL: ${report.secureUrl}`);
  console.groupEnd();
}
