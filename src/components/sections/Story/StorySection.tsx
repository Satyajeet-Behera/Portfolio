import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { storyContent } from './story-content';
import styles from './StorySection.module.scss';

export const StorySection: React.FC = () => {
  const hasParagraphs = storyContent.paragraphs.length > 0;

  return (
    <section
      id="story"
      className={styles.section}
      aria-labelledby="story-heading"
    >
      <Container className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Heading & Spacious Story Narrative Area */}
          <div className={styles.contentCol}>
            <div className={styles.eyebrowWrapper}>
              <SectionLabel text={storyContent.eyebrow} />
            </div>

            <h2 id="story-heading" className={styles.heading}>
              My Story<span className={styles.period}>.</span>
            </h2>

            <div className={styles.storyBody}>
              {hasParagraphs ? (
                storyContent.paragraphs.map((p, index) => (
                  <p key={index} className={styles.storyParagraph}>
                    {p}
                  </p>
                ))
              ) : (
                <div className={styles.emptyStoryState}>
                  <div className={styles.storyMetaBadge}>
                    <span className={styles.metaDot} />
                    <span className={styles.metaText}>MEMOIR IN DRAFT</span>
                  </div>
                  <p className={styles.awaitingText}>
                    The authentic personal journey of Satyajeet Behera is being carefully curated. This section is structured to host his personal narrative, formative experiences, and philosophy without fabricated corporate filler.
                  </p>
                  <div className={styles.storyDivider} aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Authentic Study Desk Portrait */}
          <div className={styles.stageCol}>
            <div className={styles.imageStage}>
              <div className={styles.stageBacklight} aria-hidden="true" />

              <div className={styles.frame}>
                <Image
                  src={storyContent.portrait.src}
                  alt={storyContent.portrait.alt}
                  width={storyContent.portrait.width}
                  height={storyContent.portrait.height}
                  quality={90}
                  className={styles.portraitImage}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
                  loading="lazy"
                />

                {/* Precision HUD Overlays */}
                <div className={styles.hudTop} aria-hidden="true">
                  <span className={styles.hudTag}>AUTHENTIC JOURNEY</span>
                  <span className={styles.hudValue}>THE DESK // CRAFT</span>
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
                  Late nights · Systematic thinking · Relentless curiosity
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
