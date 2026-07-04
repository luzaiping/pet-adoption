import { z } from 'zod';
import { PetGender, PetStatus } from '@prisma/client';

// TODO, need to uncomment when image picker is supported.
// const petImageSchema = z.object({
//   url: z.string(),
//   isPrimary: z.boolean().default(false),
// });

export const createPetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'Name must be at least 2 characters.' })
    .max(50, { error: 'Name must be at most 50 characters.' }),
  species: z
    .string()
    .trim()
    .min(1, 'Species is required.')
    .transform((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()),
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
  // TODO, need to uncomment when image picker is supported.
  // images: z.array(petImageSchema).min(1, 'Please select pet image.')
});

export const updatePetSchema = createPetSchema.extend({
  id: z.string(),
  status: z.enum(PetStatus),
});

export type CreatePetForm = z.infer<typeof createPetSchema>;

export type UpdatePetForm = z.infer<typeof updatePetSchema>;
