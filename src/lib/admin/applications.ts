import { prisma } from '@/lib/prisma';
import { ApplicationStatus, PetStatus } from '@prisma/client';

export async function getAdminApplicationQueue() {
  const results = await prisma.pet.findMany({
    where: {
      status: PetStatus.AVAILABLE,
      applications: {
        some: {
          status: ApplicationStatus.PENDING,
        },
      },
    },
    include: {
      images: {
        orderBy: [
          {
            isPrimary: 'desc',
          },
          {
            createdAt: 'asc',
          },
        ],
        take: 1,
      },
      applications: {
        where: {
          status: ApplicationStatus.PENDING,
        },
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        id: 'asc',
      },
    ],
  });

  return results;
}
