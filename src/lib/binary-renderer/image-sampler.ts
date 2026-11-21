/**
 * Image Sampler
 *
 * Precomputes grid-based luminance, alpha, and color samples on offscreen canvases
 * to ensure 60fps rendering without continuous getImageData calls.
 */

export interface ImageSample {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  luminance: number;
  char: '0' | '1';
  offset: number;
}

export interface SampledGrid {
  samples: ImageSample[];
  gridCols: number;
  gridRows: number;
  cellWidth: number;
  cellHeight: number;
  width: number;
  height: number;
}

export function sampleImageToGrid(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  stepSize: number = 8
): SampledGrid {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return {
      samples: [],
      gridCols: 0,
      gridRows: 0,
      cellWidth: stepSize,
      cellHeight: stepSize,
      width: targetWidth,
      height: targetHeight,
    };
  }

  // Draw image scaled to target dimensions
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;

  const samples: ImageSample[] = [];
  const gridCols = Math.floor(targetWidth / stepSize);
  const gridRows = Math.floor(targetHeight / stepSize);

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const px = Math.floor(col * stepSize + stepSize / 2);
      const py = Math.floor(row * stepSize + stepSize / 2);

      const idx = (py * targetWidth + px) * 4;
      const r = imgData[idx] || 0;
      const g = imgData[idx + 1] || 0;
      const b = imgData[idx + 2] || 0;
      const a = (imgData[idx + 3] || 0) / 255;

      // Only store samples that contain actual subject pixels
      if (a > 0.02) {
        // Rec. 709 relative luminance
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        samples.push({
          x: px,
          y: py,
          r,
          g,
          b,
          alpha: a,
          luminance,
          char: Math.random() > 0.5 ? '1' : '0',
          offset: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  return {
    samples,
    gridCols,
    gridRows,
    cellWidth: stepSize,
    cellHeight: stepSize,
    width: targetWidth,
    height: targetHeight,
  };
}
