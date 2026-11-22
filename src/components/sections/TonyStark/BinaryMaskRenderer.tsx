'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { starkConfig } from './stark-config';
import { loadImage, getOptimizedDpr } from '@/lib/binary-renderer/rendering-utils';
import { sampleImageToGrid, SampledGrid } from '@/lib/binary-renderer/image-sampler';
import { drawBinaryTransformation } from '@/lib/binary-renderer/binary-particles';

interface BinaryMaskRendererProps {
  scrollProgress?: number; // 0.0 to 1.0
  className?: string;
  onLoaded?: () => void;
}

export const BinaryMaskRenderer: React.FC<BinaryMaskRendererProps> = ({
  scrollProgress = 0,
  className,
  onLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Asset refs
  const topImgRef = useRef<HTMLImageElement | null>(null);
  const bottomImgRef = useRef<HTMLImageElement | null>(null);
  const sampledGridRef = useRef<SampledGrid | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef2 = useRef<HTMLCanvasElement | null>(null);

  // Interaction State
  const [isReady, setIsReady] = useState(false);
  const pointerPos = useRef({ x: -9999, y: -9999 });
  const targetPointerPos = useRef({ x: -9999, y: -9999 });
  const isPointerActive = useRef(false);
  const activeIntensity = useRef(0); // Smooth interpolation for cursor entrance/exit
  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef(Date.now());
  const scrollProgressRef = useRef(scrollProgress);
  const isVisibleRef = useRef(false);

  // 1. High-Performance Render Loop with Visibility Caching
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      !topImgRef.current ||
      !bottomImgRef.current ||
      !sampledGridRef.current ||
      !isVisibleRef.current
    ) {
      animationFrameId.current = null;
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameId.current = null;
      return;
    }

    // Smoothly interpolate pointer position (ease factor)
    pointerPos.current.x += (targetPointerPos.current.x - pointerPos.current.x) * 0.22;
    pointerPos.current.y += (targetPointerPos.current.y - pointerPos.current.y) * 0.22;

    // Smoothly interpolate active intensity for entry/reconstruction
    const targetIntensity = isPointerActive.current ? 1 : 0;
    activeIntensity.current += (targetIntensity - activeIntensity.current) * 0.14;
    if (!isPointerActive.current && activeIntensity.current < 0.005) {
      activeIntensity.current = 0;
    }

    const time = (Date.now() - startTime.current) * 0.001;
    const currentRadius = starkConfig.engine.maskRadius * activeIntensity.current;
    const currentScroll = scrollProgressRef.current;

    // Allocate persistent offscreen buffers once
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    if (!offscreenCanvasRef2.current) {
      offscreenCanvasRef2.current = document.createElement('canvas');
    }

    drawBinaryTransformation(
      ctx,
      topImgRef.current,
      bottomImgRef.current,
      sampledGridRef.current,
      {
        cursorX: pointerPos.current.x,
        cursorY: pointerPos.current.y,
        cursorActive: activeIntensity.current > 0.005,
        maskRadius: currentRadius,
        maskFeather: starkConfig.engine.maskFeather,
        scrollProgress: currentScroll,
        time,
        particleSize: starkConfig.engine.particleFontSize,
        accentGold: starkConfig.engine.accentGold,
        tempCanvas: offscreenCanvasRef.current,
        tempCanvas2: offscreenCanvasRef2.current,
      },
      starkConfig.engine.defaultWidth,
      starkConfig.engine.defaultHeight
    );

    // Continue loop only when actively interacting, transforming, or reconstructing
    const needsContinuousLoop =
      isPointerActive.current ||
      activeIntensity.current > 0.005 ||
      (currentScroll > 0.005 && currentScroll < 0.995);

    if (needsContinuousLoop && isVisibleRef.current) {
      animationFrameId.current = requestAnimationFrame(renderFrame);
    } else {
      animationFrameId.current = null;
    }
  }, []);

  const triggerRender = useCallback(() => {
    if (isVisibleRef.current && !animationFrameId.current) {
      animationFrameId.current = requestAnimationFrame(renderFrame);
    }
  }, [renderFrame]);

  // Keep scrollProgressRef in sync and request frame when progress changes
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
    triggerRender();
  }, [scrollProgress, triggerRender]);

  // 2. IntersectionObserver for On-Demand Asset Loading & Loop Pausing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;
    let hasLoaded = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isIntersecting = entry ? entry.isIntersecting : false;
        isVisibleRef.current = isIntersecting;

        if (isIntersecting) {
          // Preload and sample assets only when user approaches the section
          if (!hasLoaded) {
            hasLoaded = true;
            Promise.all([
              loadImage(starkConfig.images.tonyStark.src).catch(() =>
                loadImage(starkConfig.images.tonyStark.fallback)
              ),
              loadImage(starkConfig.images.satyajeet.src).catch(() =>
                loadImage(starkConfig.images.satyajeet.fallback)
              ),
            ])
              .then(([topImg, bottomImg]) => {
                if (!isMounted) return;
                topImgRef.current = topImg;
                bottomImgRef.current = bottomImg;

                // Precompute grid sampling once at target resolution
                const width = starkConfig.engine.defaultWidth;
                const height = starkConfig.engine.defaultHeight;
                sampledGridRef.current = sampleImageToGrid(
                  topImg,
                  width,
                  height,
                  starkConfig.engine.particleStepSize
                );

                setIsReady(true);
                if (onLoaded) onLoaded();
                triggerRender();
              })
              .catch((err) => {
                console.error('Failed to load transformation assets:', err);
              });
          } else {
            // Wake render loop if already loaded
            triggerRender();
          }
        } else {
          // Scrolled away: pause animation loop immediately to save CPU/battery
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
          }
        }
      },
      { rootMargin: '400px 0px 400px 0px' }
    );

    observer.observe(canvas);

    return () => {
      isMounted = false;
      observer.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [onLoaded, triggerRender]);

  // Setup Canvas Dimensions with HiDPI support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = getOptimizedDpr();
    const width = starkConfig.engine.defaultWidth;
    const height = starkConfig.engine.defaultHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx && dpr !== 1) {
      ctx.scale(dpr, dpr);
    }

    triggerRender();
  }, [isReady, triggerRender]);

  // Pointer & Touch Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = starkConfig.engine.defaultWidth / rect.width;
    const scaleY = starkConfig.engine.defaultHeight / rect.height;

    targetPointerPos.current.x = (e.clientX - rect.left) * scaleX;
    targetPointerPos.current.y = (e.clientY - rect.top) * scaleY;
    isPointerActive.current = true;

    triggerRender();
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerMove(e);
  };

  const handlePointerLeave = () => {
    isPointerActive.current = false;
    triggerRender();
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        aspectRatio: `${starkConfig.engine.defaultWidth} / ${starkConfig.engine.defaultHeight}`,
        touchAction: 'none',
        cursor: 'crosshair',
      }}
      aria-label="Interactive Binary Transformation Canvas: Move cursor or scroll to reveal Satyajeet Behera from Tony Stark"
      role="img"
    />
  );
};
