import React from 'react';
import { Container } from '@/components/layout/Container/Container';
import { HeroPortrait } from './HeroPortrait';
import { siteConfig } from '@/lib/site-config';
import type { SectionProps } from '@/types';
import styles from './Hero.module.scss';

export const Hero: React.FC<SectionProps> = ({ id = 'hero', className }) => {
  return (
    <section
      id={id}
      className={`${styles.hero}${className ? ` ${className}` : ''}`}
      aria-label="Introduction"
    >
      <Container className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Typography & Identity */}
          <div className={styles.contentCol}>
            <h1 className={styles.heading}>
              <span className={styles.greeting}>Hi, I&apos;m </span>
              <span className={styles.highlightName}>Satyajeet Behera</span>
              <span className={styles.period}>.</span>
            </h1>

            <p className={styles.description}>
              {siteConfig.supportingDescription}
            </p>

            <div className={styles.actionRow}>
              <a
                href="#bottom-cue"
                className={styles.primaryAction}
              >
                <span>Explore Work</span>
                <svg
                  className={styles.actionIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Portrait */}
          <div className={styles.portraitCol}>
            <HeroPortrait priority={true} />
          </div>
        </div>

        {/* Bottom Hero Editorial Bar & Scroll Cue */}
        <div id="bottom-cue" className={styles.bottomBar}>
          <div className={styles.quoteWrapper}>
            <div className={styles.dividerLine} aria-hidden="true" />
            <p className={styles.bottomQuote}>
              <span className={styles.quoteAccent}>“</span>
              {siteConfig.bottomHeroQuote}
              <span className={styles.quoteAccent}>”</span>
            </p>
          </div>

          <div className={styles.scrollCueWrapper} aria-hidden="true">
            <span className={styles.scrollText}>SCROLL</span>
            <div className={styles.scrollTrack}>
              <div className={styles.scrollPill} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
