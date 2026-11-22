/**
 * Central Configuration for Tony Stark Binary Transformation Section
 */

export const starkConfig = {
  eyebrow: "VISION • INTELLIGENCE • INGENUITY",
  heading: "Big fan of Tony Stark's intelligence.",
  description:
    "Inspired by the visionary thinking and engineering audacity of Tony Stark. An exploration into technological precision, digital deconstruction, and the mind behind the craft.",

  images: {
    tonyStark: {
      src: "/images/tony-stark-cutout.webp",
      fallback: "/images/tony-stark-cutout.png",
      alt: "Tony Stark Cutout with Transparent Background",
      width: 697,
      height: 1024,
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
    },
    satyajeet: {
      src: "/images/satyajeet-suit.webp",
      fallback: "/images/satyajeet-suit.jpg",
      alt: "Satyajeet Behera in Formal Suit",
      width: 768,
      height: 1024,
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
    },
  },

  // Interactive Binary Engine Settings
  engine: {
    defaultWidth: 480,
    defaultHeight: 680,
    maskRadius: 135,
    maskFeather: 45,
    particleStepSize: 8, // Calibrated grid sample resolution
    particleFontSize: 9.5, // Crisp, perfectly spaced binary glyphs
    accentGold: "#c5a059",
    accentGoldLight: "#dfba75",
    reconstructionDuration: 0.6, // seconds to restore Tony Stark after cursor exits
  },

  // Scroll Progression Settings (GSAP ScrollTrigger)
  scroll: {
    pinDistance: "+=1500", // Pinned scroll distance in pixels
    stage1End: 0.15, // Idle cursor interaction zone
    stage2End: 0.55, // Disintegration into binary
    stage3End: 0.75, // Dense binary glyph state
    stage4End: 0.95, // Reveal of Satyajeet Behera
    complete: 1.0,   // Final clean portrait
  },
} as const;

export type StarkConfig = typeof starkConfig;
