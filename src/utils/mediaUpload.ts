/**
 * High-performance Media upload & processing utility for Firebase Storage
 * Zero-copy Object URLs, direct binary streaming, and fast non-blocking thumbnails.
 */

export interface VideoMetadata {
  thumbnailDataUrl: string;
  posterBlob?: Blob;
  durationFormatted: string;
  durationSeconds: number;
  width: number;
  height: number;
}

/**
 * Reads a File object as base64 Data URL (used only when strictly necessary, e.g. Cropper modal)
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
 * Calculates byte size of a string or JSON object
 */
export function getApproximateByteSize(data: any): number {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return new Blob([str]).size;
  } catch (_) {
    return 0;
  }
}

/**
 * High-performance image optimizer for Firebase Storage upload.
 * Uses native Object URLs and Canvas to avoid creating large Base64 strings in memory.
 * Returns an optimized native Blob directly ready for Firebase Storage.
 */
export async function compressImageToBlob(
  file: File | Blob,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.85
): Promise<{ blob: Blob; mimeType: string }> {
  // If it's a GIF or SVG, preserve exact original binary
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return { blob: file, mimeType: file.type };
  }

  // Fast path: If the file is already a JPEG/WebP under 600KB, skip re-compression unless dimensions are huge
  const isSmallImage = file.size > 0 && file.size < 600 * 1024;
  const isWebpOrJpeg = file.type === 'image/webp' || file.type === 'image/jpeg';

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // If dimensions are within bounds and file is already lightweight WebP/JPEG, upload original directly!
      if (isSmallImage && isWebpOrJpeg && width <= maxWidth && height <= maxHeight) {
        URL.revokeObjectURL(objectUrl);
        resolve({ blob: file, mimeType: file.type });
        return;
      }

      // Calculate proportional scale
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: false });

      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium'; // Faster than 'high' with near identical visual quality
      ctx.drawImage(img, 0, 0, width, height);

      // Clean up DOM Object URL immediately
      URL.revokeObjectURL(objectUrl);

      // Convert canvas directly to WebP or JPEG Blob (zero base64 overhead)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, mimeType: blob.type || 'image/webp' });
          } else {
            canvas.toBlob(
              (jpgBlob) => {
                resolve({ blob: jpgBlob || file, mimeType: 'image/jpeg' });
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
      URL.revokeObjectURL(objectUrl);
      resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
    };

    img.src = objectUrl;
  });
}

/**
 * Fast Video Metadata and Poster Thumbnail Extractor.
 * Runs non-blocking and extracts poster Blob directly for Firebase Storage.
 */
export function processVideoFile(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;

    // Safety timeout: If metadata fails to load in 4s, resolve gracefully without blocking upload
    const timer = setTimeout(() => {
      URL.revokeObjectURL(videoUrl);
      resolve({
        thumbnailDataUrl: '',
        durationFormatted: '0:30',
        durationSeconds: 30,
        width: 720,
        height: 1280
      });
    }, 4000);

    video.onloadedmetadata = () => {
      // Seek quickly to 0.3s or 5% to grab a non-black poster frame
      const seekTime = Math.min(0.5, Math.max(0.1, video.duration * 0.05));
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const targetWidth = Math.min(video.videoWidth || 720, 640);
        const ratio = targetWidth / (video.videoWidth || 720);
        const targetHeight = Math.max(1, Math.round((video.videoHeight || 1280) * ratio));

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const durSec = Math.round(video.duration || 0);
        const mins = Math.floor(durSec / 60);
        const secs = durSec % 60;
        const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        canvas.toBlob(
          (posterBlob) => {
            URL.revokeObjectURL(videoUrl);
            resolve({
              thumbnailDataUrl: '',
              posterBlob: posterBlob || undefined,
              durationFormatted: formatted,
              durationSeconds: durSec,
              width: video.videoWidth,
              height: video.videoHeight
            });
          },
          'image/webp',
          0.80
        );
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        resolve({
          thumbnailDataUrl: '',
          durationFormatted: '0:30',
          durationSeconds: 30,
          width: 720,
          height: 1280
        });
      }
    };

    video.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(videoUrl);
      resolve({
        thumbnailDataUrl: '',
        durationFormatted: '0:30',
        durationSeconds: 30,
        width: 720,
        height: 1280
      });
    };
  });
}

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Fast helper to compress image and return as lightweight data URL (e.g. for receipts or quick previews)
 */
export async function compressImageFile(
  file: File | Blob,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<string> {
  const { blob, mimeType } = await compressImageToBlob(file, maxWidth, maxHeight, quality);
  return readFileAsDataURL(blob);
}
