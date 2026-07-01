'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PetStatus, ApplicationStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { applicationSchema } from '@/schemas/applications';

export type ApplicationFormState = {
  message?: string;
  success: boolean;
};

export async function submitApplicationAction(
  _preState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const petId = formData.get('petId') as string;
  const currentPath = `/pets/${petId}`;

  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${currentPath}`);
  }

  const message = formData.get('message') as string;
  const parsed = applicationSchema.safeParse({
    message,
  });

  if (!parsed.success) {
    return {
      message:
        parsed.error.issues[0]?.message ?? 'Message exceeds maxium length.',
      success: false,
    };
  }

  const existingPet = await prisma.pet.count({
    where: { id: petId },
  });

  if (!existingPet) {
    return {
      message: 'Pet does not exist, please check first.',
      success: false,
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const canApply = await tx.pet.findFirst({
      where: {
        id: petId,
        status: PetStatus.AVAILABLE,
        applications: {
          none: {
            userId: session?.user.id,
            status: ApplicationStatus.PENDING,
          },
        },
      },
    });

    if (!canApply) {
      return { message: 'Pet is not available.', success: false };
    }

    await tx.adoptionApplication.create({
      data: {
        message: parsed.data.message,
        userId: session?.user.id,
        petId: formData.get('petId') as string,
      },
    });

    return { success: true };
  });

  if (result.success) {
    revalidatePath(currentPath);
  }

  return result;
}

export type WithdrawActionResult = {
  success: boolean;
  message?: string;
};

export async function withdrawApplicationAction(
  applicationId: string,
): Promise<WithdrawActionResult> {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const updateResult = await prisma.adoptionApplication.updateMany({
    where: {
      id: applicationId,
      userId: session?.user?.id,
      status: ApplicationStatus.PENDING,
    },
    data: { status: ApplicationStatus.WITHDRAWN },
  });

  if (updateResult.count === 0) {
    return {
      success: false,
      message:
        'This application cannot be withdrawn. It may have already been reviewed.',
    };
  }

  const application = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    select: { petId: true },
  });

  revalidatePath('/dashboard/applications');
  if (application) {
    revalidatePath(`/pets/${application.petId}`);
  }

  return { success: true };
}
