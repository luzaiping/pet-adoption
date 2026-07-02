'use server';

import { assertAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus, PetStatus } from '@prisma/client';

export async function approveApplicationAction(
  applicationId: string,
  petId: string,
): Promise<void> {
  const user = await assertAdmin();

  await prisma.$transaction(async (tx) => {
    const reviewedAt = new Date();

    await tx.adoptionApplication.updateMany({
      data: {
        reviewerId: user.id,
        reviewedAt,
        status: ApplicationStatus.REJECTED,
      },
      where: {
        petId,
        id: {
          not: applicationId,
        },
        status: ApplicationStatus.PENDING,
      },
    });

    await tx.adoptionApplication.update({
      data: {
        reviewerId: user.id,
        reviewedAt,
        status: ApplicationStatus.APPROVED,
      },
      where: {
        id: applicationId,
      },
    });

    await tx.pet.update({
      data: {
        status: PetStatus.ADOPTED,
      },
      where: {
        id: petId,
      },
    });
  });
}

export async function rejectApplicationAction(
  applicationId: string,
): Promise<boolean> {
  const user = await assertAdmin();

  await prisma.adoptionApplication.update({
    data: {
      reviewedAt: new Date(),
      reviewerId: user.id,
      status: ApplicationStatus.REJECTED,
    },
    where: {
      id: applicationId,
    },
  });

  return true;
}
