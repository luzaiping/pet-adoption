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
import { revalidatePath } from 'next/cache';

function revalidatePetPaths(petId: string) {
  revalidatePath('/');
  revalidatePath('/pets');
  revalidatePath(`/pets/${petId}`);
  revalidatePath('/dashboard/admin/pets');
}

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

  let petId: string;

  try {
    const { image, ...petData } = parsedResult.data;

    const pet = await prisma.pet.create({
      data: {
        ...petData,
        status: PetStatus.AVAILABLE,
        images: {
          create: {
            url: image,
            isPrimary: true,
          },
        },
      },
    });
    petId = pet.id;
  } catch (_error) {
    return {
      success: false,
      message: 'Operation failed. Please try again later.',
    };
  }

  revalidatePetPaths(petId);

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

  const { id, image, ...data } = parsedResult.data;

  try {
    await prisma.pet.update({
      where: {
        id,
      },
      data: {
        ...data,
        images: {
          deleteMany: {},
          create: {
            url: image,
            isPrimary: true,
          },
        },
      },
    });
  } catch (_error) {
    return {
      success: false,
      message: 'Operation failed. Please try again later.',
    };
  }

  revalidatePetPaths(id);

  return { success: true };
}
