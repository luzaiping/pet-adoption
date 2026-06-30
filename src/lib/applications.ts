import { ApplicationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function getPendingPetApplicationByUserId(
  petId: string,
  userId: string,
) {
  const count = await prisma.adoptionApplication.count({
    where: {
      petId,
      userId,
      status: ApplicationStatus.PENDING,
    },
  });
  return count > 0;
}
