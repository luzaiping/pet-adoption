'use server';

import { assertAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import {
  CreatePetForm,
  createPetSchema,
  UpdatePetForm,
  updatePetSchema,
} from '@/schemas/pets';
import { PetStatus } from '@prisma/client';
import { z } from 'zod';

export type PetActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      message?: string;
      fieldErrors?: Partial<Record<keyof UpdatePetForm, string[]>>;
    };

export async function createPetAction(
  formValues: CreatePetForm,
): Promise<PetActionResult> {
  try {
    await assertAdmin();
  } catch (_error) {
    return {
      success: false,
      message: "You don't have permission to perform this operation.",
    };
  }

  const parsedResult = createPetSchema.safeParse(formValues);

  if (!parsedResult.success) {
    // TODO, need to update while image picker is supported.
    const { fieldErrors } = z.flattenError(parsedResult.error);
    return {
      success: false,
      fieldErrors,
    };
  }

  try {
    await prisma.pet.create({
      data: {
        ...parsedResult.data,
        status: PetStatus.AVAILABLE,
        // TODO specify default images. need to update while image picker is supported.
        images: {
          create: [
            {
              url: '/pets/cat-01.jpg',
              isPrimary: true,
            },
          ],
        },
      },
    });
  } catch (_error) {
    return {
      success: false,
      message: 'Operation failed. Please try again later.',
    };
  }

  return { success: true };
}

export async function updatePetAction(
  formValues: UpdatePetForm,
): Promise<PetActionResult> {
  try {
    await assertAdmin();
  } catch (_error) {
    return {
      success: false,
      message: "You don't have permission to perform this operation.",
    };
  }

  const parsedResult = updatePetSchema.safeParse(formValues);

  if (!parsedResult.success) {
    // TODO, need to update while image picker is supported.
    const { fieldErrors } = z.flattenError(parsedResult.error);
    return {
      success: false,
      fieldErrors,
    };
  }

  const { id, ...data } = parsedResult.data;

  try {
    await prisma.pet.update({
      where: {
        id,
      },
      data: {
        ...data
        // TODO specify default images. need to update while image picker is supported.
        // images: {
        //   create: [
        //     {
        //       url: '/pets/cat-01.jpg',
        //       isPrimary: true,
        //     },
        //   ],
        // },
      },
    });
  } catch (_error) {
    return {
      success: false,
      message: 'Operation failed. Please try again later.',
    };
  }

  return { success: true };
}
