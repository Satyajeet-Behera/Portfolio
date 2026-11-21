/**
 * Central Configuration for Cuber Section
 * Phase 3 — Personal Identity & Hobbies
 */

export const cuberConfig = {
  eyebrow: "SPEEDCUBING • FOCUS • PRECISION",
  heading: "I'm also a pro cuber.",
  description:
    "Solving the Rubik's Cube is my favourite hobby. My average solving time on a 3×3 Rubik's Cube is currently around 25 seconds. I've set myself a goal of becoming sub-20 before the end of 2026.",

  metrics: [
    {
      value: "~25s",
      label: "Current Average",
      detail: "3×3 WCA standard solve pace",
    },
    {
      value: "Sub-20",
      label: "2026 Target",
      detail: "Official sub-20 second benchmark",
    },
    {
      value: "RS3M",
      label: "Main Cube",
      detail: "MoYu RS3M 2020 Magnetic",
    },
  ],

  image: {
    src: "/images/rubiks-cube.webp",
    fallback: "/images/rubiks-cube.jpg",
    alt: "Satyajeet Behera solving a MoYu RS3M 2020 3x3 Rubik's Cube with precision fingertricks",
    width: 1002,
    height: 1024,
  },
} as const;

export type CuberConfig = typeof cuberConfig;
