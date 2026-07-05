import { z } from 'zod';
import { PetGender, PetStatus } from '@prisma/client';
import {
  getPetImagePathsForSpecies,
  normalizePetSpecies,
  PET_IMAGE_PATHS,
} from '@/lib/constants/pets';

const petImageSchema = z.string().refine(
  (imagePath) => PET_IMAGE_PATHS.includes(imagePath),
  'Please select a valid pet image.',
);

const petFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'Name must be at least 2 characters.' })
    .max(50, { error: 'Name must be at most 50 characters.' }),
  species: z
    .string()
    .trim()
    .min(1, 'Species is required.')
    .transform(normalizePetSpecies),
  breed: z
    .string()
    .trim()
    .max(50, { error: 'Breed must be at most 50 characters.' })
    .optional(),
  age: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().min(0).max(20).optional(),
  ),
  gender: z
    .enum(PetGender, { error: 'Gender is invalid, please check.' })
    .default(PetGender.UNKNOWN),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  shelterId: z.string().min(1, 'Please select shelter.'),
  image: petImageSchema,
});

function validateImageMatchesSpecies(
  values: { species: string; image: string },
  context: z.RefinementCtx,
) {
  const allowedImages = getPetImagePathsForSpecies(values.species);

  if (!allowedImages.includes(values.image)) {
    context.addIssue({
      code: 'custom',
      path: ['image'],
      message: 'Please select an image that matches the pet species.',
    });
  }
}

export const createPetSchema = petFieldsSchema.superRefine(
  validateImageMatchesSpecies,
);

export const updatePetSchema = petFieldsSchema
  .extend({
    id: z.string(),
    status: z.enum(PetStatus),
  })
  .superRefine(validateImageMatchesSpecies);

export type CreatePetForm = z.infer<typeof createPetSchema>;

export type UpdatePetForm = z.infer<typeof updatePetSchema>;
