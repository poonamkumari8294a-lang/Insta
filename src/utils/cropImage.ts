export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates an HTMLImageElement safely handling Data URLs, Blob URLs, and CORS
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => {
      // If failed with crossOrigin, try loading without crossOrigin
      if (image.getAttribute('crossOrigin') === 'anonymous') {
        const fallbackImage = new Image();
        fallbackImage.onload = () => resolve(fallbackImage);
        fallbackImage.onerror = (err) => reject(err);
        fallbackImage.src = url;
        return;
      }
      reject(error);
    };

    // Only set crossOrigin for remote http(s) URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Crops an image based on cropped area pixel coordinates, rotation, and flip.
 * Uses high-performance scaling & optimal JPEG compression (fast & lightweight).
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  maxOutputWidth = 900,
  maxOutputHeight = 900,
  quality = 0.76
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('No 2d context available');
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location on image to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(
    -(image.naturalWidth || image.width) / 2,
    -(image.naturalHeight || image.height) / 2
  );

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image onto a new clean canvas
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d', { willReadFrequently: true });

  if (!croppedCtx) {
    throw new Error('No 2d context available for crop');
  }

  let targetWidth = Math.max(1, Math.round(pixelCrop.width));
  let targetHeight = Math.max(1, Math.round(pixelCrop.height));

  // Scale down if larger than max output dimension to keep payload ultra fast (< 80KB)
  if (targetWidth > maxOutputWidth || targetHeight > maxOutputHeight) {
    const scale = Math.min(
      maxOutputWidth / targetWidth,
      maxOutputHeight / targetHeight
    );
    targetWidth = Math.max(1, Math.round(targetWidth * scale));
    targetHeight = Math.max(1, Math.round(targetHeight * scale));
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = targetWidth;
  croppedCanvas.height = targetHeight;

  // Enable high-quality image smoothing
  croppedCtx.imageSmoothingEnabled = true;
  croppedCtx.imageSmoothingQuality = 'high';

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Return as fast, compact WebP / JPEG Data URL
  try {
    const webpUrl = croppedCanvas.toDataURL('image/webp', quality);
    if (webpUrl.startsWith('data:image/webp')) {
      return webpUrl;
    }
  } catch (_) {}
  return croppedCanvas.toDataURL('image/jpeg', quality);
}

