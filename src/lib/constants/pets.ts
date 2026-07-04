export const PET_SPECIES = ['Dog', 'Cat'] as const;

export type PetSpecies = (typeof PET_SPECIES)[number];

export const SPECIES_DOG = PET_SPECIES[0];
export const SPECIES_CAT = PET_SPECIES[1];

export const Mode = {
  Create: 'create',
  Edit: 'edit',
} as const;

export type Mode = (typeof Mode)[keyof typeof Mode];
