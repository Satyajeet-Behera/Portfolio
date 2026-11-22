'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { projectsData } from '@/data/projects';
import styles from './ProjectsSection.module.scss';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const ProjectsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || !sectionRef.current || !trackRef.current) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1025px)', () => {
      const track = trackRef.current;
      if (!track) return;

      // Calculate total horizontal scroll distance dynamically from content width
      const getScrollDistance = () => {
        return Math.max(0, track.scrollWidth - window.innerWidth + 120);
      };

      // Direct, ultra-responsive, buttery-smooth horizontal glide
      // Starts IMMEDIATELY when section pins (zero dead-zone delay after Interests)
      // Uses lightweight 0.15s scrub physics for effortless tactile response
      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${Math.round(getScrollDistance() * 1.05)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.15, // Instant, buttery smooth 1:1 physical response
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      return () => {
        tween.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className={styles.section}
      aria-labelledby="projects-heading"
    >
      {/* Calm, satisfying golden hour ambient glow layers */}
      <div className={styles.goldenHourAtmosphere} aria-hidden="true" />
      <div className={styles.goldenHourHorizon} aria-hidden="true" />

      <div ref={triggerRef} className={styles.pinWrapper}>
        <Container className={styles.container}>
          {/* Section Header */}
          <div className={styles.header}>
            <div className={styles.eyebrowWrapper}>
              <SectionLabel text="PORTFOLIO • EXPERIMENTS • CRAFT" />
            </div>

            <h2 id="projects-heading" className={styles.heading}>
              My Projects<span className={styles.period}>.</span>
            </h2>

            <p className={styles.description}>
              A collection of ideas I&apos;ve brought to life through code, creativity and experimentation.
            </p>
          </div>
        </Container>

        {/* Horizontal Project Showcase Track */}
        <div className={styles.trackContainer}>
          <div ref={trackRef} className={styles.track} aria-label="Project showcase">
            {projectsData.map((project, idx) => (
              <article
                key={project.id}
                className={styles.projectCard}
                aria-labelledby={`project-title-${project.id}`}
              >
                {/* Project Image Frame with Glass Divider */}
                <div className={styles.imageFrame}>
                  <Image
                    src={project.image}
                    alt={project.imageAlt}
                    width={1024}
                    height={484}
                    quality={90}
                    className={styles.projectImage}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 75vw, 67vw"
                    loading="lazy"
                  />

                  {/* Precision Frosted HUD Overlays */}
                  <div className={styles.cardHud} aria-hidden="true">
                    <span className={styles.hudNumber}>0{idx + 1} {'//'} 0{projectsData.length}</span>
                    <span className={styles.hudCategory}>{project.category}</span>
                  </div>

                  <div className={styles.imageVignette} aria-hidden="true" />
                </div>

                {/* Card Details in Frosted Glass Body */}
                <div className={styles.cardBody}>
                  <div>
                    <h3 id={`project-title-${project.id}`} className={styles.projectTitle}>
                      {project.title}
                    </h3>

                    <p className={styles.projectDescription}>{project.description}</p>

                    {/* Frosted Tech Stack Pills */}
                    <div className={styles.techList} aria-label="Technologies used">
                      {project.technologies.map((tech) => (
                        <span key={tech} className={styles.techPill}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* High-Contrast Action Links: White Button with Black Text */}
                  <div className={styles.actionRow}>
                    {project.liveUrl && (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.primaryLink}
                        aria-label={`View site for ${project.title} (opens in new tab)`}
                      >
                        <span>View Site</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" aria-hidden="true">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                      </Link>
                    )}

                    {project.githubUrl && (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.secondaryLink}
                        aria-label={`Source code: ${project.title} on GitHub (opens in new tab)`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        <span>Source Code</span>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {/* Ending Milestone: "And working on more projects." in Frosted Glass */}
            <div className={styles.continuationCard} aria-label="Future projects note">
              <div className={styles.continuationGlow} aria-hidden="true" />
              <div className={styles.continuationInner}>
                <span className={styles.continuationBadge}>FUTURE LAB</span>
                <p className={styles.continuationText}>And working on more projects.</p>
                <span className={styles.continuationSub}>
                  Autonomous agents, neural interfaces & creative experiments in active development.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
