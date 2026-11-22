/**
 * Centralized Motion & Animation Configuration — Phase 5
 *
 * Provides harmonious, restrained physics, durations, and easings
 * across all portfolio sections and interactions.
 */

export const motionConfig = {
  // Entrance & Section Transitions
  entranceDuration: 0.8,
  stagger: 0.08,
  sectionTransition: 0.65,

  // GSAP Easings
  easeLuxury: 'power2.out',
  easeSmooth: 'power3.out',
  easeExpo: 'expo.out',

  // Scrub & Spring Physics
  scrubSmoothness: 0.5,
  trackScrub: 0.5,

  // Device-level flags
  reducedMotion: false,
} as const;

export type MotionConfig = typeof motionConfig;
