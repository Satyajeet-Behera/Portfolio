/**
 * Centralized Content Configuration for Interests Section
 * Phase 3 — Personal Passions & Editorial Showcase
 */

export interface InterestItem {
  id: string;
  number: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  image: {
    src: string;
    fallback: string;
    alt: string;
    width: number;
    height: number;
  };
}

export interface InterestsContent {
  eyebrow: string;
  heading: string;
  items: InterestItem[];
  bottomStatement: string;
  bottomTranslationHint?: string;
}

export const interestsContent: InterestsContent = {
  eyebrow: "PASSIONS • MACHINES • HOROLOGY",
  heading: "What I Like?",
  items: [
    {
      id: "bikes",
      number: "01",
      category: "MOTORCYCLES",
      title: "Bikes",
      subtitle: "Precision Engineering on Two Wheels",
      description: "Agile dynamics, raw mechanical soundtrack, and the unfiltered thrill of the open road.",
      image: {
        src: "/images/interest-bike.webp",
        fallback: "/images/interest-bike.jpg",
        alt: "Triumph Street Triple 765 high-performance motorcycle in iconic yellow livery",
        width: 720,
        height: 697,
      },
    },
    {
      id: "cars",
      number: "02",
      category: "AUTOMOBILES",
      title: "Cars",
      subtitle: "Performance, Aerodynamics & Design",
      description: "The synthesis of aerodynamic form, precision chassis dynamics, and visceral driving engagement.",
      image: {
        src: "/images/interest-car.webp",
        fallback: "/images/interest-car.jpg",
        alt: "High-performance sports sedan with aggressive aerodynamic styling and bespoke forged wheels",
        width: 716,
        height: 768,
      },
    },
    {
      id: "watches",
      number: "03",
      category: "HOROLOGY",
      title: "Watches",
      subtitle: "Mechanical Mastery & Timeless Craft",
      description: "Micro-mechanical craftsmanship, coaxial escapements, and the enduring romance of analog timekeeping.",
      image: {
        src: "/images/interest-watch.webp",
        fallback: "/images/interest-watch.jpg",
        alt: "Omega Seamaster Diver 300M Co-Axial Master Chronometer timepiece with titanium mesh bracelet",
        width: 720,
        height: 797,
      },
    },
  ],
  bottomStatement: "Mujhe Bachpan se hi Ghadiyon aur Gaadiyon ka bahaut shauk hai.",
};
