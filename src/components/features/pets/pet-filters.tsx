'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { SPECIES_CAT, SPECIES_DOG } from '@/lib/constants/pets';

const filters = [
  {
    label: 'All',
    value: undefined,
  },
  {
    label: 'Dogs',
    value: SPECIES_DOG,
  },
  {
    label: 'Cats',
    value: SPECIES_CAT,
  },
];

export function PetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSpecies = searchParams.get('species') ?? undefined;

  function handleFilterChange(species?: string) {
    const params = new URLSearchParams(searchParams);

    if (species) {
      params.set('species', species);
    } else {
      params.delete('species');
    }

    // Reset to the first page whenever the filter changes.
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {filters.map((filter) => {
        const isActive = filter.value === currentSpecies;

        return (
          <Button
            key={filter.label}
            type="button"
            variant={isActive ? 'default' : 'outline'}
            onClick={() => handleFilterChange(filter.value)}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
