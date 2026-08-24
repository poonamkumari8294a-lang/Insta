/**
 * Extreme Mobile-First Image Optimization Helper
 * 
 * Automatically transforms high-resolution images (2000px-3000px) into
 * lightweight, mobile-optimized WebP/AVIF thumbnails (300px-600px) based on device screen.
 */

/**
 * Transforms image URLs to requested mobile dimensions and WebP/AVIF format
 * Defaults to 480px width for crisp mobile card display with tiny payload (<35KB).
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  width = 480,
  quality = 75
): string {
  if (!url) return '';

  // Base64 Data URLs and local blobs cannot be CDN-transformed
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // 1. Unsplash Dynamic CDN URL Optimization (WebP + Exact Width + High Compression, preserving original aspect ratio)
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('fit', 'max');
      return urlObj.toString();
    } catch {
      const cleanUrl = url.split('?')[0];
      return `${cleanUrl}?w=${width}&q=${quality}&auto=format&fm=webp&fit=max`;
    }
  }

  // 2. Cloudinary Dynamic CDN (c_limit preserves aspect ratio without cropping)
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto,c_limit/`);
  }

  // 3. Imgix / Fastly CDNs
  if (url.includes('imgix.net')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      urlObj.searchParams.set('auto', 'format,compress');
      urlObj.searchParams.set('fit', 'max');
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  // 4. Firebase Storage / Google User Content (w=width, preserve aspect ratio without -c crop)
  if (url.includes('googleusercontent.com')) {
    return `${url.split('=')[0]}=w${width}-rw`;
  }

  return url;
}

/**
 * Generates a responsive srcset attribute string for mobile devices (320px to 640px)
 */
export function getResponsiveSrcSet(url: string | undefined | null): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return '';
  }

  if (url.includes('images.unsplash.com')) {
    const w320 = getOptimizedImageUrl(url, 320, 70);
    const w480 = getOptimizedImageUrl(url, 480, 75);
    const w640 = getOptimizedImageUrl(url, 640, 75);

    return `${w320} 320w, ${w480} 480w, ${w640} 640w`;
  }

  return '';
}

/**
 * Generates a lightweight micro-thumbnail (30px blur preview, ~500 bytes)
 */
export function getMicroBlurUrl(url: string | undefined | null): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return '';
  }

  if (url.includes('images.unsplash.com')) {
    return getOptimizedImageUrl(url, 30, 20);
  }

  return url;
}
