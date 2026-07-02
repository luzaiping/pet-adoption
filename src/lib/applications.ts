// CLAUDE-REVIEW

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

export type Application = {
  id: string;
  message?: string | null;
  createdAt: Date;
  status: ApplicationStatus;
  pet: {
    id: string;
    name: string;
    images: {
      url: string;
    }[];
  };
}

export async function getUserApplications(userId: string): Promise<Application[]> {
  const result = await prisma.adoptionApplication.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      message: true,
      createdAt: true,
      status: true,
      pet: {
        select: {
          id: true,
          name: true,
          images: {
            select: {
              url: true,
            },
            where: {
              isPrimary: true,
            },
            take: 1,
          },
        },
      },
    },
  });
  return result;
}
