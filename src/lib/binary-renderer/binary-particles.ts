/**
 * Binary Particle Engine
 *
 * Handles particle dynamics, glyph shuffling, mask-based dissolution,
 * and high-performance canvas batch drawing.
 */

import { SampledGrid } from './image-sampler';
import { smoothstep } from './rendering-utils';

export interface BinaryRenderOptions {
  cursorX: number;
  cursorY: number;
  cursorActive: boolean;
  maskRadius: number;
  maskFeather: number;
  scrollProgress: number; // 0.0 = Tony Stark, 0.5 = full binary, 1.0 = Satyajeet
  time: number;
  particleSize: number;
  accentGold: string;
}

export function drawBinaryTransformation(
  ctx: CanvasRenderingContext2D,
  topImage: HTMLImageElement,
  bottomImage: HTMLImageElement,
  sampledGrid: SampledGrid,
  options: BinaryRenderOptions,
  canvasWidth: number,
  canvasHeight: number
) {
  const {
    cursorX,
    cursorY,
    cursorActive,
    maskRadius,
    maskFeather,
    scrollProgress,
    time,
    particleSize,
  } = options;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw base layer (Satyajeet Behera)
  // Visible wherever mask or scroll progress reveals it
  ctx.save();
  ctx.drawImage(bottomImage, 0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // 2. Determine top layer (Tony Stark) visibility
  // If scrollProgress >= 0.95, Tony Stark is completely dissolved
  if (scrollProgress < 0.98) {
    ctx.save();

    // Use an offscreen composition or composite operation to punch the reveal hole
    // We render Tony Stark onto an in-memory/isolated layer
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // Draw intact Tony Stark
      tempCtx.drawImage(topImage, 0, 0, canvasWidth, canvasHeight);

      // Apply mask: punch out where cursor is or where scroll dissolves it
      tempCtx.globalCompositeOperation = 'destination-out';

      // Cursor localized mask hole
      if (cursorActive && scrollProgress < 0.15) {
        const gradient = tempCtx.createRadialGradient(
          cursorX,
          cursorY,
          Math.max(0, maskRadius - maskFeather),
          cursorX,
          cursorY,
          maskRadius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        tempCtx.fillStyle = gradient;
        tempCtx.beginPath();
        tempCtx.arc(cursorX, cursorY, maskRadius, 0, Math.PI * 2);
        tempCtx.fill();
      }

      // Scroll-based global dissolution
      if (scrollProgress >= 0.15) {
        // Map 0.15 -> 0.70 to global fade out of Tony Stark image
        const globalDissolve = smoothstep(0.15, 0.7, scrollProgress);
        tempCtx.fillStyle = `rgba(0, 0, 0, ${globalDissolve})`;
        tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Composite the masked Tony Stark layer back onto the canvas
      ctx.drawImage(tempCanvas, 0, 0);
    }

    ctx.restore();
  }

  // 3. Render Binary Glyph Transition Layer
  // Active in localized cursor zone or globally during scroll
  const isScrollTransform = scrollProgress > 0.05 && scrollProgress < 0.95;
  const isCursorActive = cursorActive && scrollProgress <= 0.15;

  if (isCursorActive || isScrollTransform) {
    ctx.save();
    ctx.font = `600 ${particleSize}px ui-monospace, "SF Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const samples = sampledGrid.samples;
    const count = samples.length;

    for (let i = 0; i < count; i++) {
      const s = samples[i];

      let intensity = 0;

      // Case A: Localized cursor influence
      if (isCursorActive) {
        const dx = s.x - cursorX;
        const dy = s.y - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maskRadius) {
          // Peak intensity at boundary of mask where transformation is hottest
          const edgeDist = Math.abs(dist - (maskRadius - maskFeather / 2));
          const edgeIntensity = 1 - smoothstep(0, maskFeather, edgeDist);
          const coreIntensity = (1 - smoothstep(0, maskRadius, dist)) * 0.45;
          intensity = Math.max(edgeIntensity, coreIntensity);
        }
      }

      // Case B: Scroll transformation influence
      if (isScrollTransform) {
        // Staged progression based on vertical position and noise offset
        const normalizedY = s.y / canvasHeight;
        const fadeThreshold = smoothstep(0.55, 0.9, scrollProgress);

        // Individual particle activation with subtle offset
        const particleTrigger = Math.sin(s.offset + time * 3) * 0.1 + normalizedY * 0.35 + 0.3;

        if (scrollProgress >= 0.15 && scrollProgress < 0.55) {
          intensity = smoothstep(0.15, 0.55, scrollProgress) * (1 - particleTrigger * 0.4);
        } else if (scrollProgress >= 0.55) {
          intensity = 1 - fadeThreshold;
        }
      }

      if (intensity > 0.08) {
        // High-tech character shuffle
        if (Math.random() < 0.08) {
          s.char = Math.random() > 0.5 ? '1' : '0';
        }

        // Slight digital jitter
        const jitterX = Math.sin(time * 5 + s.offset) * (intensity * 3);
        const jitterY = Math.cos(time * 5 + s.offset) * (intensity * 3);

        // Color coding: Gold metallic highlights + high-contrast silver
        const alpha = Math.min(1, intensity * (s.alpha * 1.2));
        if (s.luminance > 0.6) {
          ctx.fillStyle = `rgba(223, 186, 117, ${alpha})`; // Gold highlight
        } else if (s.luminance > 0.3) {
          ctx.fillStyle = `rgba(245, 245, 247, ${alpha * 0.9})`; // Crisp off-white
        } else {
          ctx.fillStyle = `rgba(157, 157, 166, ${alpha * 0.7})`; // Metallic silver
        }

        ctx.fillText(s.char, s.x + jitterX, s.y + jitterY);
      }
    }

    ctx.restore();
  }
}
