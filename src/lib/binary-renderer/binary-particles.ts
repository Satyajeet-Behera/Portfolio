/**
 * Binary Particle Engine — Phase 5 Master Implementation
 *
 * Implements:
 * 1. Unified focal-aware cover crop coordinate alignment (shared coordinate system).
 * 2. Localized cursor disintegration with smooth entry/reconstruction.
 * 3. 5-State continuous and reversible scroll-driven transformation:
 *    - State 1: Complete Tony Stark photograph intact on obsidian stage.
 *    - State 2: Progressive digital dissolution wave spreading across the figure.
 *    - State 3: Complete Binary — full silhouette and facial contours in luminous binary code.
 *    - State 4: Personal Image Reveal — binary matrix disperses into embers as Satyajeet emerges.
 *    - State 5: Complete Satyajeet Behera photograph in crisp, pristine fidelity.
 */

import { SampledGrid } from './image-sampler';
import { smoothstep, computeCoverCrop } from './rendering-utils';

export interface BinaryRenderOptions {
  cursorX: number;
  cursorY: number;
  cursorActive: boolean;
  maskRadius: number;
  maskFeather: number;
  scrollProgress: number; // 0.0 = Tony Stark, 0.55 = Complete Binary, 1.0 = Satyajeet Behera
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
    0.22 // Satyajeet focal point aligned with upper chest & eyes
  );

  const cropTop = computeCoverCrop(
    topImage.naturalWidth || topImage.width,
    topImage.naturalHeight || topImage.height,
    canvasWidth,
    canvasHeight,
    0.25 // Tony Stark focal point aligned with head & eyes
  );

  // Allocate / reuse offscreen canvas buffers for multi-pass compositing
  const bufA = providedTempCanvas || document.createElement('canvas');
  if (bufA.width !== canvasWidth || bufA.height !== canvasHeight) {
    bufA.width = canvasWidth;
    bufA.height = canvasHeight;
  }
  const ctxA = bufA.getContext('2d');

  const bufB = providedTempCanvas2 || document.createElement('canvas');
  if (bufB.width !== canvasWidth || bufB.height !== canvasHeight) {
    bufB.width = canvasWidth;
    bufB.height = canvasHeight;
  }
  const ctxB = bufB.getContext('2d');

  if (!ctxA || !ctxB) return;

  // ---------------------------------------------------------------------------
  // PASS 1: Base Layer (Satyajeet Behera)
  // Revealed selectively through localized cursor hole or scroll transformation
  // ---------------------------------------------------------------------------
  const satyaAlpha = smoothstep(0.40, 0.88, scrollProgress);
  const showSatyaScroll = scrollProgress > 0.05;
  const showSatyaCursor = cursorActive && maskRadius > 2;

  if (showSatyaScroll || showSatyaCursor) {
    ctxA.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw Satyajeet portrait
    ctxA.drawImage(
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

    // Mask Satyajeet in State 1 and early State 2 so only the active portal is visible
    if (scrollProgress < 0.85) {
      ctxA.globalCompositeOperation = 'destination-in';

      // (A) If scroll has started, reveal with a soft deconstruction wave
      if (scrollProgress > 0.05) {
        const waveFront = ((scrollProgress - 0.05) / 0.40) * (canvasHeight + 120) - 60;
        const waveGrad = ctxA.createLinearGradient(0, Math.max(0, waveFront - 80), 0, Math.min(canvasHeight, waveFront + 80));
        waveGrad.addColorStop(0, 'rgba(0,0,0,1)');
        waveGrad.addColorStop(1, `rgba(0,0,0,${satyaAlpha})`);

        ctxA.fillStyle = waveGrad;
        ctxA.fillRect(0, 0, canvasWidth, canvasHeight);
      } else {
        // Pure State 1: Satyajeet is ONLY visible through the localized cursor portal
        ctxA.fillStyle = 'rgba(0,0,0,0)';
        ctxA.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // (B) Composite localized cursor portal
      if (showSatyaCursor) {
        ctxA.globalCompositeOperation = 'source-over';
        const radGrad = ctxA.createRadialGradient(
          cursorX,
          cursorY,
          Math.max(0, maskRadius - maskFeather),
          cursorX,
          cursorY,
          maskRadius
        );
        radGrad.addColorStop(0, 'rgba(0,0,0,1)');
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');

        // We punch the portal on a clean mask layer
        ctxB.clearRect(0, 0, canvasWidth, canvasHeight);
        ctxB.fillStyle = radGrad;
        ctxB.beginPath();
        ctxB.arc(cursorX, cursorY, maskRadius, 0, Math.PI * 2);
        ctxB.fill();

        ctxB.globalCompositeOperation = 'source-in';
        ctxB.drawImage(
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

        // Blend cursor portal into layer A
        ctxA.globalCompositeOperation = 'source-over';
        ctxA.drawImage(bufB, 0, 0);
      }

      ctxA.globalCompositeOperation = 'source-over';
    }

    // Paint Satyajeet layer onto main canvas
    ctx.drawImage(bufA, 0, 0);
  }

  // ---------------------------------------------------------------------------
  // PASS 2: Top Layer (Tony Stark Cutout)
  // Intact in State 1, dissolved by wave in State 2, 0 in States 3-5
  // ---------------------------------------------------------------------------
  if (scrollProgress < 0.48) {
    ctxA.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw intact Tony Stark cutout
    ctxA.drawImage(
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

    // Punch out localized cursor area and scroll deconstruction wave
    ctxA.globalCompositeOperation = 'destination-out';

    // (A) Localized cursor mask hole with smooth radial feathering
    if (cursorActive && maskRadius > 1) {
      const radGrad = ctxA.createRadialGradient(
        cursorX,
        cursorY,
        Math.max(0, maskRadius - maskFeather),
        cursorX,
        cursorY,
        maskRadius
      );
      radGrad.addColorStop(0, 'rgba(0,0,0,1)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctxA.fillStyle = radGrad;
      ctxA.beginPath();
      ctxA.arc(cursorX, cursorY, maskRadius, 0, Math.PI * 2);
      ctxA.fill();
    }

    // (B) Scroll deconstruction wave dissolution (State 2)
    if (scrollProgress > 0.05) {
      const scrollNorm = (scrollProgress - 0.05) / 0.38; // 0.0 to 1.0 within State 2
      const waveFront = scrollNorm * (canvasHeight + 140) - 70;

      ctxA.beginPath();
      ctxA.moveTo(0, 0);
      ctxA.lineTo(canvasWidth, 0);

      const step = 12;
      for (let x = canvasWidth; x >= 0; x -= step) {
        const wavePerturb = Math.sin(x * 0.022 + time * 3.5) * 16 + Math.cos(x * 0.012 + time * 2) * 8;
        const currentY = Math.min(canvasHeight + 20, waveFront + wavePerturb);
        ctxA.lineTo(x, currentY);
      }

      ctxA.closePath();
      ctxA.fillStyle = 'rgba(0,0,0,1)';
      ctxA.fill();

      // Soft edge feather along wave front
      const featherHeight = 36;
      const gradY1 = Math.max(0, waveFront - 12);
      const gradY2 = Math.min(canvasHeight, waveFront + featherHeight);
      if (gradY2 > gradY1) {
        const waveGrad = ctxA.createLinearGradient(0, gradY1, 0, gradY2);
        waveGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
        waveGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctxA.fillStyle = waveGrad;
        ctxA.fillRect(0, gradY1, canvasWidth, gradY2 - gradY1);
      }
    }

    ctxA.globalCompositeOperation = 'source-over';

    // Fade top image out towards end of State 2 as it enters State 3
    if (scrollProgress > 0.38) {
      const fadeOut = 1 - (scrollProgress - 0.38) / 0.10;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, fadeOut));
      ctx.drawImage(bufA, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(bufA, 0, 0);
    }
  }

  // ---------------------------------------------------------------------------
  // PASS 3: High-Tech Binary Glyph System (0 & 1 Particles)
  // State 1: Localized disintegration around cursor
  // State 2: Active wave edge digital embers
  // State 3: Complete Binary — whole figure rendered in radiant code matrix!
  // State 4: Dispersal into floating embers
  // State 5: Quiescent (faded to 0)
  // ---------------------------------------------------------------------------
  if (scrollProgress < 0.92 || (cursorActive && maskRadius > 1)) {
    ctx.save();
    ctx.font = `600 ${particleSize}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const samples = sampledGrid.samples;
    const count = samples.length;

    // Precalculate scroll transformation wave positions
    const inState2 = scrollProgress >= 0.05 && scrollProgress < 0.45;
    const inState3 = scrollProgress >= 0.45 && scrollProgress < 0.65;
    const inState4 = scrollProgress >= 0.65 && scrollProgress < 0.88;

    const waveFront = inState2
      ? ((scrollProgress - 0.05) / 0.40) * (canvasHeight + 140) - 70
      : 0;

    const state4Progress = inState4 ? (scrollProgress - 0.65) / 0.23 : 0;

    for (let i = 0; i < count; i++) {
      const s = samples[i];
      let intensity = 0;
      let offsetX = 0;
      let offsetY = 0;

      // 1. CURSOR INFLUENCE (Localized Disintegration)
      if (cursorActive && maskRadius > 3) {
        const dx = s.x - cursorX;
        const dy = s.y - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maskRadius + 18) {
          // Sharp rim concentration + active disintegration interior
          const rimDist = Math.abs(dist - (maskRadius - maskFeather * 0.4));
          const rimIntensity = 1 - smoothstep(0, maskFeather, rimDist);
          const coreIntensity = (1 - smoothstep(0, maskRadius, dist)) * 0.65;
          const localIntensity = Math.max(rimIntensity, coreIntensity);

          if (localIntensity > intensity) {
            intensity = localIntensity;
            // Jitter / drift particles away from cursor center
            const pushAngle = Math.atan2(dy, dx);
            const pushDist = (1 - dist / (maskRadius + 18)) * 6;
            offsetX = Math.cos(pushAngle) * pushDist + Math.sin(time * 5 + s.offset) * 1.5;
            offsetY = Math.sin(pushAngle) * pushDist + Math.cos(time * 5 + s.offset) * 1.5;
          }
        }
      }

      // 2. SCROLL INFLUENCE: STATE 2 (Progressive Wave Dissolution)
      if (inState2) {
        const wavePerturb = Math.sin(s.x * 0.022 + time * 3.5) * 16 + Math.cos(s.x * 0.012 + time * 2) * 8;
        const targetWaveY = waveFront + wavePerturb;
        const distToWave = s.y - targetWaveY;

        if (distToWave >= -75 && distToWave <= 45) {
          const normDist = Math.abs(distToWave) / 60;
          const waveIntensity = (1 - normDist) * 1.4;
          if (waveIntensity > intensity) {
            intensity = waveIntensity;
            offsetX = Math.sin(time * 6 + s.offset) * 2.5;
            offsetY = Math.cos(time * 6 + s.offset) * 2.5 - 2;
          }
        }
      }

      // 3. SCROLL INFLUENCE: STATE 3 (Complete Binary Matrix)
      // Every single pixel of Tony Stark becomes a luminous binary glyph!
      if (inState3) {
        // Ambient holographic shimmer wave traversing the silhouette
        const matrixWave = Math.sin(time * 3 + s.y * 0.04 + s.offset) * 0.2 + 0.85;
        const fullBinaryIntensity = s.alpha * matrixWave;
        if (fullBinaryIntensity > intensity) {
          intensity = fullBinaryIntensity;
          offsetX = Math.sin(time * 4 + s.offset) * 1.2;
          offsetY = Math.cos(time * 4 + s.offset) * 1.2;
        }
      }

      // 4. SCROLL INFLUENCE: STATE 4 (Personal Reveal / Dispersal)
      // Matrix disperses outward into floating digital embers as Satyajeet emerges
      if (inState4) {
        const fade = (1 - state4Progress) * s.alpha;
        if (fade > intensity) {
          intensity = fade;
          // Disperse along precomputed directional vectors
          offsetX = s.dispersionX * state4Progress * 45 + Math.sin(time * 3 + s.offset) * 2;
          offsetY = s.dispersionY * state4Progress * 45 - state4Progress * 30; // Float upward
        }
      }

      // Render Glyph if active
      if (intensity > 0.06) {
        // High-frequency subtle character shuffle
        if (Math.random() < 0.07) {
          s.char = Math.random() > 0.5 ? '1' : '0';
        }

        const alpha = Math.min(1, intensity * (s.alpha * 1.4));

        // Precision luxury palette:
        // High luminance (arc reactor / highlights): Warm Arc Gold
        // Mid luminance: Crisp Platinum / White
        // Low luminance: Deep Titanium / Slate
        if (s.luminance > 0.52) {
          ctx.fillStyle = `rgba(223, 186, 117, ${alpha})`; // Warm Arc Gold (#dfba75)
        } else if (s.luminance > 0.22) {
          ctx.fillStyle = `rgba(245, 245, 247, ${alpha * 0.95})`; // Crisp White (#f5f5f7)
        } else {
          ctx.fillStyle = `rgba(165, 165, 175, ${alpha * 0.72})`; // Metallic Titanium
        }

        ctx.fillText(s.char, s.x + offsetX, s.y + offsetY);
      }
    }

    ctx.restore();
  }
}
