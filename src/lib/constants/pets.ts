export const PET_SPECIES = ['Dog', 'Cat'] as const;

export type PetSpecies = (typeof PET_SPECIES)[number];

export const SPECIES_DOG = PET_SPECIES[0];
export const SPECIES_CAT = PET_SPECIES[1];

const createPetImagePaths = (species: 'dog' | 'cat') =>
  Array.from(
    { length: 15 },
    (_, index) =>
      `/pets/${species}-${String(index + 1).padStart(2, '0')}.jpg`,
  );

export const DOG_PET_IMAGE_PATHS = createPetImagePaths('dog');
export const CAT_PET_IMAGE_PATHS = createPetImagePaths('cat');
export const COMMON_PET_IMAGE_PATH = '/pets/common.jpg';
const COMMON_PET_IMAGE_PATHS = [COMMON_PET_IMAGE_PATH];
const EMPTY_PET_IMAGE_PATHS: string[] = [];
export const PET_IMAGE_PATHS = [
  ...DOG_PET_IMAGE_PATHS,
  ...CAT_PET_IMAGE_PATHS,
  COMMON_PET_IMAGE_PATH,
];

export function normalizePetSpecies(value: string) {
  const trimmedValue = value.trim();

  return (
    trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1).toLowerCase()
  );
}

export function getPetImagePathsForSpecies(species: string) {
  if (!species) {
    return EMPTY_PET_IMAGE_PATHS;
  }

  if (species === SPECIES_DOG) {
    return DOG_PET_IMAGE_PATHS;
  }

  if (species === SPECIES_CAT) {
    return CAT_PET_IMAGE_PATHS;
  }

  return COMMON_PET_IMAGE_PATHS;
}

export const Mode = {
  Create: 'create',
  Edit: 'edit',
} as const;

export type Mode = (typeof Mode)[keyof typeof Mode];
