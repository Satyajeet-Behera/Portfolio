// Centralized Site Configuration — Satyajeet Behera Portfolio

export const siteConfig = {
  name: 'Satyajeet Behera',
  title: 'Satyajeet Behera | Personal Portfolio',
  logo: '/images/logo.webp',
  description:
    'Explore the work, projects and experiments of Satyajeet Behera — building intelligent tools, autonomous agents and high-performance digital experiences.',
  eyebrow: '',
  mainHeading: "Hi, I'm Satyajeet Behera.",
  supportingDescription:
    "I enjoy turning ideas into meaningful digital experiences. From building intelligent tools and interactive games to experimenting with new technologies, I love exploring possibilities, solving problems and bringing ideas to life.",
  bottomHeroQuote: 'Curious by nature. Driven by ideas. Always building something new.',

  // Safe environment-based URL handling
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // Navigation configuration: matching exact section IDs
  navItems: [
    { label: 'Home', href: '/#hero', id: 'hero', enabled: true },
    { label: 'Intelligence', href: '/#intelligence', id: 'intelligence', enabled: true },
    { label: 'Magix', href: '/#magix', id: 'magix', enabled: true },
    { label: 'Cuber', href: '/#cuber', id: 'cuber', enabled: true },
    { label: 'Story', href: '/#story', id: 'story', enabled: true },
    { label: 'Interests', href: '/#interests', id: 'interests', enabled: true },
    { label: 'Projects', href: '/#projects', id: 'projects', enabled: true },
    { label: 'Contact', href: '/#contact', id: 'contact', enabled: true },
    { label: 'Blog', href: '/blog', id: 'blog', enabled: true },
  ],

  author: {
    name: 'Satyajeet Behera',
    role: 'Software Engineer & Developer',
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
