'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BinaryMaskRenderer } from './BinaryMaskRenderer';
import { starkConfig } from './stark-config';
import styles from './StarkImageStage.module.scss';

interface StarkImageStageProps {
  scrollProgress: number; // 0.0 to 1.0 from GSAP ScrollTrigger
  className?: string;
  onLoaded?: () => void;
}

export const StarkImageStage: React.FC<StarkImageStageProps> = ({
  scrollProgress,
  className,
  onLoaded: onLoadedProp,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoaded = React.useCallback(() => {
    setIsLoaded(true);
    if (onLoadedProp) onLoadedProp();
  }, [onLoadedProp]);

  return (
    <div className={`${styles.stageWrapper}${className ? ` ${className}` : ''}`}>
      {/* Ambient Arc-Reactor Glow Backdrop */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Frame Container */}
      <div className={styles.frame}>
        {/* Interactive Binary Canvas */}
        <div className={styles.canvasContainer}>
          <BinaryMaskRenderer
            scrollProgress={scrollProgress}
            onLoaded={handleLoaded}
            className={styles.canvas}
          />
        </div>

        {/* Fallback & Initial State preloader */}
        {!isLoaded && (
          <div className={styles.preloaderOverlay} aria-hidden="true">
            <Image
              src={starkConfig.images.tonyStark.src}
              alt={starkConfig.images.tonyStark.alt}
              width={starkConfig.images.tonyStark.width}
              height={starkConfig.images.tonyStark.height}
              sizes="(max-width: 640px) 340px, (max-width: 1024px) 440px, 480px"
              loading="lazy"
              className={styles.preloaderImage}
            />
          </div>
        )}

        {/* Precision HUD Overlays */}
        <div className={styles.hudTop} aria-hidden="true">
          <span className={styles.hudTag}>SYS // TRANSFORMATION</span>
          <span className={styles.hudValue}>
            {scrollProgress > 0.05
              ? `DECONSTRUCT [${Math.round(scrollProgress * 100)}%]`
              : 'CURSOR MASK ACTIVE'}
          </span>
        </div>

        {/* Precision Corner Accents */}
        <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

        {/* Edge Vignette */}
        <div className={styles.vignetteOverlay} aria-hidden="true" />
      </div>

      {/* Caption Cues */}
      <div className={styles.interactionCue} aria-hidden="true">
        <span className={styles.cueDot} />
        <span className={styles.cueText}>
          {scrollProgress > 0.1
            ? 'Scroll to drive binary transformation'
            : 'Hover / Touch to reveal underlying layer'}
        </span>
      </div>
    </div>
  );
};
