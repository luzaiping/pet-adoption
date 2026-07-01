import type { Session } from 'next-auth';

import { Role } from '@prisma/client';

import { auth } from '@/auth';

export async function assertAdmin(): Promise<Session['user']> {
  const session = await auth();

  if (!session?.user || session?.user.role !== Role.ADMIN) {
    throw new Error("You don't have permission to perform this operation.");
  }

  return session.user;
}
