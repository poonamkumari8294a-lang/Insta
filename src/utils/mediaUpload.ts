/**
 * Media upload & processing utility for Gallery / Device file picking & Firebase Storage
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
 * Reads a File object as base64 Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Calculates byte size of a base64 string or JSON object
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
 * Compresses an image File or Blob and returns an optimized native Blob for Firebase Storage upload
 */
export async function compressImageToBlob(
  file: File | Blob,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<{ blob: Blob; mimeType: string }> {
  // If it's a GIF or SVG, preserve exact binary
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return { blob: file, mimeType: file.type };
  }

  const dataUrl = file instanceof File
    ? await readFileAsDataURL(file)
    : await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(file);
      });

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
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
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP with fallback to JPEG
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
    img.onerror = () => resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
    img.src = dataUrl;
  });
}

/**
 * Compresses/resizes an image file using an offscreen canvas to keep payload snappy
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.80
): Promise<string> {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return readFileAsDataURL(file);
  }

  const dataUrl = await readFileAsDataURL(file);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
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
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      let compressed = '';
      try {
        compressed = canvas.toDataURL('image/webp', quality);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }
      } catch {
        compressed = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Generates an automatic video thumbnail and metadata from a video file
 */
export function processVideoFile(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;

    const timer = setTimeout(async () => {
      try {
        URL.revokeObjectURL(videoUrl);
        resolve({
          thumbnailDataUrl: '',
          durationFormatted: '0:30',
          durationSeconds: 30,
          width: 720,
          height: 1280
        });
      } catch (e) {
        URL.revokeObjectURL(videoUrl);
        reject(e);
      }
    }, 8000);

    video.onloadedmetadata = () => {
      const seekTime = Math.min(1, Math.max(0.2, video.duration * 0.1));
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const targetWidth = Math.min(video.videoWidth || 720, 720);
        const ratio = targetWidth / (video.videoWidth || 720);
        const targetHeight = Math.round((video.videoHeight || 1280) * ratio);

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        let thumbUrl = '';

        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            thumbUrl = canvas.toDataURL('image/webp', 0.80);
            if (!thumbUrl.startsWith('data:image/webp')) {
              thumbUrl = canvas.toDataURL('image/jpeg', 0.80);
            }
          } catch {
            thumbUrl = canvas.toDataURL('image/jpeg', 0.80);
          }
        }

        const durSec = Math.round(video.duration || 0);
        const mins = Math.floor(durSec / 60);
        const secs = durSec % 60;
        const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        // Also extract blob if possible
        canvas.toBlob((posterBlob) => {
          URL.revokeObjectURL(videoUrl);
          resolve({
            thumbnailDataUrl: thumbUrl,
            posterBlob: posterBlob || undefined,
            durationFormatted: formatted,
            durationSeconds: durSec,
            width: video.videoWidth,
            height: video.videoHeight
          });
        }, 'image/webp', 0.80);
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
 * Format bytes to readable size
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
