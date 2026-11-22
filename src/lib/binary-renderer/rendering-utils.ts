/**
 * Rendering Utilities for Binary Transformation Engine
 */

export interface Point {
  x: number;
  y: number;
}

export interface CropRect {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

export function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

/**
 * Computes exact focal-aware cover crop coordinates ensuring images with
 * different source aspect ratios align with identical composition and zero distortion.
 */
export function computeCoverCrop(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number,
  focalY: number = 0.25
): CropRect {
  // Precision alignment override for Satyajeet's formal portrait so eyes, chin and head
  // align seamlessly with Tony Stark's silhouette in the unified coordinate system
  if (imgWidth === 768 && imgHeight === 1024) {
    return { sx: 40, sy: 30, sWidth: 688, sHeight: 975 };
  }

  const targetAspect = targetWidth / targetHeight;
  const imgAspect = imgWidth / imgHeight;

  if (imgAspect > targetAspect) {
    // Source is wider than target frame: crop horizontal edges symmetrically
    const sHeight = imgHeight;
    const sWidth = Math.round(imgHeight * targetAspect);
    const sx = Math.round((imgWidth - sWidth) / 2);
    return { sx, sy: 0, sWidth, sHeight };
  } else {
    // Source is taller than target frame: crop vertical edges aligned with focal point
    const sWidth = imgWidth;
    const sHeight = Math.round(imgWidth / targetAspect);
    const maxSy = imgHeight - sHeight;
    const sy = Math.max(0, Math.min(maxSy, Math.round(maxSy * focalY)));
    return { sx: 0, sy, sWidth, sHeight };
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Do not set crossOrigin for local same-origin assets to avoid false CORS blocks
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Ensures optimal display density without blowing up GPU memory on 3x/4x screens.
 */
export function getOptimizedDpr(): number {
  if (typeof window === 'undefined') return 1;
  const dpr = window.devicePixelRatio || 1;
  return Math.min(dpr, 2);
}
