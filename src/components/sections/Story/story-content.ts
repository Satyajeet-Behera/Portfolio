/**
 * Centralized Content Configuration for My Story Section
 *
 * NOTE: As instructed, no fabricated experiences, personal history, or false milestones
 * are included. When the user supplies their actual story paragraphs, add them
 * to the `paragraphs` array below.
 */

export interface StoryContent {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  portrait: {
    src: string;
    fallback: string;
    alt: string;
    width: number;
    height: number;
  };
}

export const storyContent: StoryContent = {
  eyebrow: "BACKGROUND • JOURNEY • IDENTITY",
  heading: "My Story.",
  paragraphs: [
    // Leave empty or populate with authentic narrative provided by Satyajeet Behera
  ],
  portrait: {
    src: "/images/satyajeet-story.webp",
    fallback: "/images/satyajeet-story.jpg",
    alt: "Satyajeet Behera at his study desk with a notebook and laptop",
    width: 2048,
    height: 1536,
  },
};
