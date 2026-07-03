import { Suspense } from 'react';

import {
  FeaturedPetsSection,
  FeaturedPetsSectionSkeleton,
} from '@/components/features/home/featured-pets-section';
import { HeroSection } from '@/components/features/home/hero-section';
import {
  StatsSection,
  StatsSectionSkeleton,
} from '@/components/features/home/stats-section';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <Suspense fallback={<StatsSectionSkeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<FeaturedPetsSectionSkeleton />}>
        <FeaturedPetsSection />
      </Suspense>
    </main>
  );
}
