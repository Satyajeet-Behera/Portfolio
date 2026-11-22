/**
 * Centralized Content Configuration for My Story Section
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
    "I come from a middle-class family in Odisha and currently live in Hyderabad. My journey into technology began with curiosity about Artificial Intelligence. I started exploring AI tools like ChatGPT during my school days, initially using them for everyday tasks and studying more efficiently.",
    "After completing my 10th grade with 90%, I became more interested in understanding how AI actually works rather than simply using it. I began learning about LLMs, how they are built, and concepts such as RAG. Eventually, I started experimenting with building my own AI-powered projects.",
    "I chose AI/ML as my specialization in B.Tech and began building projects from my very first year. Through hands-on experience, I learned to take ideas from concept to execution, build applications, solve problems independently, and deploy projects into real-world environments.",
    "As I grew more confident in my technical abilities, I started exploring freelancing and business opportunities, focusing on building useful digital products and applications. Today, I am continuously learning, experimenting, and building — driven by the belief that technology is not just something to study, but something I can use to create meaningful solutions.",
  ],
  portrait: {
    src: "/images/satyajeet-story.webp",
    fallback: "/images/satyajeet-story.jpg",
    alt: "Satyajeet Behera at his study desk with a notebook and laptop",
    width: 2048,
    height: 1536,
  },
};
