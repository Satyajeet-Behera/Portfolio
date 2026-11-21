import { Hero } from '@/components/sections/Hero/Hero';
import { TonyStarkSection } from '@/components/sections/TonyStark/TonyStarkSection';
import { MagixSection } from '@/components/sections/Magix/MagixSection';
import { CuberSection } from '@/components/sections/Cuber/CuberSection';
import { StorySection } from '@/components/sections/Story/StorySection';
import { InterestsSection } from '@/components/sections/Interests/InterestsSection';
import { ProjectsSection } from '@/components/sections/Projects/ProjectsSection';
import { ContactForm } from '@/components/sections/ContactForm/ContactForm';
import { GoalsSection } from '@/components/sections/Goals/GoalsSection';
import { FinalContact } from '@/components/sections/FinalContact/FinalContact';

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
