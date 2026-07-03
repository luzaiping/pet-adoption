import { Building2, Heart, PawPrint } from 'lucide-react';

import { getHomeStats } from '@/lib/home';

const STAT_ITEMS = [
  {
    key: 'availablePets',
    label: 'Available pets',
    icon: PawPrint,
  },
  {
    key: 'successfulAdoptions',
    label: 'Successful adoptions',
    icon: Heart,
  },
  {
    key: 'partnerShelters',
    label: 'Partner shelters',
    icon: Building2,
  },
] as const;

export async function StatsSection() {
  const stats = await getHomeStats();

  return (
    <section className="px-4 sm:px-6 lg:px-8" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        PetAdopt at a glance
      </h2>

      <dl className="mx-auto grid max-w-7xl grid-cols-3 overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/10">
        {STAT_ITEMS.map(({ key, label, icon: Icon }, index) => (
          <div
            key={key}
            className="relative flex flex-col items-center justify-center gap-2 px-2 py-6 text-center sm:flex-row sm:gap-4 sm:px-6 sm:py-8 sm:text-left"
          >
            {index > 0 && (
              <span
                className="absolute inset-y-5 left-0 w-px bg-primary-foreground/20"
                aria-hidden="true"
              />
            )}

            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/12 sm:size-11">
              <Icon className="size-4 sm:size-5" aria-hidden="true" />
            </span>
            <span>
              <dt className="text-[0.65rem] leading-tight text-primary-foreground/75 sm:text-sm">
                {label}
              </dt>
              <dd className="mt-1 font-heading text-2xl font-semibold leading-none sm:text-3xl">
                {stats[key]}
              </dd>
            </span>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function StatsSectionSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="mx-auto grid max-w-7xl grid-cols-3 overflow-hidden rounded-2xl bg-primary/85">
        {STAT_ITEMS.map(({ key }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-2 px-2 py-6 sm:flex-row sm:justify-center sm:gap-4 sm:px-6 sm:py-8"
          >
            <span className="size-9 animate-pulse rounded-full bg-primary-foreground/15 sm:size-11" />
            <span className="flex flex-col items-center gap-2 sm:items-start">
              <span className="h-2.5 w-14 animate-pulse rounded bg-primary-foreground/15 sm:w-24" />
              <span className="h-6 w-8 animate-pulse rounded bg-primary-foreground/20" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
