import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { type PetSpecies } from '@/lib/constants/pets';

const PAGE_SIZE = 12;

export type GetPetsOptions = {
  species?: PetSpecies,
  page?: number;
};

export async function getPets({
  species,
  page = 1
}: GetPetsOptions) {
  const where: Prisma.PetWhereInput = {};

  if (species) {
    where.species = species;
  }

  const [pets, totalCount] = await Promise.all([
    prisma.pet.findMany({
      where,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc'} ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.pet.count({ where })
  ]);

  return {
    pets,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  };
}

export async function getPetById(id: string) {
  return prisma.pet.findUnique({
    where: { id },
    include: {
      shelter: true,
      images: {
        orderBy: [
          { isPrimary: 'desc' },
          { createdAt: 'asc' }
        ]
      }
    }
  });
}

export { PAGE_SIZE };