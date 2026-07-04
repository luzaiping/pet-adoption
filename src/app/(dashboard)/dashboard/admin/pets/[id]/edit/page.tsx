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

type AdminPetPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPetsEditPage({ params }: AdminPetPageProps) {
  const { id } = await params;

  const pet = (await getPetById(id)) as UpdatePetForm;

  if (!pet) {
    notFound();
  }

  const [speciesList, shelterList] = await Promise.all([
    getDistinctSpecies(),
    getSheltersForSelect(),
  ]);

  return (
    <main>
      <PetForm
        mode={Mode.Edit}
        defaultValues={pet}
        speciesList={speciesList}
        shelterList={shelterList}
      />
    </main>
  );
}
