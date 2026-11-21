import dynamic from 'next/dynamic';
import { Hero } from '@/components/sections/Hero/Hero';

const TonyStarkSection = dynamic(
  () =>
    import('@/components/sections/TonyStark/TonyStarkSection').then(
      (mod) => mod.TonyStarkSection
    )
);

const MagixSection = dynamic(
  () =>
    import('@/components/sections/Magix/MagixSection').then(
      (mod) => mod.MagixSection
    )
);

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <TonyStarkSection />
      <MagixSection />
    </main>
  );
}
