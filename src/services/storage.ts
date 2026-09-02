import { storage } from './firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  StorageReference
} from 'firebase/storage';
import { MediaItem, SiteSettings } from '../types';
import { formatFileSize } from '../utils/mediaUpload';

export type StorageFolder = 'photos' | 'videos' | 'thumbnails' | 'documents' | 'settings' | 'general';

export interface StorageUploadProgress {
  progressPercent: number;
  statusText: string;
  bytesTransferred: number;
  totalBytes: number;
  speedText?: string;
}

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
  bytesTransferred: number;
  totalBytes: number;
  durationMs?: number;
}

/**
 * Checks whether a string is a Base64 data URL
 */
export function isDataUrl(str: string | undefined | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:');
}

/**
 * Checks whether a string is a Firebase Storage URL
 */
export function isFirebaseStorageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('storage.googleapis.com')
  );
}

/**
 * Converts a Base64 Data URL into a native Blob with proper MIME type
 */
export function dataURLtoBlob(dataUrl: string): { blob: Blob; mimeType: string; extension: string } {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) {
      throw new Error('Invalid data URL format');
    }
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binaryStr = atob(parts[1]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    let extension = 'bin';
    if (mimeType.includes('webp')) extension = 'webp';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
    else if (mimeType.includes('png')) extension = 'png';
    else if (mimeType.includes('gif')) extension = 'gif';
    else if (mimeType.includes('svg')) extension = 'svg';
    else if (mimeType.includes('mp4')) extension = 'mp4';
    else if (mimeType.includes('webm')) extension = 'webm';
    else if (mimeType.includes('quicktime') || mimeType.includes('mov')) extension = 'mov';
    else if (mimeType.includes('pdf')) extension = 'pdf';

    return {
      blob: new Blob([bytes], { type: mimeType }),
      mimeType,
      extension
    };
  } catch (err: any) {
    console.error('[Storage Helper] Failed to parse Data URL to Blob:', err);
    throw new Error('Failed to process image data: ' + (err.message || 'Invalid format'));
  }
}

/**
 * Uploads a native File or Blob directly to Firebase Storage with real-time progress callbacks.
 * Configured with caching headers for lightning-fast worldwide delivery.
 */
export function uploadFileToStorage(
  fileOrBlob: File | Blob,
  folder: StorageFolder = 'photos',
  customFilename?: string,
  onProgress?: (progressPercent: number, statusText: string, meta?: { bytesTransferred: number; totalBytes: number; speedText?: string }) => void,
  retryCount = 0
): Promise<StorageUploadResult> {
  const startTime = performance.now();
  let lastTransferred = 0;
  let lastTime = startTime;

  return new Promise((resolve, reject) => {
    try {
      const mimeType = fileOrBlob.type || 'application/octet-stream';
      let fileExt = 'bin';
      if (fileOrBlob instanceof File && fileOrBlob.name) {
        const dotIndex = fileOrBlob.name.lastIndexOf('.');
        if (dotIndex !== -1) {
          fileExt = fileOrBlob.name.substring(dotIndex + 1).toLowerCase();
        }
      } else {
        if (mimeType.includes('webp')) fileExt = 'webp';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) fileExt = 'jpg';
        else if (mimeType.includes('png')) fileExt = 'png';
        else if (mimeType.includes('gif')) fileExt = 'gif';
        else if (mimeType.includes('mp4')) fileExt = 'mp4';
        else if (mimeType.includes('webm')) fileExt = 'webm';
        else if (mimeType.includes('pdf')) fileExt = 'pdf';
      }

      const extension = fileExt === 'bin' && mimeType.includes('jpeg') ? 'jpg' : fileExt;
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = customFilename || `${timestamp}_${randomStr}.${extension}`;
      const storagePath = `uploads/${folder}/${filename}`;

      const storageRef = ref(storage, storagePath);
      
      // Optimal HTTP Cache headers for long-term edge CDN caching
      const metadata = {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000, immutable',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          appSource: 'ruma_creator_app'
        }
      };

      // Notify immediately of network connection start
      if (onProgress) {
        onProgress(1, 'Connecting to Firebase Storage...', {
          bytesTransferred: 0,
          totalBytes: fileOrBlob.size || 0,
          speedText: 'Starting...'
        });
      }

      const uploadTask = uploadBytesResumable(storageRef, fileOrBlob, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const currentTime = performance.now();
          const timeDeltaSec = Math.max(0.1, (currentTime - lastTime) / 1000);
          const bytesDelta = Math.max(0, snapshot.bytesTransferred - lastTransferred);
          const currentSpeedBps = bytesDelta / timeDeltaSec;
          const speedFormatted = `${formatFileSize(currentSpeedBps)}/s`;

          lastTransferred = snapshot.bytesTransferred;
          lastTime = currentTime;

          const totalBytes = snapshot.totalBytes || fileOrBlob.size || 1;
          const rawProgress = Math.round((snapshot.bytesTransferred / totalBytes) * 100);
          // Scale from 1 to 99% during active transfer
          const progress = Math.min(99, Math.max(1, rawProgress));
          const transferredFormatted = `${formatFileSize(snapshot.bytesTransferred)} / ${formatFileSize(totalBytes)}`;

          if (onProgress) {
            onProgress(progress, `Uploading (${transferredFormatted}) • ${speedFormatted}`, {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes,
              speedText: speedFormatted
            });
          }
        },
        async (error) => {
          console.error('[Firebase Storage Upload Error]', error);
          if (retryCount < 2) {
            console.warn(`[Firebase Storage] Retrying upload (attempt ${retryCount + 2})...`);
            if (onProgress) {
              onProgress(1, 'Retrying upload to Firebase Storage...', {
                bytesTransferred: 0,
                totalBytes: fileOrBlob.size || 0
              });
            }
            try {
              const retryRes = await uploadFileToStorage(fileOrBlob, folder, customFilename, onProgress, retryCount + 1);
              resolve(retryRes);
            } catch (retryErr) {
              reject(retryErr);
            }
          } else {
            reject(new Error(`Storage Upload Failed: ${error.message || 'Network error'}`));
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const durationMs = Math.round(performance.now() - startTime);
            if (onProgress) {
              onProgress(100, 'Upload complete!', {
                bytesTransferred: uploadTask.snapshot.totalBytes,
                totalBytes: uploadTask.snapshot.totalBytes
              });
            }
            if (process.env.NODE_ENV !== 'production') {
              console.log(`[Firebase Storage] Uploaded ${folder}/${filename} (${uploadTask.snapshot.totalBytes} bytes) in ${durationMs}ms`);
            }
            resolve({
              downloadUrl,
              storagePath,
              bytesTransferred: uploadTask.snapshot.bytesTransferred,
              totalBytes: uploadTask.snapshot.totalBytes,
              durationMs
            });
          } catch (urlErr: any) {
            console.error('[Firebase Storage getDownloadURL Error]', urlErr);
            reject(new Error(`Failed to retrieve download URL: ${urlErr.message}`));
          }
        }
      );
    } catch (err: any) {
      console.error('[Firebase Storage Init Error]', err);
      reject(err);
    }
  });
}

/**
 * Uploads a Data URL (e.g. from cropper canvas) to Firebase Storage
 */
export async function uploadDataUrlToStorage(
  dataUrl: string,
  folder: StorageFolder = 'photos',
  customFilename?: string,
  onProgress?: (progressPercent: number, statusText: string, meta?: { bytesTransferred: number; totalBytes: number; speedText?: string }) => void
): Promise<StorageUploadResult> {
  // If already an HTTP/HTTPS URL, return as-is immediately
  if (!isDataUrl(dataUrl)) {
    return {
      downloadUrl: dataUrl,
      storagePath: '',
      bytesTransferred: 0,
      totalBytes: 0
    };
  }

  const { blob, extension } = dataURLtoBlob(dataUrl);
  const fname = customFilename || `crop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
  return uploadFileToStorage(blob, folder, fname, onProgress);
}

/**
 * Unified helper to ensure any image/video (File, Blob, or Data URL) is uploaded to Firebase Storage
 */
export async function uploadMediaToStorage(
  source: File | Blob | string,
  folder: StorageFolder = 'photos',
  onProgress?: (progressPercent: number, statusText: string) => void
): Promise<string> {
  if (typeof source === 'string') {
    if (!isDataUrl(source)) {
      return source;
    }
    const result = await uploadDataUrlToStorage(source, folder, undefined, onProgress);
    return result.downloadUrl;
  } else {
    const result = await uploadFileToStorage(source, folder, undefined, onProgress);
    return result.downloadUrl;
  }
}

/**
 * Deletes a file from Firebase Storage given its download URL or storage path
 */
export async function deleteStorageFile(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath || !isFirebaseStorageUrl(urlOrPath)) {
    return false;
  }

  try {
    const storageRef: StorageReference = ref(storage, urlOrPath);
    await deleteObject(storageRef);
    return true;
  } catch (err: any) {
    console.warn('[Firebase Storage Delete Non-fatal]', err.message);
    return false;
  }
}

/**
 * Controlled Concurrency Pool for parallel tasks (e.g. multi-photo albums)
 */
export async function asyncPool<T, R>(
  concurrency: number,
  items: T[],
  task: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const p = task(items[i], i).then((res) => {
      results[i] = res;
    });

    const e: Promise<void> = p.then(() => {
      const idx = executing.indexOf(e);
      if (idx !== -1) executing.splice(idx, 1);
    });
    executing.push(e);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Ensures all media fields in a MediaItem (mediaUrl, thumbnailUrl, previewUrl, galleryUrls)
 * are stored as permanent Firebase Storage HTTPS URLs and not bloated Base64 strings.
 * Fast, non-blocking passthrough if URLs are already on Firebase Storage.
 */
export async function ensureMediaItemStorageUrls(
  item: Partial<MediaItem>,
  onStatusUpdate?: (status: string) => void
): Promise<Partial<MediaItem>> {
  const result = { ...item };
  const folder: StorageFolder = result.type === 'video' ? 'videos' : 'photos';

  // 1. Process main mediaUrl
  if (result.mediaUrl && isDataUrl(result.mediaUrl)) {
    if (onStatusUpdate) onStatusUpdate('Main media file uploading to Firebase Storage...');
    try {
      const uploadRes = await uploadDataUrlToStorage(result.mediaUrl, folder);
      result.mediaUrl = uploadRes.downloadUrl;
    } catch (err: any) {
      console.error('Failed to upload mediaUrl to Storage:', err);
      throw new Error(`Media upload failed: ${err.message}`);
    }
  }

  // 2. Process thumbnailUrl
  if (result.thumbnailUrl && isDataUrl(result.thumbnailUrl)) {
    if (onStatusUpdate) onStatusUpdate('Thumbnail poster uploading to Firebase Storage...');
    try {
      const uploadRes = await uploadDataUrlToStorage(result.thumbnailUrl, 'thumbnails');
      result.thumbnailUrl = uploadRes.downloadUrl;
    } catch (err: any) {
      console.error('Failed to upload thumbnailUrl to Storage:', err);
    }
  }

  // 3. Process previewUrl
  if (result.previewUrl && isDataUrl(result.previewUrl)) {
    if (onStatusUpdate) onStatusUpdate('Preview media uploading to Firebase Storage...');
    try {
      const uploadRes = await uploadDataUrlToStorage(result.previewUrl, 'thumbnails');
      result.previewUrl = uploadRes.downloadUrl;
    } catch (err: any) {
      console.error('Failed to upload previewUrl to Storage:', err);
    }
  }

  // 4. Process multi-photo galleryUrls in controlled parallel concurrency (3 files at once)
  if (Array.isArray(result.galleryUrls) && result.galleryUrls.length > 0) {
    const hasDataUrls = result.galleryUrls.some(u => isDataUrl(u));
    if (hasDataUrls) {
      if (onStatusUpdate) {
        onStatusUpdate('Uploading gallery photos to Firebase Storage in parallel...');
      }

      result.galleryUrls = await asyncPool(
        3,
        result.galleryUrls,
        async (photoUrl) => {
          if (isDataUrl(photoUrl)) {
            const uploadRes = await uploadDataUrlToStorage(photoUrl, 'photos');
            return uploadRes.downloadUrl;
          }
          return photoUrl;
        }
      );
    }

    if (result.galleryUrls.length > 0) {
      if (!result.mediaUrl || isDataUrl(result.mediaUrl)) {
        result.mediaUrl = result.galleryUrls[0];
      }
      if (!result.thumbnailUrl || isDataUrl(result.thumbnailUrl)) {
        result.thumbnailUrl = result.galleryUrls[0];
      }
    }
  }

  return result;
}

/**
 * Ensures profile pictures and banners in SiteSettings are uploaded to Firebase Storage
 */
export async function ensureSiteSettingsStorageUrls(
  settings: Partial<SiteSettings>,
  onStatusUpdate?: (status: string) => void
): Promise<Partial<SiteSettings>> {
  const result = { ...settings };

  if (result.profilePicUrl && isDataUrl(result.profilePicUrl)) {
    if (onStatusUpdate) onStatusUpdate('Profile picture uploading to Firebase Storage...');
    try {
      const res = await uploadDataUrlToStorage(result.profilePicUrl, 'settings', `avatar_${Date.now()}.webp`);
      result.profilePicUrl = res.downloadUrl;
    } catch (err: any) {
      console.error('Failed to upload profile picture to storage:', err);
    }
  }

  if (result.bannerUrl && isDataUrl(result.bannerUrl)) {
    if (onStatusUpdate) onStatusUpdate('Banner image uploading to Firebase Storage...');
    try {
      const res = await uploadDataUrlToStorage(result.bannerUrl, 'settings', `banner_${Date.now()}.webp`);
      result.bannerUrl = res.downloadUrl;
    } catch (err: any) {
      console.error('Failed to upload banner to storage:', err);
    }
  }

  return result;
}

/**
 * Gracefully deletes storage media for a deleted item
 */
export async function cleanupMediaItemStorage(item?: MediaItem): Promise<void> {
  if (!item) return;
  const urlsToDelete: string[] = [];

  if (item.mediaUrl && isFirebaseStorageUrl(item.mediaUrl)) {
    urlsToDelete.push(item.mediaUrl);
  }
  if (item.thumbnailUrl && isFirebaseStorageUrl(item.thumbnailUrl) && !urlsToDelete.includes(item.thumbnailUrl)) {
    urlsToDelete.push(item.thumbnailUrl);
  }
  if (item.previewUrl && isFirebaseStorageUrl(item.previewUrl) && !urlsToDelete.includes(item.previewUrl)) {
    urlsToDelete.push(item.previewUrl);
  }
  if (Array.isArray(item.galleryUrls)) {
    for (const gUrl of item.galleryUrls) {
      if (gUrl && isFirebaseStorageUrl(gUrl) && !urlsToDelete.includes(gUrl)) {
        urlsToDelete.push(gUrl);
      }
    }
  }

  for (const u of urlsToDelete) {
    try {
      await deleteStorageFile(u);
    } catch (_) {}
  }
}
