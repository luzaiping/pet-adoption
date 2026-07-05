// CLAUDE-STUCK

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
    <main>
      <PetForm
        mode={Mode.Edit}
        defaultValues={defaultValues}
        speciesList={speciesList}
        shelterList={shelterList}
      />
    </main>
  );
}
