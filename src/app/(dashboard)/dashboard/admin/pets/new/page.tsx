// CLAUDE-STUCK

import { PetForm } from '@/components/features/admin/pet-form';
import { Mode } from '@/lib/constants/pets';
import {
  getDistinctSpecies,
  getSheltersForSelect
} from '@/lib/pets';
import { CreatePetForm } from '@/schemas/pets';
import { PetGender } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const defaultValues: CreatePetForm = {
  name: '',
  species: '',
  breed: '',
  age: undefined,
  gender: PetGender.UNKNOWN,
  description: undefined,
  shelterId: '',
  image: '',
};

export default async function AdminPetCreatePage() {
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
              Add a new pet
            </h1>
            <p className="text-muted-foreground">
              Create a complete profile so potential adopters can discover the
              right companion.
            </p>
          </div>
        </div>
        <PetForm
          mode={Mode.Create}
          defaultValues={defaultValues}
          speciesList={speciesList}
          shelterList={shelterList}
        />
      </div>
    </main>
  );
}
