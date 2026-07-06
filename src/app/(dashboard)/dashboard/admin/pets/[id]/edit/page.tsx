import { PetForm } from '@/components/features/admin/pet-form';
import { Mode } from '@/lib/constants/pets';
import {
  getDistinctSpecies,
  getSheltersForSelect,
  getPetById,
} from '@/lib/pets';
import { UpdatePetForm } from '@/schemas/pets';
import { notFound } from 'next/navigation';
import { COMMON_PET_IMAGE_PATH } from '@/lib/constants/pets';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AdminPetPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPetsEditPage({ params }: AdminPetPageProps) {
  const { id } = await params;

  const pet = await getPetById(id);

  if (!pet) {
    notFound();
  }

  const defaultValues: UpdatePetForm = {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? undefined,
    age: pet.age ?? undefined,
    gender: pet.gender,
    description: pet.description ?? undefined,
    shelterId: pet.shelterId,
    status: pet.status,
    image: pet.images[0]?.url ?? COMMON_PET_IMAGE_PATH,
  };

  const [speciesList, shelterList] = await Promise.all([
    getDistinctSpecies(),
    getSheltersForSelect(),
  ]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/dashboard/admin/pets">
              <ArrowLeftIcon />
              Back to pets
            </Link>
          </Button>
          <div className="max-w-2xl space-y-2">
            <p className="text-sm font-medium text-primary">Pet management</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Edit {pet.name}
            </h1>
            <p className="text-muted-foreground">
              Keep this profile accurate, current, and ready for potential
              adopters.
            </p>
          </div>
        </div>
        <PetForm
          mode={Mode.Edit}
          defaultValues={defaultValues}
          speciesList={speciesList}
          shelterList={shelterList}
        />
      </div>
    </main>
  );
}
