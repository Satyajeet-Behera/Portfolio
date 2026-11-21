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
  scrollProgress: number; // 0.0 = Tony Stark, 0.5 = active deconstruction wave, 1.0 = Satyajeet Behera
  time: number;
  particleSize: number;
  accentGold: string;
  tempCanvas?: HTMLCanvasElement;
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
    tempCanvas: providedTempCanvas,
  } = options;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw base layer (Satyajeet Behera in suit)
  // Revealed wherever the deconstruction wave or cursor mask removes Tony Stark
  ctx.save();
  ctx.drawImage(bottomImage, 0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // 2. Compute Wave Front Position across vertical axis
  // Maps 0.0 -> 1.0 into an organic sweeping wave starting from top (-50px) to bottom (height + 60px)
  const waveFront = scrollProgress * (canvasHeight + 140) - 70;

  // 3. Render Top Layer (Tony Stark) with Dynamic Masking
  if (scrollProgress < 0.99) {
    ctx.save();

    // Use a persistent or dedicated offscreen canvas to avoid per-frame allocations
    const tempCanvas = providedTempCanvas || document.createElement('canvas');
    if (tempCanvas.width !== canvasWidth || tempCanvas.height !== canvasHeight) {
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
    }
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw intact Tony Stark cutout
      tempCtx.drawImage(topImage, 0, 0, canvasWidth, canvasHeight);

      // Punch out dissolved areas using destination-out
      tempCtx.globalCompositeOperation = 'destination-out';

      // (A) Scroll-driven sweeping wave dissolution
      if (scrollProgress > 0.01) {
        tempCtx.beginPath();
        tempCtx.moveTo(0, 0);
        tempCtx.lineTo(canvasWidth, 0);

        // Sine-perturbed organic wave edge
        const step = 15;
        for (let x = canvasWidth; x >= 0; x -= step) {
          const wavePerturb = Math.sin(x * 0.02 + time * 3.5) * 18 + Math.cos(x * 0.01 + time * 2) * 8;
          const currentY = Math.min(canvasHeight + 20, waveFront + wavePerturb);
          tempCtx.lineTo(x, currentY);
        }

        tempCtx.closePath();
        tempCtx.fillStyle = 'rgba(0, 0, 0, 1)';
        tempCtx.fill();

        // Soft edge feathering along the wave front (30px gradient)
        const featherHeight = 36;
        const gradY1 = Math.max(0, waveFront - 10);
        const gradY2 = Math.min(canvasHeight, waveFront + featherHeight);
        if (gradY2 > gradY1) {
          const waveGrad = tempCtx.createLinearGradient(0, gradY1, 0, gradY2);
          waveGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
          waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          tempCtx.fillStyle = waveGrad;
          tempCtx.fillRect(0, gradY1, canvasWidth, gradY2 - gradY1);
        }
      }

      // (B) Localized cursor/touch circular mask hole
      if (cursorActive && maskRadius > 1) {
        const radGrad = tempCtx.createRadialGradient(
          cursorX,
          cursorY,
          Math.max(0, maskRadius - maskFeather),
          cursorX,
          cursorY,
          maskRadius
        );
        radGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        tempCtx.fillStyle = radGrad;
        tempCtx.beginPath();
        tempCtx.arc(cursorX, cursorY, maskRadius, 0, Math.PI * 2);
        tempCtx.fill();
      }

      // Reset composite operation and paint masked Tony Stark onto main canvas
      tempCtx.globalCompositeOperation = 'source-over';
      ctx.drawImage(tempCanvas, 0, 0);
    }

    ctx.restore();
  }

  // 4. Render High-Tech Binary Glyph Transition Layer
  // Renders dynamic, shimmering '0' and '1' particles actively at the wave front & cursor rim
  ctx.save();
  ctx.font = `600 ${particleSize}px ui-monospace, "SF Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const samples = sampledGrid.samples;
  const count = samples.length;

  for (let i = 0; i < count; i++) {
    const s = samples[i];

    let intensity = 0;

    // Influence 1: Scroll Transformation Wave
    if (scrollProgress > 0.005 && scrollProgress < 0.99) {
      const wavePerturb = Math.sin(s.x * 0.02 + time * 3.5) * 18 + Math.cos(s.x * 0.01 + time * 2) * 8;
      const targetWaveY = waveFront + wavePerturb;
      const distToWave = s.y - targetWaveY;

      // Active zone: from -65px (just passed, dissolving into embers) to +45px (approaching wave)
      if (distToWave >= -65 && distToWave <= 45) {
        const normDist = Math.abs(distToWave) / 55;
        intensity = Math.max(intensity, (1 - normDist) * 1.35);
      } else if (distToWave < -65 && distToWave > -130 && Math.random() < 0.25) {
        // Floating trailing digital embers drifting upward
        intensity = Math.max(intensity, 0.4 * (1 - (Math.abs(distToWave) - 65) / 65));
      }
    }

    // Influence 2: Localized Cursor Mask Rim
    if (cursorActive && maskRadius > 5) {
      const dx = s.x - cursorX;
      const dy = s.y - cursorY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maskRadius + 15) {
        const edgeDist = Math.abs(dist - (maskRadius - maskFeather / 2));
        const edgeIntensity = 1 - smoothstep(0, maskFeather, edgeDist);
        const coreIntensity = (1 - smoothstep(0, maskRadius, dist)) * 0.35;
        intensity = Math.max(intensity, Math.max(edgeIntensity, coreIntensity));
      }
    }

    if (intensity > 0.08) {
      // Periodic character shuffle
      if (Math.random() < 0.09) {
        s.char = Math.random() > 0.5 ? '1' : '0';
      }

      // Subtle dynamic particle scatter
      const jitterX = Math.sin(time * 6 + s.offset) * (intensity * 2.8);
      const jitterY = Math.cos(time * 6 + s.offset) * (intensity * 2.8) - (scrollProgress > 0.05 ? intensity * 3.5 : 0);

      // Color coding: Golden highlights + pristine silver / white
      const alpha = Math.min(1, intensity * (s.alpha * 1.35));
      if (s.luminance > 0.55) {
        ctx.fillStyle = `rgba(223, 186, 117, ${alpha})`; // Warm Arc Gold
      } else if (s.luminance > 0.25) {
        ctx.fillStyle = `rgba(245, 245, 247, ${alpha * 0.95})`; // Crisp Off-White
      } else {
        ctx.fillStyle = `rgba(165, 165, 175, ${alpha * 0.75})`; // Metallic Silver
      }

      ctx.fillText(s.char, s.x + jitterX, s.y + jitterY);
    }
  }

  ctx.restore();
}
