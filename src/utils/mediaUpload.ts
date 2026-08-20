/**
 * Media upload & processing utility for Gallery / Device file picking
 */

export interface VideoMetadata {
  thumbnailDataUrl: string;
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
 * Compresses/resizes an image file using an offscreen canvas to keep payload snappy
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.82
): Promise<string> {
  // If it's a GIF or SVG, do not re-encode through canvas to preserve animation/vector
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

      // Fast JPEG compression to keep under 60-90KB
      const compressed = canvas.toDataURL('image/jpeg', quality);
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

    // Timeout fallback in case video fails to decode
    const timer = setTimeout(async () => {
      try {
        const fallbackData = await readFileAsDataURL(file);
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
      // Seek slightly into the video for a good frame (0.5s or 10%)
      const seekTime = Math.min(1, Math.max(0.2, video.duration * 0.1));
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext('2d');
        let thumbUrl = '';

        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbUrl = canvas.toDataURL('image/jpeg', 0.85);
        }

        const durSec = Math.round(video.duration || 0);
        const mins = Math.floor(durSec / 60);
        const secs = durSec % 60;
        const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        URL.revokeObjectURL(videoUrl);
        resolve({
          thumbnailDataUrl: thumbUrl,
          durationFormatted: formatted,
          durationSeconds: durSec,
          width: video.videoWidth,
          height: video.videoHeight
        });
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
