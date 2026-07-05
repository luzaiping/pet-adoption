import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/pagination';
import { AdminPetFilters } from '@/components/features/pets/admin-pet-filters';
import { AdminPetList } from '@/components/features/pets/admin-pet-list';
import {
  AdminPetSort,
  getDistinctSpecies,
  getPetsForAdmin,
} from '@/lib/pets';
import { PetStatus } from '@prisma/client';

type AdminPetsPageProps = {
  searchParams: Promise<{
    name?: string | string[];
    species?: string | string[];
    age?: string | string[];
    status?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

function readSingleParam(value?: string | string[]) {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminPetsPage({
  searchParams,
}: AdminPetsPageProps) {
  const params = await searchParams;
  const name = readSingleParam(params.name)?.trim().slice(0, 50) || undefined;
  const species = readSingleParam(params.species) || undefined;
  const ageParam = readSingleParam(params.age);
  const parsedAge = ageParam === undefined ? undefined : Number(ageParam);
  const age =
    parsedAge !== undefined &&
    Number.isInteger(parsedAge) &&
    parsedAge >= 0 &&
    parsedAge <= 20
      ? parsedAge
      : undefined;
  const sort: AdminPetSort =
    readSingleParam(params.sort) === 'oldest' ? 'oldest' : 'newest';
  const statusParam = readSingleParam(params.status);
  const status =
    statusParam === PetStatus.AVAILABLE || statusParam === PetStatus.ADOPTED
      ? statusParam
      : undefined;
  const page = Math.max(1, Number(readSingleParam(params.page)) || 1);

  const [{ pets, totalCount, totalPages }, speciesOptions] = await Promise.all([
    getPetsForAdmin({ name, species, age, status, sort, page }),
    getDistinctSpecies(),
  ]);

  function createHref(nextPage: number) {
    const url = new URLSearchParams();

    if (name) url.set('name', name);
    if (species) url.set('species', species);
    if (age !== undefined) url.set('age', String(age));
    if (status) url.set('status', status);
    if (sort === 'oldest') url.set('sort', sort);
    if (nextPage > 1) url.set('page', String(nextPage));

    const query = url.toString();
    return query
      ? `/dashboard/admin/pets?${query}`
      : '/dashboard/admin/pets';
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="mx-auto w-full max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm font-medium text-primary">Pet management</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Pets
            </h1>
            <p className="text-muted-foreground">
              Search, review, and update every pet profile in the adoption
              catalog.
            </p>
          </div>
          <Button asChild className="sm:self-end">
            <Link href="/dashboard/admin/pets/new">
              <PlusIcon />
              Add pet
            </Link>
          </Button>
        </div>

        <AdminPetFilters speciesOptions={speciesOptions} />

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'pet' : 'pets'} found
          </p>
          {(name ||
            species ||
            age !== undefined ||
            status ||
            sort === 'oldest') && (
            <Button variant="link" asChild className="h-auto p-0">
              <Link href="/dashboard/admin/pets">Clear all filters</Link>
            </Button>
          )}
        </div>

        {pets.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
            <h2 className="font-heading text-xl font-semibold">
              No pets found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try changing your search or clearing the current filters.
            </p>
          </div>
        ) : (
          <>
            <AdminPetList pets={pets} />
            <Pagination
              page={page}
              totalPages={totalPages}
              createHref={createHref}
            />
          </>
        )}
      </div>
    </main>
  );
}
