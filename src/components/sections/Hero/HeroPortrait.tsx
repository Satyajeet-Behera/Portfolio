import React from 'react';
import Image from 'next/image';
import type { HeroPortraitProps } from '@/types';
import styles from './HeroPortrait.module.scss';

/**
 * HeroPortrait Component
 *
 * Displays Satyajeet Behera's hero photograph with high-fidelity Next.js Image optimization.
 * Structured with clean, isolated presentation layers so Phase 2's interactive binary transformation
 * canvas and interactive mask can be seamlessly docked without touching the Hero layout.
 */
export const HeroPortrait: React.FC<HeroPortraitProps> = ({
  priority = true,
  className,
}) => {
  return (
    <div className={`${styles.wrapper}${className ? ` ${className}` : ''}`}>
      <div className={styles.ambientGlow} aria-hidden="true" />
      
      <div className={styles.frame}>
        {/* Architectural boundary for Phase 2 binary transformation renderer */}
        <div className={styles.mediaContainer}>
          <Image
            src="/images/satyajeet-hero.webp"
            alt="Portrait of Satyajeet Behera"
            width={1024}
            height={768}
            priority={priority}
            fetchPriority="high"
            quality={90}
            sizes="(max-width: 640px) 94vw, (max-width: 1024px) 48vw, 540px"
            className={styles.image}
          />
          {/* Subtle vignette layer blending photograph's deep black background with site canvas */}
          <div className={styles.vignetteOverlay} aria-hidden="true" />
        </div>

        {/* Decorative corner indicators reflecting precision engineering */}
        <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
      </div>
    </div>
  );
};
