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
  const onLoadedRef = useRef(onLoaded);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  // 1. High-Performance Render Frame
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      !topImgRef.current ||
      !bottomImgRef.current ||
      !sampledGridRef.current
    ) {
      animationFrameId.current = null;
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameId.current = null;
      return;
    }

    const dpr = getOptimizedDpr();
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Smoothly interpolate pointer position (ease factor)
    pointerPos.current.x += (targetPointerPos.current.x - pointerPos.current.x) * 0.35;
    pointerPos.current.y += (targetPointerPos.current.y - pointerPos.current.y) * 0.35;

    // Smoothly interpolate active intensity for entry/reconstruction
    const targetIntensity = isPointerActive.current ? 1 : 0;
    activeIntensity.current += (targetIntensity - activeIntensity.current) * 0.22;
    if (!isPointerActive.current && activeIntensity.current < 0.005) {
      activeIntensity.current = 0;
      pointerPos.current.x = -9999;
      pointerPos.current.y = -9999;
    }

    const time = (Date.now() - startTime.current) * 0.001;
    const currentRadius = starkConfig.engine.maskRadius * activeIntensity.current;
    const currentScroll = Math.max(0, Math.min(1, scrollProgressRef.current));

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

    ctx.restore();

    // Keep continuous loop running while interacting, transforming, or shimmering
    const needsContinuousLoop =
      isPointerActive.current ||
      activeIntensity.current > 0.005 ||
      (currentScroll > 0.001 && currentScroll < 0.999);

    if (needsContinuousLoop) {
      animationFrameId.current = requestAnimationFrame(renderFrame);
    } else {
      animationFrameId.current = null;
    }
  }, []);

  const triggerRender = useCallback(() => {
    if (!animationFrameId.current) {
      animationFrameId.current = requestAnimationFrame(renderFrame);
    }
  }, [renderFrame]);

  // Synchronize scrollProgress immediately and request frame
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
    triggerRender();
  }, [scrollProgress, triggerRender]);

  // 2. Eager Asset Preloading & Grid Computation (Starts immediately on mount, NEVER aborts)
  useEffect(() => {
    let isMounted = true;

    // Immediately initialize canvas dimensions to prevent 300x150 default layout shift
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = getOptimizedDpr();
      const width = starkConfig.engine.defaultWidth;
      const height = starkConfig.engine.defaultHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    // Preload both portraits immediately
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

        // Precompute high-fidelity binary sampling grid
        const width = starkConfig.engine.defaultWidth;
        const height = starkConfig.engine.defaultHeight;
        sampledGridRef.current = sampleImageToGrid(
          topImg,
          width,
          height,
          starkConfig.engine.particleStepSize
        );

        setIsReady(true);
        if (onLoadedRef.current) {
          onLoadedRef.current();
        }

        // Render initial frame immediately
        triggerRender();
      })
      .catch((err) => {
        console.error('Failed to load Tony Stark transformation assets:', err);
      });

    return () => {
      isMounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [triggerRender]);

  // Pointer & Touch Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = starkConfig.engine.defaultWidth / rect.width;
    const scaleY = starkConfig.engine.defaultHeight / rect.height;

    const newX = (e.clientX - rect.left) * scaleX;
    const newY = (e.clientY - rect.top) * scaleY;

    targetPointerPos.current.x = newX;
    targetPointerPos.current.y = newY;

    if (pointerPos.current.x < -100) {
      pointerPos.current.x = newX;
      pointerPos.current.y = newY;
    }

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
      data-ready={isReady}
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
