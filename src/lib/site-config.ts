// Centralized Site Configuration — Satyajeet Behera Portfolio

export const siteConfig = {
  name: 'Satyajeet Behera',
  title: 'Satyajeet Behera | AI Enthusiast & Developer',
  description:
    'Explore the work and experiments of Satyajeet Behera, an AI enthusiast and developer building AI-powered tools, interactive games and digital experiences.',
  eyebrow: 'AI ENTHUSIAST • DEVELOPER • BUILDER',
  mainHeading: "Hi, I'm Satyajeet Behera.",
  supportingDescription:
    "I'm an AI enthusiast and developer who enjoys turning ideas into meaningful digital experiences. From building AI-powered tools and interactive games to experimenting with new technologies, I love exploring possibilities, solving problems and bringing ideas to life.",
  bottomHeroQuote: 'Curious by nature. Driven by ideas. Always building something new.',

  // Safe environment-based URL handling
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // Navigation configuration: only active/existing destinations are exposed
  navItems: [
    { label: 'Home', href: '/', active: true, enabled: true },
    { label: 'Intelligence', href: '#intelligence', active: false, enabled: true },
    { label: 'Magix', href: '#magix', active: false, enabled: true },
    { label: 'Cuber', href: '#cuber', active: false, enabled: true },
    { label: 'Story', href: '#story', active: false, enabled: true },
    { label: 'Interests', href: '#interests', active: false, enabled: true },
    { label: 'Goals', href: '#goals', active: false, enabled: true },
  ],

  author: {
    name: 'Satyajeet Behera',
    role: 'AI Enthusiast & Developer',
    knowsAbout: [
      'Artificial Intelligence',
      'Autonomous Agents',
      'Full Stack Development',
      'Next.js',
      'React',
      'TypeScript',
      'Creative Computing',
      'Interactive Web Experiences',
      'Speedcubing (3x3 Rubik\'s Cube)',
      'Automotive Design & Dynamics',
      'Horology & Mechanical Watchmaking',
      'Value Investing & Capital Allocation',
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
