/**
 * Cloudinary Media Storage Service (Unsigned High-Speed Direct Upload)
 * 
 * Direct browser-to-Cloudinary media stream via Unsigned Upload Preset.
 * - Zero API secrets or private credentials exposed.
 * - Real-time byte-level XMLHttpRequest progress tracking (0% -> 100%).
 * - Zero Base64 / FileReader encoding for native files.
 * - High-speed global CDN delivery.
 */

import { formatFileSize, printUploadTimingReport } from '../utils/mediaUpload';

export const CLOUDINARY_CONFIG = {
  cloudName: (((import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME as string) || 'mnbjgtqu').trim(),
  uploadPreset: (((import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET as string) || 'rumacutegirl').trim(),
  defaultFolder: 'website-media'
};

export type CloudinaryFolder = 'website-media' | 'photos' | 'videos' | 'thumbnails' | 'documents' | 'settings' | 'general' | string;
export type CloudinaryResourceType = 'image' | 'video' | 'raw' | 'auto';

export interface CloudinaryUploadProgress {
  progressPercent: number;
  statusText: string;
  bytesTransferred: number;
  totalBytes: number;
  speedText?: string;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  cloudinaryPublicId: string;
  resourceType: string;
  resource_type: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  durationFormatted?: string;
  thumbnailUrl?: string;
  originalFilename?: string;
  timings?: {
    preprocessTimeMs: number;
    uploadStartDelayMs: number;
    ttfbMs: number;
    uploadDurationMs: number;
    totalDurationMs: number;
  };
}

/**
 * Checks whether a string is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Extracts publicId, resourceType, and format from any Cloudinary URL
 */
export function extractCloudinaryAssetInfo(url: string | undefined | null): {
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  format?: string;
} | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!isCloudinaryUrl(trimmed)) return null;

  try {
    const parsedUrl = new URL(trimmed.startsWith('//') ? `https:${trimmed}` : trimmed);
    const pathname = parsedUrl.pathname;

    let resourceType: 'image' | 'video' | 'raw' = 'image';
    if (pathname.includes('/video/upload/') || pathname.includes('/video/')) {
      resourceType = 'video';
    } else if (pathname.includes('/raw/upload/') || pathname.includes('/raw/')) {
      resourceType = 'raw';
    }

    const uploadIndex = pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const afterUpload = pathname.substring(uploadIndex + '/upload/'.length);
    const segments = afterUpload.split('/');
    const cleanSegments: string[] = [];

    for (const seg of segments) {
      if (
        seg.includes(',') ||
        seg.startsWith('w_') ||
        seg.startsWith('h_') ||
        seg.startsWith('c_') ||
        seg.startsWith('q_') ||
        seg.startsWith('so_') ||
        seg.startsWith('f_') ||
        /^v\d+$/.test(seg)
      ) {
        continue;
      }
      cleanSegments.push(seg);
    }

    if (cleanSegments.length === 0) return null;

    const publicIdWithExt = cleanSegments.join('/');
    const publicId = publicIdWithExt.replace(/\.[a-zA-Z0-9]+$/, '');
    const extMatch = publicIdWithExt.match(/\.([a-zA-Z0-9]+)$/);
    const format = extMatch ? extMatch[1].toLowerCase() : (resourceType === 'video' ? 'mp4' : 'jpg');

    return {
      publicId,
      resourceType,
      format
    };
  } catch (_) {
    return null;
  }
}

/**
 * Checks whether a string is a valid permanent HTTP/HTTPS media URL (not Base64 or Blob URL)
 */
export function isPermanentMediaUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:') || url.startsWith('blob:')) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/');
}

/**
 * Generates an automatic high-quality video poster thumbnail URL directly from a Cloudinary video URL.
 * Instant 0ms generation via Cloudinary URL transformation.
 * Example:
 * Input:  https://res.cloudinary.com/mnbjgtqu/video/upload/v1725/my_video.mp4
 * Output: https://res.cloudinary.com/mnbjgtqu/video/upload/so_0,w_720,c_limit,q_auto,f_jpg/v1725/my_video.jpg
 */
export function getCloudinaryVideoThumbnailUrl(
  videoUrl: string | undefined | null,
  options: { width?: number; seekOffsetSec?: number } = {}
): string {
  if (!videoUrl || typeof videoUrl !== 'string') return '';
  if (!videoUrl.includes('cloudinary.com') || !videoUrl.includes('/video/upload/')) {
    return videoUrl;
  }

  const width = options.width || 720;
  const seek = options.seekOffsetSec !== undefined ? options.seekOffsetSec : 0;
  const transform = `so_${seek},w_${width},c_limit,q_auto,f_jpg`;

  let transformed = videoUrl.replace(/\.(mp4|webm|mov|m4v|avi|mkv|3gp)(\?.*)?$/i, '.jpg$2');
  transformed = transformed.replace('/video/upload/', `/video/upload/${transform}/`);

  return transformed;
}

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(durationInSeconds: number | undefined | null): string {
  if (!durationInSeconds || isNaN(durationInSeconds) || durationInSeconds <= 0) {
    return '0:30';
  }
  const totalSecs = Math.round(durationInSeconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Determines appropriate Cloudinary resource type based on file or mime type
 */
export function determineResourceType(fileOrMime: File | Blob | string): CloudinaryResourceType {
  let mime = '';
  if (typeof fileOrMime === 'string') {
    mime = fileOrMime;
  } else if (fileOrMime && fileOrMime.type) {
    mime = fileOrMime.type;
  }

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'video';
  if (mime.includes('pdf') || mime.includes('document') || mime.includes('zip') || mime.includes('octet-stream')) {
    return 'auto';
  }
  return 'auto';
}

/**
 * High-Speed Direct Upload to Cloudinary using an Unsigned Upload Preset.
 * Real-time XMLHttpRequest progress provides actual byte transfer metrics without simulation.
 */
export function uploadToCloudinary(
  fileOrBlob: File | Blob,
  options: {
    folder?: CloudinaryFolder;
    resourceType?: CloudinaryResourceType;
    customFilename?: string;
    selectionTime?: number;
    preprocessDurationMs?: number;
    onProgress?: (
      progressPercent: number,
      statusText: string,
      meta?: { bytesTransferred: number; totalBytes: number; speedText?: string }
    ) => void;
  } = {}
): Promise<CloudinaryUploadResult> {
  const {
    folder = 'website-media',
    selectionTime = performance.now(),
    preprocessDurationMs = 0,
    onProgress
  } = options;

  const cloudName = CLOUDINARY_CONFIG.cloudName;
  const uploadPreset = CLOUDINARY_CONFIG.uploadPreset;

  if (!cloudName || !uploadPreset) {
    return Promise.reject(
      new Error('Cloudinary configuration missing. Please verify VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.')
    );
  }

  const resourceType = options.resourceType || determineResourceType(fileOrBlob);
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const requestInitTime = performance.now();
  const uploadStartDelayMs = Math.round(requestInitTime - selectionTime);

  let firstByteTime = 0;
  let lastTransferred = 0;
  let lastTime = requestInitTime;
  let smoothedSpeedBps = 0;
  const fileSize = fileOrBlob.size || 0;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }

    const filename = options.customFilename || (fileOrBlob instanceof File ? fileOrBlob.name : `file_${Date.now()}`);
    formData.append('file', fileOrBlob, filename);

    if (onProgress) {
      onProgress(0, `Uploading to Cloudinary (0 B / ${formatFileSize(fileSize)})...`, {
        bytesTransferred: 0,
        totalBytes: fileSize,
        speedText: 'Starting...'
      });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const currentTime = performance.now();
        if (firstByteTime === 0 && event.loaded > 0) {
          firstByteTime = currentTime;
        }

        const timeDeltaSec = Math.max(0.05, (currentTime - lastTime) / 1000);
        const bytesDelta = Math.max(0, event.loaded - lastTransferred);

        if (bytesDelta > 0) {
          const instantSpeed = bytesDelta / timeDeltaSec;
          smoothedSpeedBps = smoothedSpeedBps === 0 ? instantSpeed : (smoothedSpeedBps * 0.7 + instantSpeed * 0.3);
          lastTransferred = event.loaded;
          lastTime = currentTime;
        }

        const speedFormatted = smoothedSpeedBps > 0 ? `${formatFileSize(smoothedSpeedBps)}/s` : '';
        const totalBytes = event.total || fileSize || 1;
        const rawProgress = Math.floor((event.loaded / totalBytes) * 100);
        const progress = Math.min(99, Math.max(0, rawProgress));
        const transferredFormatted = `${formatFileSize(event.loaded)} / ${formatFileSize(totalBytes)}`;

        if (onProgress) {
          onProgress(
            progress,
            `Uploading to Cloudinary... ${progress}% (${transferredFormatted}) ${speedFormatted ? `• ${speedFormatted}` : ''}`,
            {
              bytesTransferred: event.loaded,
              totalBytes,
              speedText: speedFormatted
            }
          );
        }
      }
    };

    xhr.onload = () => {
      const completionTime = performance.now();
      const uploadDurationMs = Math.round(completionTime - requestInitTime);
      const totalDurationMs = Math.round(completionTime - selectionTime);
      const ttfbMs = firstByteTime > 0 ? Math.round(firstByteTime - requestInitTime) : 0;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const secureUrl: string = data.secure_url || data.url;
          const publicId: string = data.public_id || '';
          const resType: string = data.resource_type || resourceType;
          const transferred = data.bytes || fileSize;
          const durationSeconds = typeof data.duration === 'number' ? data.duration : undefined;
          const durationFormatted = durationSeconds ? formatDuration(durationSeconds) : undefined;
          const thumbnailUrl = resType === 'video' ? getCloudinaryVideoThumbnailUrl(secureUrl) : undefined;

          if (onProgress) {
            onProgress(100, `Upload complete! 100% (${formatFileSize(transferred)})`, {
              bytesTransferred: transferred,
              totalBytes: transferred
            });
          }

          // Output Timing Debug Report to console
          printUploadTimingReport({
            mediaType: resType === 'video' ? 'video' : 'photo',
            fileName: filename,
            originalSizeBytes: fileSize,
            uploadSizeBytes: transferred,
            preprocessTimeMs: preprocessDurationMs,
            uploadStartDelayMs,
            ttfbMs,
            uploadDurationMs,
            totalDurationMs,
            secureUrl
          });

          resolve({
            secureUrl,
            publicId,
            cloudinaryPublicId: publicId,
            resourceType: resType,
            resource_type: resType,
            format: data.format || (resType === 'video' ? 'mp4' : 'jpg'),
            bytes: transferred,
            width: data.width,
            height: data.height,
            duration: durationSeconds,
            durationFormatted,
            thumbnailUrl,
            originalFilename: data.original_filename || filename,
            timings: {
              preprocessTimeMs: preprocessDurationMs,
              uploadStartDelayMs,
              ttfbMs,
              uploadDurationMs,
              totalDurationMs
            }
          });
        } catch (parseErr: any) {
          reject(new Error(`Failed to parse Cloudinary response: ${parseErr.message}`));
        }
      } else {
        let errorDetails = 'Cloudinary upload failed';
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.error?.message) {
            errorDetails = errData.error.message;
          }
        } catch (_) {
          errorDetails = `HTTP ${xhr.status} ${xhr.statusText}`;
        }

        console.error(`[Cloudinary Upload Error HTTP ${xhr.status}]`, errorDetails);
        reject(new Error(`Cloudinary Error: ${errorDetails}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload to Cloudinary. Please check your internet connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Cloudinary upload timed out. Please try again with a stable connection.'));
    };

    xhr.timeout = 15 * 60 * 1000;
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}
