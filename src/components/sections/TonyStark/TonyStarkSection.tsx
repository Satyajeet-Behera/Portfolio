'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { StarkImageStage } from './StarkImageStage';
import { starkConfig } from './stark-config';
import styles from './TonyStarkSection.module.scss';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const TonyStarkSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinTargetRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || !sectionRef.current || !pinTargetRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 768;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: isMobile ? '+=900' : starkConfig.scroll.pinDistance,
        pin: pinTargetRef.current,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="intelligence"
      className={styles.section}
      aria-label="Tony Stark Intelligence & Binary Transformation Section"
    >
      <div ref={pinTargetRef} className={styles.pinWrapper}>
        <Container className={styles.container}>
          <div className={styles.grid}>
            {/* Left Column: Heading & Philosophical Narrative */}
            <div className={styles.contentCol}>
              <div className={styles.eyebrowWrapper}>
                <SectionLabel text={starkConfig.eyebrow} />
              </div>

              <h2 className={styles.heading}>
                Big fan of{' '}
                <span className={styles.starkHighlight}>Tony Stark&apos;s</span>{' '}
                intelligence<span className={styles.period}>.</span>
              </h2>

              <p className={styles.description}>{starkConfig.description}</p>

              {/* Progress Milestones */}
              <div className={styles.progressTracker} aria-hidden="true">
                <div className={styles.trackerStep}>
                  <span
                    className={`${styles.stepIndicator}${
                      scrollProgress < 0.2 ? ` ${styles.stepActive}` : ''
                    }`}
                  />
                  <span className={styles.stepLabel}>01 // TONY STARK</span>
                </div>
                <div className={styles.trackerStep}>
                  <span
                    className={`${styles.stepIndicator}${
                      scrollProgress >= 0.2 && scrollProgress < 0.75
                        ? ` ${styles.stepActive}`
                        : ''
                    }`}
                  />
                  <span className={styles.stepLabel}>02 // BINARY CORE</span>
                </div>
                <div className={styles.trackerStep}>
                  <span
                    className={`${styles.stepIndicator}${
                      scrollProgress >= 0.75 ? ` ${styles.stepActive}` : ''
                    }`}
                  />
                  <span className={styles.stepLabel}>03 // SATYAJEET BEHERA</span>
                </div>
              </div>
            </div>

            {/* Right Column: Coordinated Image Stage */}
            <div className={styles.stageCol}>
              <StarkImageStage
                scrollProgress={scrollProgress}
                onLoaded={() => {
                  requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                  });
                }}
              />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
};
