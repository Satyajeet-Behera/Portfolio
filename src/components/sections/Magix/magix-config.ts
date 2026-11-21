/**
 * Configuration for Magix AI Assistant Section
 */

export const magixConfig = {
  eyebrow: "PERSONAL AI ASSISTANT • AUTONOMOUS INTELLIGENCE",
  heading: "Satyajeet's Jarvis is Magix.",
  wakePhrase: "Hey, Magix!",
  greeting: "Hello Boss, how can I assist your workflow today?",
  status: "ONLINE // GEMINI NEURAL CORE",
  
  description:
    "Meet Magix, my personal AI assistant inspired by the intelligence and capabilities of Jarvis. Built around the idea of making interactions with technology more natural, intuitive and personal.",

  features: [
    { label: "Voice Conversation", detail: "Natural speech synthesis & male/female neural voice models" },
    { label: "Autonomous Reasoning", detail: "Powered by multi-modal Gemini intelligence models" },
    { label: "Ambient Awareness", detail: "Background task automation & contextual device synchronization" },
  ],

  // Real or configurable placeholder GitHub repository link
  githubUrl: "https://github.com/satyajeetbehera/magix",
} as const;

export type MagixConfig = typeof magixConfig;
