import dynamic from 'next/dynamic';
import { Hero } from '@/components/sections/Hero/Hero';

// Dynamically split below-the-fold heavy interactive sections to minimize initial JS execution
// SSR is enabled by default to preserve 100% SEO, accessibility trees, and server-rendered HTML
const TonyStarkSection = dynamic(
  () => import('@/components/sections/TonyStark/TonyStarkSection').then((mod) => mod.TonyStarkSection)
);
const MagixSection = dynamic(
  () => import('@/components/sections/Magix/MagixSection').then((mod) => mod.MagixSection)
);
const CuberSection = dynamic(
  () => import('@/components/sections/Cuber/CuberSection').then((mod) => mod.CuberSection)
);
const StorySection = dynamic(
  () => import('@/components/sections/Story/StorySection').then((mod) => mod.StorySection)
);
const InterestsSection = dynamic(
  () => import('@/components/sections/Interests/InterestsSection').then((mod) => mod.InterestsSection)
);
const ProjectsSection = dynamic(
  () => import('@/components/sections/Projects/ProjectsSection').then((mod) => mod.ProjectsSection)
);
const ContactForm = dynamic(
  () => import('@/components/sections/ContactForm/ContactForm').then((mod) => mod.ContactForm)
);
const GoalsSection = dynamic(
  () => import('@/components/sections/Goals/GoalsSection').then((mod) => mod.GoalsSection)
);
const FinalContact = dynamic(
  () => import('@/components/sections/FinalContact/FinalContact').then((mod) => mod.FinalContact)
);

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <TonyStarkSection />
      <MagixSection />
      <CuberSection />
      <StorySection />
      <InterestsSection />
      <ProjectsSection />
      <ContactForm />
      <GoalsSection />
      <FinalContact />
    </main>
  );
}
