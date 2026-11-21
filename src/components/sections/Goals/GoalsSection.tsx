import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { goalsContent } from './goals-content';
import styles from './GoalsSection.module.scss';

export const GoalsSection: React.FC = () => {
  return (
    <section
      id="goals"
      className={styles.section}
      aria-labelledby="goals-heading"
    >
      <Container className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Vision & Philosophy */}
          <div className={styles.contentCol}>
            <div className={styles.eyebrowWrapper}>
              <SectionLabel text={goalsContent.eyebrow} />
            </div>

            <h2 id="goals-heading" className={styles.heading}>
              My Long-Term Goal<span className={styles.period}>.</span>
            </h2>

            {/* Main Statement Banner */}
            <div className={styles.statementCallout}>
              <p className={styles.statementText}>{goalsContent.mainStatement}</p>
            </div>

            {/* Exact Supporting Narrative */}
            <p className={styles.description}>{goalsContent.description}</p>

            {/* Core Investing Mindset Pillars */}
            <div className={styles.pillarsGrid} role="list">
              {goalsContent.pillars.map((pillar) => (
                <div key={pillar.title} className={styles.pillarCard} role="listitem">
                  <div className={styles.pillarHeader}>
                    <span className={styles.pillarBullet} aria-hidden="true" />
                    <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                  </div>
                  <p className={styles.pillarDetail}>{pillar.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Prominent Portrait */}
          <div className={styles.stageCol}>
            <div className={styles.imageStage}>
              <div className={styles.stageBacklight} aria-hidden="true" />

              <div className={styles.frame}>
                <Image
                  src={goalsContent.portrait.src}
                  alt={goalsContent.portrait.alt}
                  width={goalsContent.portrait.width}
                  height={goalsContent.portrait.height}
                  quality={90}
                  className={styles.portraitImage}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
                  loading="lazy"
                />

                {/* Precision HUD Overlays */}
                <div className={styles.hudTop} aria-hidden="true">
                  <span className={styles.hudTag}>LONG-TERM VISION</span>
                  <span className={styles.hudValue}>CAPITAL // COMPOUNDING</span>
                </div>

                {/* Precision Corner Accents */}
                <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
                <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
                <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
                <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

                {/* Vignette Overlay */}
                <div className={styles.vignetteOverlay} aria-hidden="true" />
              </div>

              {/* Bottom Caption */}
              <div className={styles.captionRow} aria-hidden="true">
                <span className={styles.captionDot} />
                <span className={styles.captionText}>
                  Discipline · Asymmetric Value · Patient Horizon
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
