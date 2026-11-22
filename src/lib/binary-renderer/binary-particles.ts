/**
 * Binary Particle Engine — Phase 5 Master Implementation
 *
 * Implements:
 * 1. Unified focal-aware cover crop coordinate alignment (shared coordinate system).
 * 2. Localized cursor disintegration with smooth entry/reconstruction.
 * 3. 5-State continuous and completely reversible scroll-driven transformation:
 *    - State 1 (0.00 - 0.10): Complete Tony Stark photograph intact on obsidian stage. (Cursor hover active)
 *    - State 2 (0.10 - 0.60): Progressive digital dissolution wave converting Tony Stark into luminous binary code,
 *                           with Satyajeet Behera's portrait emerging synchronously in the dissolved wake.
 *    - State 3 (0.60 - 0.75): Complete Radiant Binary Matrix — full silhouette and facial contours in glowing code over Satyajeet.
 *    - State 4 (0.75 - 0.92): Personal Image Reveal — binary matrix disperses outward into embers as Satyajeet emerges crisp.
 *    - State 5 (0.92 - 1.00): Complete Satyajeet Behera photograph in crisp, pristine fidelity.
 *
 * Fully Reversible: Scrolling backwards from 1.0 down to 0.0 seamlessly reconstructs Tony Stark back to 100% original.
 */

import { SampledGrid } from './image-sampler';
import { smoothstep, computeCoverCrop } from './rendering-utils';

export interface BinaryRenderOptions {
  cursorX: number;
  cursorY: number;
  cursorActive: boolean;
  maskRadius: number;
  maskFeather: number;
  scrollProgress: number; // 0.0 = Tony Stark, 0.60 = Complete Binary Matrix, 1.0 = Satyajeet Behera
  time: number;
  particleSize: number;
  accentGold: string;
  tempCanvas?: HTMLCanvasElement;
  tempCanvas2?: HTMLCanvasElement;
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
    tempCanvas2: providedTempCanvas2,
  } = options;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Unified shared coordinate system: compute focal cover crops for both portrait layers
  const cropBottom = computeCoverCrop(
    bottomImage.naturalWidth || bottomImage.width,
    bottomImage.naturalHeight || bottomImage.height,
    canvasWidth,
    canvasHeight,
    0.22
  );

  const cropTop = computeCoverCrop(
    topImage.naturalWidth || topImage.width,
    topImage.naturalHeight || topImage.height,
    canvasWidth,
    canvasHeight,
    0.25
  );

  // Allocate / reuse persistent offscreen canvas buffers for multi-pass compositing
  const bufTop = providedTempCanvas || document.createElement('canvas');
  if (bufTop.width !== canvasWidth || bufTop.height !== canvasHeight) {
    bufTop.width = canvasWidth;
    bufTop.height = canvasHeight;
  }
  const ctxTop = bufTop.getContext('2d');
  if (!ctxTop) return;

  const bufSatya = providedTempCanvas2 || document.createElement('canvas');
  if (bufSatya.width !== canvasWidth || bufSatya.height !== canvasHeight) {
    bufSatya.width = canvasWidth;
    bufSatya.height = canvasHeight;
  }
  const ctxSatya = bufSatya.getContext('2d');
  if (!ctxSatya) return;

  // ---------------------------------------------------------------------------
  // PASS 1: Base Layer (Satyajeet Behera)
  // Revealed either by:
  // (A) Localized cursor hover: circular feathered hole around (cursorX, cursorY)
  // (B) Scroll dissolution wave: revealed from top-down above the wave front
  // (C) Full frame at high scroll progress (scrollProgress >= 0.88)
  // ---------------------------------------------------------------------------
  if (scrollProgress >= 0.90) {
    // State 5: Full Satyajeet in pristine clarity
    ctx.drawImage(
      bottomImage,
      cropBottom.sx,
      cropBottom.sy,
      cropBottom.sWidth,
      cropBottom.sHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );
  } else {
    ctxSatya.clearRect(0, 0, canvasWidth, canvasHeight);
    let hasSatyaReveal = false;

    // 1. Localized cursor hole with smooth radial feathering
    if (cursorActive && maskRadius > 2) {
      const radGrad = ctxSatya.createRadialGradient(
        cursorX,
        cursorY,
        Math.max(0, maskRadius - maskFeather),
        cursorX,
        cursorY,
        maskRadius
      );
      radGrad.addColorStop(0, 'rgba(0,0,0,1)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctxSatya.fillStyle = radGrad;
      ctxSatya.beginPath();
      ctxSatya.arc(cursorX, cursorY, maskRadius, 0, Math.PI * 2);
      ctxSatya.fill();
      hasSatyaReveal = true;
    }

    // 2. Scroll wave reveal (reveals Satyajeet above the wave front)
    if (scrollProgress > 0.10) {
      const waveNorm = Math.min(1, (scrollProgress - 0.10) / 0.50);
      const waveFront = waveNorm * (canvasHeight + 100) - 50;

      ctxSatya.beginPath();
      ctxSatya.moveTo(0, 0);
      ctxSatya.lineTo(canvasWidth, 0);

      const step = 10;
      for (let x = canvasWidth; x >= 0; x -= step) {
        const wavePerturb =
          Math.sin(x * 0.024 + time * 3.5) * 14 + Math.cos(x * 0.012 + time * 2) * 8;
        const currentY = Math.min(canvasHeight + 30, waveFront + wavePerturb);
        ctxSatya.lineTo(x, currentY);
      }

      ctxSatya.closePath();
      ctxSatya.fillStyle = 'rgba(0,0,0,1)';
      ctxSatya.fill();
      hasSatyaReveal = true;

      // Expand to full-canvas visibility as scroll progresses past 0.55
      if (scrollProgress > 0.55) {
        const fullAlpha = smoothstep(0.55, 0.85, scrollProgress);
        ctxSatya.fillStyle = `rgba(0, 0, 0, ${fullAlpha})`;
        ctxSatya.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }

    if (hasSatyaReveal) {
      ctxSatya.globalCompositeOperation = 'source-in';
      ctxSatya.drawImage(
        bottomImage,
        cropBottom.sx,
        cropBottom.sy,
        cropBottom.sWidth,
        cropBottom.sHeight,
        0,
        0,
        canvasWidth,
        canvasHeight
      );
      ctxSatya.globalCompositeOperation = 'source-over';

      ctx.drawImage(bufSatya, 0, 0);
    }
  }

  // ---------------------------------------------------------------------------
  // PASS 2: Top Layer (Tony Stark Cutout)
  // Intact in State 1 (scrollProgress <= 0.10).
  // Dissolves downward into binary code in State 2 (0.10 < scrollProgress < 0.60).
  // Dissolved completely in States 3-5 (scrollProgress >= 0.65).
  // ---------------------------------------------------------------------------
  if (scrollProgress < 0.65) {
    ctxTop.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw intact Tony Stark cutout
    ctxTop.drawImage(
      topImage,
      cropTop.sx,
      cropTop.sy,
      cropTop.sWidth,
      cropTop.sHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    ctxTop.globalCompositeOperation = 'destination-out';

    // (A) Localized cursor mask hole with smooth radial feathering
    if (cursorActive && maskRadius > 1) {
      const radGrad = ctxTop.createRadialGradient(
        cursorX,
        cursorY,
        Math.max(0, maskRadius - maskFeather),
        cursorX,
        cursorY,
        maskRadius
      );
      radGrad.addColorStop(0, 'rgba(0,0,0,1)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctxTop.fillStyle = radGrad;
      ctxTop.beginPath();
      ctxTop.arc(cursorX, cursorY, maskRadius, 0, Math.PI * 2);
      ctxTop.fill();
    }

    // (B) Scroll digital dissolution wave (State 2: 0.10 to 0.60)
    if (scrollProgress > 0.10) {
      const waveNorm = Math.min(1, (scrollProgress - 0.10) / 0.50);
      const waveFront = waveNorm * (canvasHeight + 100) - 50;

      ctxTop.beginPath();
      ctxTop.moveTo(0, 0);
      ctxTop.lineTo(canvasWidth, 0);

      const step = 10;
      for (let x = canvasWidth; x >= 0; x -= step) {
        const wavePerturb =
          Math.sin(x * 0.024 + time * 3.5) * 14 + Math.cos(x * 0.012 + time * 2) * 8;
        const currentY = Math.min(canvasHeight + 30, waveFront + wavePerturb);
        ctxTop.lineTo(x, currentY);
      }

      ctxTop.closePath();
      ctxTop.fillStyle = 'rgba(0,0,0,1)';
      ctxTop.fill();

      // Soft edge feather along wave front
      const featherHeight = 24;
      const gradY1 = Math.max(0, waveFront - 8);
      const gradY2 = Math.min(canvasHeight, waveFront + featherHeight);
      if (gradY2 > gradY1) {
        const waveGrad = ctxTop.createLinearGradient(0, gradY1, 0, gradY2);
        waveGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
        waveGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctxTop.fillStyle = waveGrad;
        ctxTop.fillRect(0, gradY1, canvasWidth, gradY2 - gradY1);
      }
    }

    ctxTop.globalCompositeOperation = 'source-over';

    // Fade top image gently as wave completes around 0.50 - 0.65
    const tonyFade = 1 - smoothstep(0.50, 0.65, scrollProgress);
    if (tonyFade < 0.999) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, tonyFade);
      ctx.drawImage(bufTop, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(bufTop, 0, 0);
    }
  }

  // ---------------------------------------------------------------------------
  // PASS 3: High-Tech Binary Glyph System (0 & 1 Particles)
  // State 1: Localized disintegration around cursor rim
  // State 2: Progressive dissolution wave converting Tony Stark into luminous binary code!
  // State 3: Complete Radiant Binary Matrix — entire silhouette shines in code!
  // State 4: Dispersal into floating embers as Satyajeet emerges
  // State 5: Quiescent (0 particles)
  // ---------------------------------------------------------------------------
  if (scrollProgress < 0.94 || (cursorActive && maskRadius > 1)) {
    ctx.save();
    ctx.font = `700 ${particleSize}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const samples = sampledGrid.samples;
    const count = samples.length;

    const inState2 = scrollProgress >= 0.10 && scrollProgress < 0.60;
    const inState3 = scrollProgress >= 0.60 && scrollProgress < 0.75;
    const inState4 = scrollProgress >= 0.75 && scrollProgress < 0.92;

    const waveNorm = inState2 ? (scrollProgress - 0.10) / 0.50 : 0;
    const waveFront = inState2 ? waveNorm * (canvasHeight + 100) - 50 : 0;
    const state4Progress = inState4 ? (scrollProgress - 0.75) / 0.17 : 0;

    for (let i = 0; i < count; i++) {
      const s = samples[i];
      let intensity = 0;
      let offsetX = 0;
      let offsetY = 0;

      // 1. CURSOR INFLUENCE (Localized Disintegration at boundary rim)
      if (cursorActive && maskRadius > 3 && scrollProgress < 0.35) {
        const dx = s.x - cursorX;
        const dy = s.y - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const rimCenter = maskRadius - maskFeather * 0.35;
        const rimDist = Math.abs(dist - rimCenter);
        const rimBandWidth = 28;

        if (rimDist < rimBandWidth) {
          const rimFactor = 1 - rimDist / rimBandWidth;
          const rimIntensity = Math.pow(rimFactor, 1.2) * 1.35;
          if (rimIntensity > intensity) {
            intensity = rimIntensity;
            const pushAngle = Math.atan2(dy, dx);
            const drift = Math.sin(time * 6 + s.offset) * 2;
            offsetX = Math.cos(pushAngle) * 3.5 + drift;
            offsetY = Math.sin(pushAngle) * 3.5 + drift;
          }
        }
      }

      // 2. SCROLL STATE 2: Progressive Dissolution Wave into Binary Code
      // As the wave sweeps down, every pixel above the wave converts into radiant binary digits!
      if (inState2) {
        const wavePerturb =
          Math.sin(s.x * 0.024 + time * 3.5) * 14 + Math.cos(s.x * 0.012 + time * 2) * 8;
        const targetWaveY = waveFront + wavePerturb;

        // Dissolved region above the wave
        if (s.y <= targetWaveY) {
          const distAboveWave = targetWaveY - s.y;
          const energeticBand = Math.max(0, 1 - distAboveWave / 140);
          const waveIntensity = s.alpha * (0.95 + energeticBand * 0.40);
          if (waveIntensity > intensity) {
            intensity = waveIntensity;
            offsetX = Math.sin(time * 5 + s.offset) * (1.2 + energeticBand * 2.0);
            offsetY = Math.cos(time * 5 + s.offset) * (1.2 + energeticBand * 2.0);
          }
        }
      }

      // 3. SCROLL STATE 3: Complete Radiant Binary Matrix
      // The entire silhouette and face of Tony Stark shine in glowing binary digits
      if (inState3) {
        const matrixWave = Math.sin(time * 3 + s.y * 0.035 + s.offset) * 0.2 + 0.95;
        const fullBinaryIntensity = s.alpha * matrixWave;
        if (fullBinaryIntensity > intensity) {
          intensity = fullBinaryIntensity;
          offsetX = Math.sin(time * 4 + s.offset) * 1.2;
          offsetY = Math.cos(time * 4 + s.offset) * 1.2;
        }
      }

      // 4. SCROLL STATE 4: Binary Matrix Disperses Outward into Embers
      if (inState4) {
        const fade = (1 - state4Progress) * s.alpha;
        if (fade > intensity) {
          intensity = fade;
          offsetX = s.dispersionX * state4Progress * 60 + Math.sin(time * 3 + s.offset) * 2;
          offsetY = s.dispersionY * state4Progress * 60 - state4Progress * 40; // float upward like embers
        }
      }

      // Render glyph
      if (intensity > 0.04) {
        if (Math.random() < 0.08) {
          s.char = Math.random() > 0.5 ? '1' : '0';
        }

        const alpha = Math.min(1, intensity * (0.45 + s.alpha * 0.9));

        // Radiant multi-spectral palette ensuring high visibility across both light and dark regions:
        // Highlights (face/eyes/collar): Brilliant White (#ffffff)
        // Midtones: Warm Arc Gold (#f5b050 / #dfba75)
        // Dark areas (suit/hair): Electric Arc Cyan (#60a5fa / #38bdf8)
        if (s.luminance > 0.45) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.98})`;
        } else if (s.luminance > 0.18) {
          ctx.fillStyle = `rgba(245, 180, 80, ${alpha * 0.94})`;
        } else {
          ctx.fillStyle = `rgba(96, 165, 250, ${alpha * 0.90})`;
        }

        ctx.fillText(s.char, s.x + offsetX, s.y + offsetY);
      }
    }

    ctx.restore();
  }
}
