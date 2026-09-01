import { storage } from './firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  StorageReference
} from 'firebase/storage';
import { MediaItem, SiteSettings } from '../types';

export type StorageFolder = 'photos' | 'videos' | 'thumbnails' | 'documents' | 'settings' | 'general';

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
  bytesTransferred: number;
  totalBytes: number;
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
 * Uploads a native File or Blob directly to Firebase Storage with real-time progress callbacks
 */
export function uploadFileToStorage(
  fileOrBlob: File | Blob,
  folder: StorageFolder = 'photos',
  customFilename?: string,
  onProgress?: (progressPercent: number, statusText: string) => void
): Promise<StorageUploadResult> {
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
      const metadata = {
        contentType: mimeType,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          appSource: 'ruma_creator_app'
        }
      };

      const uploadTask = uploadBytesResumable(storageRef, fileOrBlob, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = snapshot.totalBytes > 0
            ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            : 0;
          if (onProgress) {
            onProgress(progress, `Uploading to Firebase Storage (${progress}%)...`);
          }
        },
        (error) => {
          console.error('[Firebase Storage Upload Error]', error);
          reject(new Error(`Storage Upload Failed: ${error.message || 'Network error'}`));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[Firebase Storage] Upload complete, permanent URL:', downloadUrl);
            resolve({
              downloadUrl,
              storagePath,
              bytesTransferred: uploadTask.snapshot.bytesTransferred,
              totalBytes: uploadTask.snapshot.totalBytes
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
 * Uploads a Data URL (e.g. from canvas or file reader) to Firebase Storage
 */
export async function uploadDataUrlToStorage(
  dataUrl: string,
  folder: StorageFolder = 'photos',
  customFilename?: string,
  onProgress?: (progressPercent: number, statusText: string) => void
): Promise<StorageUploadResult> {
  // If already an HTTP/HTTPS URL, return as-is
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
    console.log('[Firebase Storage] Deleted file:', urlOrPath);
    return true;
  } catch (err: any) {
    console.warn('[Firebase Storage Delete Non-fatal]', err.message);
    return false;
  }
}

/**
 * Ensures all media fields in a MediaItem (mediaUrl, thumbnailUrl, previewUrl, galleryUrls)
 * are stored as permanent Firebase Storage HTTPS URLs and not bloated Base64 strings.
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

  // 4. Process multi-photo galleryUrls
  if (Array.isArray(result.galleryUrls) && result.galleryUrls.length > 0) {
    const updatedGallery: string[] = [];
    for (let i = 0; i < result.galleryUrls.length; i++) {
      const photo = result.galleryUrls[i];
      if (isDataUrl(photo)) {
        if (onStatusUpdate) {
          onStatusUpdate(`Uploading gallery photo ${i + 1}/${result.galleryUrls.length} to Firebase Storage...`);
        }
        try {
          const uploadRes = await uploadDataUrlToStorage(photo, 'photos');
          updatedGallery.push(uploadRes.downloadUrl);
        } catch (err: any) {
          console.error(`Failed to upload gallery item ${i}:`, err);
          throw new Error(`Gallery photo upload failed: ${err.message}`);
        }
      } else {
        updatedGallery.push(photo);
      }
    }
    result.galleryUrls = updatedGallery;
    if (updatedGallery.length > 0) {
      if (!result.mediaUrl || isDataUrl(result.mediaUrl)) {
        result.mediaUrl = updatedGallery[0];
      }
      if (!result.thumbnailUrl || isDataUrl(result.thumbnailUrl)) {
        result.thumbnailUrl = updatedGallery[0];
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
