import { ArrowRight, PawPrint } from 'lucide-react';
import Link from 'next/link';

import { PetCard } from '@/components/features/pets/pet-card';
import { Button } from '@/components/ui/button';
import { getFeaturedPets } from '@/lib/home';

export async function FeaturedPetsSection() {
  const pets = await getFeaturedPets();

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Featured pets
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Meet pets looking for a home
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              A few wonderful companions currently available for adoption.
            </p>
          </div>

          <Button asChild variant="outline" className="self-start sm:self-auto">
            <Link href="/pets">
              View all pets
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {pets.length > 0 ? (
          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="mt-9 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 px-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-heading text-xl font-semibold">
              No pets are available right now
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Please check back soon as shelters add new pets looking for a
              loving home.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function FeaturedPetsSectionSkeleton() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-hidden="true">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="mt-3 h-9 w-full max-w-sm rounded bg-muted" />
        <div className="mt-3 h-4 w-full max-w-lg rounded bg-muted" />

        <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border bg-card">
              <div className="aspect-4/3 bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-1/2 rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
