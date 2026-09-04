import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ override: true });

const RETRY_QUEUE_FILE = path.join(process.cwd(), 'data', 'cloudinary_retry_queue.json');

export interface QueuedCloudinaryItem {
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  contentId?: string;
  url?: string;
  queuedAt: string;
  attempts: number;
  lastError?: string;
}

export function loadCloudinaryRetryQueue(): QueuedCloudinaryItem[] {
  try {
    if (!fs.existsSync(RETRY_QUEUE_FILE)) return [];
    const raw = fs.readFileSync(RETRY_QUEUE_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[Cloudinary Server] Error reading retry queue:', err);
    return [];
  }
}

export function saveCloudinaryRetryQueue(queue: QueuedCloudinaryItem[]): void {
  try {
    const dir = path.dirname(RETRY_QUEUE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RETRY_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Cloudinary Server] Error saving retry queue:', err);
  }
}

export function enqueueFailedCloudinaryAsset(item: {
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  contentId?: string;
  url?: string;
  error?: string;
}): void {
  const queue = loadCloudinaryRetryQueue();
  const existingIndex = queue.findIndex(
    q => q.publicId === item.publicId && q.resourceType === item.resourceType
  );

  if (existingIndex >= 0) {
    queue[existingIndex].attempts += 1;
    queue[existingIndex].lastError = item.error || queue[existingIndex].lastError;
  } else {
    queue.push({
      publicId: item.publicId,
      resourceType: item.resourceType,
      contentId: item.contentId,
      url: item.url,
      queuedAt: new Date().toISOString(),
      attempts: 1,
      lastError: item.error
    });
  }
  saveCloudinaryRetryQueue(queue);
  console.log(`[Cloudinary Server] Queued asset for reconciliation retry: "${item.publicId}" (${item.resourceType})`);
}

/**
 * Reconciles and retries all pending Cloudinary deletions.
 * Removes assets that successfully delete or are confirmed not found.
 */
export async function reconcileCloudinaryRetryQueue(): Promise<{
  total: number;
  succeeded: number;
  remaining: number;
  results: DeletionResult[];
}> {
  const queue = loadCloudinaryRetryQueue();
  if (queue.length === 0) {
    return { total: 0, succeeded: 0, remaining: 0, results: [] };
  }

  console.log(`[Cloudinary Reconciler] Starting retry run for ${queue.length} queued assets...`);
  const updatedQueue: QueuedCloudinaryItem[] = [];
  const results: DeletionResult[] = [];
  let succeeded = 0;

  for (const item of queue) {
    try {
      const res = await deleteCloudinaryAsset(item.publicId, item.resourceType);
      results.push(res);
      if (res.status === 'deleted' || res.status === 'not_found') {
        succeeded += 1;
        console.log(`[Cloudinary Reconciler] Successfully purged queued asset "${item.publicId}" (${item.resourceType})`);
      } else {
        // Keep in queue if still failing (up to max 10 attempts)
        if (item.attempts < 10) {
          updatedQueue.push({
            ...item,
            attempts: item.attempts + 1,
            lastError: res.error || 'Retry attempt failed'
          });
        } else {
          console.error(`[Cloudinary Reconciler] Dropping asset "${item.publicId}" after 10 failed attempts.`);
        }
      }
    } catch (err: any) {
      updatedQueue.push({
        ...item,
        attempts: item.attempts + 1,
        lastError: err?.message || String(err)
      });
    }
  }

  saveCloudinaryRetryQueue(updatedQueue);
  return {
    total: queue.length,
    succeeded,
    remaining: updatedQueue.length,
    results
  };
}

function sanitizeEnv(val: string | undefined | null, defaultVal: string, isSecret = false): string {
  if (!val || typeof val !== 'string' || val.trim() === '') {
    return defaultVal.trim();
  }
  const clean = val.trim().replace(/^["']|["']$/g, '').trim();
  // Guard against accidental duplication where API key was pasted into API secret
  if (isSecret && clean === '832665577343529') {
    return defaultVal.trim();
  }
  return clean || defaultVal.trim();
}

// Server-side Cloudinary Configuration (Hidden from client/browser)
const CLOUD_NAME = sanitizeEnv(process.env.CLOUDINARY_CLOUD_NAME, 'mnbjgtqu');
const API_KEY = sanitizeEnv(process.env.CLOUDINARY_API_KEY, '832665577343529');
const API_SECRET = sanitizeEnv(process.env.CLOUDINARY_API_SECRET, 'U47oMg8XzeHEcGpyWOuXYhD41Ik', true);

if (CLOUD_NAME && API_KEY && API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true
  });
  console.log(`[Cloudinary Server] Initialized with Cloud Name: "${CLOUD_NAME}" (Authenticated Destroy API active)`);
} else {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    secure: true
  });
  console.log(`[Cloudinary Server] Initialized in Unsigned/Client mode for Cloud Name: "${CLOUD_NAME}"`);
}

export interface CloudinaryAssetInfo {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  isDerivedTransformation?: boolean;
}

export interface DeletionResult {
  url?: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  status: 'deleted' | 'not_found' | 'skipped' | 'failed';
  result?: string;
  error?: string;
}

/**
 * Extracts publicId and resourceType safely and strictly from a Cloudinary URL.
 * Only accepts URLs that belong to Cloudinary and the expected cloud name.
 */
export function extractCloudinaryAssetInfo(url: string | undefined | null): CloudinaryAssetInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Validate Cloudinary host
  if (!trimmed.includes('cloudinary.com') && !trimmed.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmed.startsWith('//') ? `https:${trimmed}` : trimmed);
    const pathname = parsedUrl.pathname; // e.g. /mnbjgtqu/image/upload/v1725/photos/xyz.jpg

    // Extract resource type (image, video, raw)
    let resourceType: 'image' | 'video' | 'raw' = 'image';
    if (pathname.includes('/video/upload/') || pathname.includes('/video/')) {
      resourceType = 'video';
    } else if (pathname.includes('/raw/upload/') || pathname.includes('/raw/')) {
      resourceType = 'raw';
    } else if (pathname.includes('/image/upload/') || pathname.includes('/image/')) {
      resourceType = 'image';
    }

    // Is this a derived video thumbnail? (e.g. /video/upload/so_0,w_720,c_limit,q_auto,f_jpg/v.../videos/xyz.jpg)
    const isDerivedTransformation = resourceType === 'video' && (pathname.includes('/so_') || pathname.endsWith('.jpg'));

    // Find upload segment
    const uploadIndex = pathname.indexOf('/upload/');
    if (uploadIndex === -1) {
      return null;
    }

    // Everything after /upload/
    let afterUpload = pathname.substring(uploadIndex + '/upload/'.length);

    // Remove any URL transformations before version or folder (e.g. c_limit,w_720,f_jpg/)
    // Transformations don't contain slashes unless separated, but let's check for standard patterns
    const segments = afterUpload.split('/');
    const cleanSegments: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      // Skip transformation strings (e.g., so_0,w_720,c_limit,q_auto,f_jpg or c_fill,w_300)
      if (
        seg.includes(',') ||
        seg.startsWith('w_') ||
        seg.startsWith('h_') ||
        seg.startsWith('c_') ||
        seg.startsWith('q_') ||
        seg.startsWith('so_') ||
        seg.startsWith('f_')
      ) {
        continue;
      }
      // Skip version tag (e.g., v1725345678 or v1)
      if (/^v\d+$/.test(seg)) {
        continue;
      }
      cleanSegments.push(seg);
    }

    if (cleanSegments.length === 0) {
      return null;
    }

    let publicIdWithExt = cleanSegments.join('/');
    // Remove file extension (e.g. .jpg, .png, .mp4, .webp, .webm, etc.)
    const publicId = publicIdWithExt.replace(/\.[a-zA-Z0-9]+$/, '');

    if (!publicId) return null;

    // Safety check: ensure publicId contains expected safe characters
    if (publicId.includes('..') || publicId.startsWith('/') || publicId.includes('\\')) {
      return null;
    }

    return {
      url: trimmed,
      publicId,
      resourceType,
      isDerivedTransformation
    };
  } catch (err) {
    console.warn('[Cloudinary URL Parser Error]', err);
    return null;
  }
}

/**
 * Extracts all unique Cloudinary assets associated with a content / media item.
 */
export function extractAllMediaItemAssets(item: {
  mediaUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  galleryUrls?: string[];
  type?: string;
  cloudinaryPublicId?: string;
  resource_type?: string;
}): CloudinaryAssetInfo[] {
  const assetsMap = new Map<string, CloudinaryAssetInfo>();

  const checkAndAdd = (url?: string, forcedType?: 'image' | 'video') => {
    if (!url) return;
    const info = extractCloudinaryAssetInfo(url);
    if (info) {
      if (forcedType) info.resourceType = forcedType;
      // Key by resourceType:publicId to deduplicate
      const key = `${info.resourceType}:${info.publicId}`;
      if (!assetsMap.has(key)) {
        assetsMap.set(key, info);
      }
    }
  };

  const isVideoItem = item.type === 'video' || item.resource_type === 'video';

  // 1. Explicit cloudinaryPublicId if available
  if (item.cloudinaryPublicId && typeof item.cloudinaryPublicId === 'string' && item.cloudinaryPublicId.trim()) {
    const pubId = item.cloudinaryPublicId.trim();
    const forcedType = isVideoItem ? 'video' : 'image';
    const key = `${forcedType}:${pubId}`;
    if (!assetsMap.has(key)) {
      assetsMap.set(key, {
        url: item.mediaUrl || '',
        publicId: pubId,
        resourceType: forcedType
      });
    }
  }

  // 2. Main media
  checkAndAdd(item.mediaUrl, isVideoItem ? 'video' : 'image');

  // 3. Preview
  checkAndAdd(item.previewUrl, isVideoItem ? 'video' : 'image');

  // 4. Thumbnail (If not a derived transformation of the main video, it's a separate image asset)
  if (item.thumbnailUrl) {
    const thumbInfo = extractCloudinaryAssetInfo(item.thumbnailUrl);
    if (thumbInfo) {
      // If the thumbnail publicId is different from the video publicId, delete it as an image
      const isSameAsVideo = isVideoItem && item.mediaUrl && item.mediaUrl.includes(thumbInfo.publicId);
      if (!isSameAsVideo) {
        checkAndAdd(item.thumbnailUrl, 'image');
      }
    }
  }

  // 5. Gallery multi-photos
  if (Array.isArray(item.galleryUrls)) {
    for (const gUrl of item.galleryUrls) {
      checkAndAdd(gUrl, 'image');
    }
  }

  return Array.from(assetsMap.values());
}

/**
 * Deletes a single Cloudinary asset by public_id and resource_type.
 * Uses authenticated Cloudinary Upload API (uploader.destroy) and Admin API (delete_resources)
 * with multi-type fallback so nothing is missed.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<DeletionResult> {
  const apiKey = sanitizeEnv(process.env.CLOUDINARY_API_KEY, API_KEY);
  const apiSecret = sanitizeEnv(process.env.CLOUDINARY_API_SECRET, API_SECRET, true);
  const cloudName = sanitizeEnv(process.env.CLOUDINARY_CLOUD_NAME, CLOUD_NAME);

  if (!apiKey || !apiSecret) {
    console.warn(
      `[Cloudinary Server] API credentials (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) not set. Skipped remote deletion for "${publicId}" (${resourceType}).`
    );
    return {
      publicId,
      resourceType,
      status: 'skipped',
      result: 'Cloudinary API credentials missing on server. Recorded for cleanup.'
    };
  }

  // Ensure config is fresh and active for this request
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  try {
    console.log(`[Cloudinary Server] Initiating deletion for "${publicId}" (primary type: ${resourceType})...`);

    // 1. Primary fast deletion via uploader.destroy (Upload API)
    let destroyRes = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });

    console.log(`[Cloudinary Server] Primary destroy result for "${publicId}" (${resourceType}):`, destroyRes);

    if (destroyRes.result === 'ok') {
      // Also trigger delete_resources to invalidate derived transformations and caches
      cloudinary.api.delete_resources([publicId], {
        resource_type: resourceType,
        invalidate: true
      }).catch((e) => console.warn('[Cloudinary Server] Secondary cleanup note:', e?.message));

      return {
        publicId,
        resourceType,
        status: 'deleted',
        result: 'ok'
      };
    }

    // 2. If not found, try alternative resource types (e.g. video <-> image <-> raw)
    const alternativeTypes: Array<'image' | 'video' | 'raw'> = [];
    if (resourceType === 'image') {
      alternativeTypes.push('video', 'raw');
    } else if (resourceType === 'video') {
      alternativeTypes.push('image', 'raw');
    } else {
      alternativeTypes.push('image', 'video');
    }

    for (const altType of alternativeTypes) {
      console.log(`[Cloudinary Server] Retrying destroy for "${publicId}" with alternative type: ${altType}...`);
      const altDestroyRes = await cloudinary.uploader.destroy(publicId, {
        resource_type: altType,
        invalidate: true
      });

      if (altDestroyRes.result === 'ok') {
        console.log(`[Cloudinary Server] Successfully deleted "${publicId}" under type: ${altType}`);
        cloudinary.api.delete_resources([publicId], {
          resource_type: altType,
          invalidate: true
        }).catch(() => {});

        return {
          publicId,
          resourceType: altType,
          status: 'deleted',
          result: 'ok'
        };
      }
    }

    // 3. Fallback to delete_resources (Admin API)
    const adminDelRes = await cloudinary.api.delete_resources([publicId], {
      resource_type: resourceType,
      invalidate: true
    }).catch(() => null);

    if (adminDelRes && adminDelRes.deleted && adminDelRes.deleted[publicId] === 'deleted') {
      return {
        publicId,
        resourceType,
        status: 'deleted',
        result: 'ok'
      };
    }

    // If both reported not found
    return {
      publicId,
      resourceType,
      status: 'not_found',
      result: destroyRes.result || 'Asset not found on Cloudinary (may have already been deleted)'
    };
  } catch (err: any) {
    const errorStr = err?.message || (err?.error?.message ? err.error.message : (typeof err === 'object' ? JSON.stringify(err) : String(err)));
    console.error(`[Cloudinary Server] Failed to delete "${publicId}":`, errorStr);
    return {
      publicId,
      resourceType,
      status: 'failed',
      error: errorStr
    };
  }
}

/**
 * Deletes all Cloudinary assets linked to a content item.
 */
export async function deleteItemCloudinaryMedia(item: {
  id?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  galleryUrls?: string[];
  type?: string;
}): Promise<{ allSuccessful: boolean; results: DeletionResult[] }> {
  const assets = extractAllMediaItemAssets(item);
  console.log(`[Cloudinary Server] Extracted ${assets.length} linked assets to delete:`, assets.map(a => `${a.resourceType}:${a.publicId}`));

  const results: DeletionResult[] = [];
  let allSuccessful = true;

  for (const asset of assets) {
    const res = await deleteCloudinaryAsset(asset.publicId, asset.resourceType);
    results.push({ ...res, url: asset.url });
    if (res.status === 'failed') {
      allSuccessful = false;
      enqueueFailedCloudinaryAsset({
        publicId: asset.publicId,
        resourceType: asset.resourceType,
        contentId: item.id,
        url: asset.url,
        error: res.error
      });
    }
  }

  return {
    allSuccessful,
    results
  };
}
