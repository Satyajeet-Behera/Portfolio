import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { cuberConfig } from './cuber-config';
import styles from './CuberSection.module.scss';

export const CuberSection: React.FC = () => {
  return (
    <section
      id="cuber"
      className={styles.section}
      aria-labelledby="cuber-heading"
    >
      <Container className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Editorial & Hobby Narrative */}
          <div className={styles.contentCol}>
            <div className={styles.eyebrowWrapper}>
              <SectionLabel text={cuberConfig.eyebrow} />
            </div>

            <h2 id="cuber-heading" className={styles.heading}>
              I&apos;m also a{' '}
              <span className={styles.cuberHighlight}>pro cuber</span>
              <span className={styles.period}>.</span>
            </h2>

            <p className={styles.description}>{cuberConfig.description}</p>

            {/* Performance Metrics Cards */}
            <div className={styles.metricsGrid} role="list" aria-label="Speedcubing benchmarks">
              {cuberConfig.metrics.map((metric) => (
                <div key={metric.label} className={styles.metricCard} role="listitem">
                  <span className={styles.metricValue}>{metric.value}</span>
                  <span className={styles.metricLabel}>{metric.label}</span>
                  <span className={styles.metricDetail}>{metric.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Static Cube Photograph Stage */}
          <div className={styles.stageCol}>
            <div className={styles.imageStage}>
              {/* Subtle Ambient Radial Backlight */}
              <div className={styles.stageBacklight} aria-hidden="true" />

              {/* Frame Container with Precision Edges */}
              <div className={styles.frame}>
                <Image
                  src={cuberConfig.image.src}
                  alt={cuberConfig.image.alt}
                  width={cuberConfig.image.width}
                  height={cuberConfig.image.height}
                  quality={90}
                  className={styles.cubeImage}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 520px"
                  loading="lazy"
                />

                {/* Precision HUD Overlays */}
                <div className={styles.hudTop} aria-hidden="true">
                  <span className={styles.hudTag}>3×3 SPEEDCUBE</span>
                  <span className={styles.hudValue}>MOYU RS3M 2020</span>
                </div>

                {/* Precision Corner Accents */}
                <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
                <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
                <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
                <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

                {/* Subtle Edge Vignette */}
                <div className={styles.vignetteOverlay} aria-hidden="true" />
              </div>

              {/* Bottom Caption */}
              <div className={styles.captionRow} aria-hidden="true">
                <span className={styles.captionDot} />
                <span className={styles.captionText}>
                  Algorithm optimization · Lookahead · Fingertrick execution
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
