'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ClipboardList, PawPrint, UsersRound } from 'lucide-react';
import { toast } from 'sonner';

import {
  approveApplicationAction,
  rejectApplicationAction,
} from '@/actions/admin/applications';
import { PetApplicationGroup } from '@/components/features/admin/pet-application-group';
import { Card, CardContent } from '@/components/ui/card';
import type { AdminApplicationQueue } from '@/lib/admin/applications';

type ApplicationQueueProps = {
  initialQueue: AdminApplicationQueue;
};

type ApproveVariables = {
  applicationId: string;
  petId: string;
};

type RejectVariables = {
  applicationId: string;
  petId: string;
};

export function ApplicationQueue({ initialQueue }: ApplicationQueueProps) {
  const router = useRouter();
  const [queue, setQueue] = useState(initialQueue);

  useEffect(() => {
    setQueue(initialQueue);
  }, [initialQueue]);

  const approveMutation = useMutation({
    mutationFn: ({ applicationId, petId }: ApproveVariables) =>
      approveApplicationAction(applicationId, petId),
    onMutate: ({ petId }) => {
      const previousQueue = queue;

      setQueue((currentQueue) =>
        currentQueue.filter((pet) => pet.id !== petId),
      );

      return { previousQueue };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setQueue(context.previousQueue);
      }

      toast.error('The application could not be approved. Please try again.');
    },
    onSuccess: () => {
      toast.success('Application approved and competing requests closed.');
      router.refresh();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ applicationId }: RejectVariables) =>
      rejectApplicationAction(applicationId),
    onMutate: ({ applicationId, petId }) => {
      const previousQueue = queue;

      setQueue((currentQueue) =>
        currentQueue.flatMap((pet) => {
          if (pet.id !== petId) {
            return [pet];
          }

          const remainingApplications = pet.applications.filter(
            (application) => application.id !== applicationId,
          );

          return remainingApplications.length > 0
            ? [{ ...pet, applications: remainingApplications }]
            : [];
        }),
      );

      return { previousQueue };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setQueue(context.previousQueue);
      }

      toast.error('The application could not be rejected. Please try again.');
    },
    onSuccess: () => {
      toast.success('Application rejected.');
      router.refresh();
    },
  });

  const isMutating = approveMutation.isPending || rejectMutation.isPending;
  const activeApplicationId = approveMutation.isPending
    ? approveMutation.variables?.applicationId
    : rejectMutation.variables?.applicationId;
  const applicationCount = queue.reduce(
    (total, pet) => total + pet.applications.length,
    0,
  );

  return (
    <main className="min-h-screen bg-muted/25">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-2">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Admin workspace
          </p>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
                Adoption review queue
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6 sm:text-base">
                Review pending requests by pet. Approving one applicant closes
                every competing request for that pet.
              </p>
            </div>
          </div>
        </header>

        <section
          aria-label="Queue summary"
          className="grid gap-4 sm:grid-cols-2"
        >
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-lg">
                <PawPrint className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Pets awaiting review
                </p>
                <p className="font-heading text-2xl">{queue.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-lg">
                <UsersRound className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Pending applications
                </p>
                <p className="font-heading text-2xl">{applicationCount}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {queue.length > 0 ? (
          <section aria-label="Pending adoption applications" className="space-y-5">
            {queue.map((pet) => (
              <PetApplicationGroup
                key={pet.id}
                pet={pet}
                isMutating={isMutating}
                activeApplicationId={activeApplicationId}
                activeAction={approveMutation.isPending ? 'approve' : 'reject'}
                onApprove={(applicationId) =>
                  approveMutation.mutate({ applicationId, petId: pet.id })
                }
                onReject={(applicationId) =>
                  rejectMutation.mutate({ applicationId, petId: pet.id })
                }
              />
            ))}
          </section>
        ) : (
          <Card className="border-dashed bg-card/70 py-14">
            <CardContent className="flex flex-col items-center text-center">
              <span className="bg-secondary text-primary mb-4 flex size-12 items-center justify-center rounded-full">
                <ClipboardList className="size-6" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl">The queue is clear</h2>
              <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
                There are no pending adoption applications to review right
                now. New requests will appear here automatically.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
