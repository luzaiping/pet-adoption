import { Pet, PetImage, PetStatus, Prisma, Shelter } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { type PetSpecies } from '@/lib/constants/pets';

const PAGE_SIZE = 12;

export type GetPetsOptions = {
  species?: PetSpecies;
  page?: number;
};

export type AdminPetSort = 'newest' | 'oldest';

export type GetPetsForAdminOptions = {
  name?: string;
  species?: string;
  age?: number;
  status?: PetStatus;
  sort?: AdminPetSort;
  page?: number;
};

export async function getPets({ species, page = 1 }: GetPetsOptions) {
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
          take: 1,
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.pet.count({ where }),
  ]);

  return {
    pets,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  };
}

export async function getPetsForAdmin({
  name,
  species,
  age,
  status,
  sort = 'newest',
  page = 1,
}: GetPetsForAdminOptions) {
  const where: Prisma.PetWhereInput = {};

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  if (species) {
    where.species = species;
  }

  if (age !== undefined) {
    where.age = age;
  }

  if (status) {
    where.status = status;
  }

  const order = sort === 'oldest' ? 'asc' : 'desc';

  const [pets, totalCount] = await Promise.all([
    prisma.pet.findMany({
      where,
      select: {
        id: true,
        name: true,
        species: true,
        age: true,
        gender: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ createdAt: order }, { id: order }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.pet.count({ where }),
  ]);

  return {
    pets,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  };
}

export type PetWithRelations = Pet & {
  images: PetImage[];
  shelter: Shelter;
};

export async function getPetById(id: string) {
  return prisma.pet.findUnique({
    where: { id },
    include: {
      shelter: true,
      images: {
        orderBy: [
          // isPrimary desc puts the primary image first without extra JS sorting
          { isPrimary: 'desc' },
        ],
      },
    },
  });
}

export { PAGE_SIZE };

export async function getDistinctSpecies() {
  const rows = await prisma.pet.findMany({
    distinct: ['species'],
    select: {
      species: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  return rows.map((row) => row.species);
}

export async function getSheltersForSelect() {
  const rows = await prisma.shelter.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  return rows;
}
