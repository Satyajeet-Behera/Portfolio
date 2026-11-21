/**
 * Centralized Project Configuration
 * Phase 4 — Portfolio Showcase
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  image: string;
  imageAlt: string;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
}

export const projectsData: Project[] = [
  {
    id: "voxelcraft",
    title: "Voxel Craft",
    category: "3D GAME ENGINE / WEBGL",
    description:
      "A browser-based 3D voxel sandbox game inspired by Minecraft, featuring real-time chunk rendering, procedural terrain generation, custom inventory toolbars, biome simulation, and block building in the browser.",
    technologies: ["JavaScript", "Three.js", "WebGL", "Canvas API", "Procedural Generation"],
    image: "/images/projects/project-voxelcraft.webp",
    imageAlt: "Voxel Craft browser gameplay showing voxel terrain, trees, inventory toolbar, and sky",
    liveUrl: "https://satyajeet-voxelcraft.netlify.app",
    githubUrl: null,
    featured: true,
  },
  {
    id: "taskmate-ai",
    title: "TaskMate AI",
    category: "PRODUCTIVITY & AI AGENTS",
    description:
      "An intelligent productivity workspace with conversational AI task management, real-time efficiency scoring, weekly habit insights, interactive chatbot assistance, and gamified achievement streaks.",
    technologies: ["React", "Next.js", "AI Integration", "Productivity Analytics", "Modern UI"],
    image: "/images/projects/project-taskmate.webp",
    imageAlt: "TaskMate AI dashboard showing task manager, efficiency score gauge, and conversational assistant",
    liveUrl: "https://satyajeet-taskmate-ai.netlify.app",
    githubUrl: null,
    featured: true,
  },
  {
    id: "rolls-royce",
    title: "Rolls-Royce Experience",
    category: "LUXURY AUTOMOTIVE DIGITAL",
    description:
      "An ultra-premium cinematic digital showcase and interactive product tour for the Rolls-Royce Black Badge Cullinan, engineered with immersive sound, bespoke typography, and editorial visual staging.",
    technologies: ["Next.js", "TypeScript", "SCSS", "Audio API", "Cinematic Motion"],
    image: "/images/projects/project-rollsroyce.webp",
    imageAlt: "Rolls-Royce Black Badge Cullinan luxury automotive digital showcase in desert sunset",
    liveUrl: "https://satyajeet-rollsroyce.netlify.app/",
    githubUrl: null,
    featured: true,
  },
  {
    id: "rolex-deepsea",
    title: "Rolex Deepsea Experience",
    category: "HOROLOGICAL DECONSTRUCTION",
    description:
      "A luxury horological digital journey exploring the engineering of the Rolex Oyster Perpetual Deepsea, featuring seabed depth simulation (3,900m), Ringlock System anatomy, and audio ambiance.",
    technologies: ["React", "TypeScript", "Canvas Graphics", "Interactive Audio", "Luxury UI/UX"],
    image: "/images/projects/project-rolex.webp",
    imageAlt: "Rolex Deepsea Sea-Dweller 3,900m underwater seabed luxury digital deconstruction",
    liveUrl: "https://satyajeet-rolex.vercel.app/",
    githubUrl: null,
    featured: true,
  },
  {
    id: "aerojeet-drone",
    title: "AEROJEET Drone",
    category: "AUTONOMOUS ROBOTICS & AVIONICS",
    description:
      "Autonomous drone avionics and telemetry control architecture engineered with orange carbon aerofoil wings, dual-GPS RTK positioning, optical gimbal telemetry, and mission flight control.",
    technologies: ["Python", "Embedded C++", "Drone Avionics", "Autonomous Flight", "Robotics"],
    image: "/images/projects/project-aerojeet.webp",
    imageAlt: "AEROJEET Autonomous Drone with orange wings and telemetry HUD",
    liveUrl: null,
    githubUrl: "https://github.com/Satyajeet-Behera/AEROJEET-DRONE",
    featured: true,
  },
  {
    id: "vibe-app",
    title: "Vibe",
    category: "SOCIAL MEDIA & MOBILE UI",
    description:
      "A minimalist dark-mode mobile social application inspired by modern photo-sharing platforms, featuring ephemeral stories, real-time activity feeds, rich media cards, and fluid touch interactions.",
    technologies: ["React Native", "TypeScript", "Next.js", "Cloud Backend", "Dark UI Design"],
    image: "/images/projects/project-vibe.webp",
    imageAlt: "Vibe dark-mode social media mobile application interface showing stories and posts",
    liveUrl: null,
    githubUrl: "https://github.com/Satyajeet-Behera/Vibe-app",
    featured: true,
  },
  {
    id: "magix-ai",
    title: "Magix",
    category: "PERSONAL AI ASSISTANT",
    description:
      "A personal autonomous AI assistant developed by Satyajeet Behera, powered by voice intelligence, multimodal comprehension, device sensor integration, and real-time execution pipelines.",
    technologies: ["TypeScript", "Autonomous Agents", "Speech Recognition", "NLP", "Neural Models"],
    image: "/images/projects/project-magix.webp",
    imageAlt: "Magix Autonomous AI Assistant core logo with glowing electric cyan concentric rings",
    liveUrl: null,
    githubUrl: "https://github.com/Satyajeet-Behera/Magix",
    featured: true,
  },
];
