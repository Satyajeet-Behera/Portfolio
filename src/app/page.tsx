import { Hero } from '@/components/sections/Hero/Hero';
import { TonyStarkSection } from '@/components/sections/TonyStark/TonyStarkSection';
import { MagixSection } from '@/components/sections/Magix/MagixSection';

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <TonyStarkSection />
      <MagixSection />
    </main>
  );
}
