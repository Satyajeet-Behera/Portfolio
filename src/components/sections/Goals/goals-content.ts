/**
 * Centralized Content Configuration for My Long-Term Goal Section
 * Phase 3 — Long-Term Ambitions & Investing Philosophy
 */

export interface GoalPillar {
  title: string;
  detail: string;
}

export interface GoalsContent {
  eyebrow: string;
  heading: string;
  mainStatement: string;
  description: string;
  pillars: GoalPillar[];
  portrait: {
    src: string;
    fallback: string;
    alt: string;
    width: number;
    height: number;
  };
}

export const goalsContent: GoalsContent = {
  eyebrow: "AMBITION • VISION • LONG-TERM VALUE",
  heading: "My Long-Term Goal.",
  mainStatement: "To become a successful investor.",
  description:
    "My long-term goal is to become a successful investor. I want to develop a deep understanding of businesses, markets, risk and long-term value, and eventually use that knowledge to make thoughtful investment decisions. For me, investing represents a commitment to learning, patience and building something that lasts.",

  pillars: [
    {
      title: "Business Moats & Fundamentals",
      detail: "Deeply understanding competitive advantages, operating leverage, and capital allocation.",
    },
    {
      title: "Risk Asymmetry & Valuation",
      detail: "Evaluating risk before return, protecting downside, and identifying enduring long-term value.",
    },
    {
      title: "Patience & Compounding",
      detail: "Developing the discipline to wait for pitch-perfect opportunities and think in decades.",
    },
  ],

  portrait: {
    src: "/images/satyajeet-suit.webp",
    fallback: "/images/satyajeet-suit.jpg",
    alt: "Satyajeet Behera in formal executive suit representing disciplined ambition",
    width: 768,
    height: 1024,
  },
};
