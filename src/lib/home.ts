import { PetStatus, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const featuredPetInclude = {
  images: {
    where: { isPrimary: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: 1,
  },
} satisfies Prisma.PetInclude;

export type HomeStats = {
  availablePets: number;
  successfulAdoptions: number;
  partnerShelters: number;
};

export type FeaturedPet = Prisma.PetGetPayload<{
  include: typeof featuredPetInclude;
}>;

export async function getHomeStats(): Promise<HomeStats> {
  const [availablePets, successfulAdoptions, partnerShelters] =
    await Promise.all([
      prisma.pet.count({ where: { status: PetStatus.AVAILABLE } }),
      prisma.pet.count({ where: { status: PetStatus.ADOPTED } }),
      prisma.shelter.count(),
    ]);

  return { availablePets, successfulAdoptions, partnerShelters };
}

export async function getFeaturedPets(): Promise<FeaturedPet[]> {
  return prisma.pet.findMany({
    where: { status: PetStatus.AVAILABLE },
    include: featuredPetInclude,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 4,
  });
}
