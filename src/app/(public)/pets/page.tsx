import { getPets } from '@/lib/pets';
import { PetCard } from '@/components/features/pets/pet-card';
import { PetFilters } from '@/components/features/pets/pet-filters';
import { Pagination } from '@/components/shared/pagination';
import Link from 'next/link';
import { SPECIES_CAT, SPECIES_DOG } from '@/lib/constants/pets';

type PetsPageProps = {
  searchParams: Promise<{
    species?: string | string[];
    page?: string | string[];
  }>;
};

export default async function PetsPage({ searchParams }: PetsPageProps) {
  const params = await searchParams;

  const species =
    params.species === SPECIES_DOG || params.species === SPECIES_CAT
      ? params.species
      : undefined;

  const page = Math.max(1, Number(params.page) || 1);

  const { pets, totalPages } = await getPets({
    species,
    page,
  });

  function createHref(nextPage: number) {
    const url = new URLSearchParams();

    if (species) {
      url.set('species', species);
    }

    if (nextPage > 1) {
      url.set('page', String(nextPage));
    }

    const query = url.toString();

    return query ? `/pets?${query}` : '/pets';
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <PetFilters />

      {pets.length === 0 ? (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            No pets match your current filter.
          </p>

          <Link
            href="/pets"
            className="text-primary underline underline-offset-4"
          >
            Clear filter
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            createHref={createHref}
          />
        </>
      )}
    </div>
  );
}
