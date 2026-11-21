'use client';

import React, { useState } from 'react';
import { BinaryMaskRenderer } from './BinaryMaskRenderer';
import styles from './StarkImageStage.module.scss';

interface StarkImageStageProps {
  scrollProgress: number; // 0.0 to 1.0 from GSAP ScrollTrigger
  className?: string;
}

export const StarkImageStage: React.FC<StarkImageStageProps> = ({
  scrollProgress,
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

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
            onLoaded={() => setIsLoaded(true)}
            className={styles.canvas}
          />
        </div>

        {/* Fallback & Initial State preloader */}
        {!isLoaded && (
          <div className={styles.preloaderOverlay} aria-hidden="true">
            <div className={styles.preloaderPulse} />
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
