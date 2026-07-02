import { Role } from '@prisma/client';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

type AuthenticatedAdmin = {
  id: string;
};

export async function assertAdmin(): Promise<AuthenticatedAdmin> {
  const session = await auth();

  if (!session?.user || session?.user.role !== Role.ADMIN) {
    throw new Error("You don't have permission to perform this operation.");
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!admin || admin.role !== Role.ADMIN) {
    throw new Error('Your session is no longer valid. Please sign in again.');
  }

  return { id: admin.id };
}

export function isDemoMode() {
  return process.env.IS_DEMO === 'true';
}
