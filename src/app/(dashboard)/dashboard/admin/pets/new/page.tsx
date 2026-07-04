// CLAUDE-STUCK

import { PetForm } from '@/components/features/admin/pet-form';
import { Mode } from '@/lib/constants/pets';
import {
  getDistinctSpecies,
  getSheltersForSelect
} from '@/lib/pets';
import { CreatePetForm } from '@/schemas/pets';
import { PetGender } from '@prisma/client';

const defaultValues: CreatePetForm = {
  name: '',
  species: '',
  breed: '',
  age: undefined,
  gender: PetGender.UNKNOWN,
  description: undefined,
  shelterId: '',
};

export default async function AdminPetCreatePage() {
  const [speciesList, shelterList] = await Promise.all([
    getDistinctSpecies(),
    getSheltersForSelect(),
  ]);

  return (
    <main>
      <PetForm
        mode={Mode.Create}
        defaultValues={defaultValues}
        speciesList={speciesList}
        shelterList={shelterList}
      />
    </main>
  );
}
