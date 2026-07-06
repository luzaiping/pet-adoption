'use client';

import { withdrawApplicationAction } from '@/actions/applications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Application } from '@/lib/applications';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/status-badge';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApplicationStatus } from '@prisma/client';
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Loader2,
  MessageSquareText,
  PawPrint,
  RotateCcw,
} from 'lucide-react';

type Props = {
  applications: Application[];
};

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
});

export function ApplicationList({ applications }: Props) {
  const router = useRouter();

  const withdrawMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const result = await withdrawApplicationAction(applicationId);

      if (!result.success) {
        throw new Error(result.message ?? 'Failed to withdraw application.');
      }

      return result;
    },
    onSuccess: () => {
      toast.success('Application withdrawn successfully');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const pendingCount = applications.filter(
    (application) => application.status === ApplicationStatus.PENDING,
  ).length;

  return (
    <div className="min-h-screen bg-muted/25">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-2">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Your adoption journey
          </p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
                My applications
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6 sm:text-base">
                Follow every adoption request in one place and withdraw a
                pending application if your plans change.
              </p>
            </div>

            {applications.length > 0 && (
              <div className="text-muted-foreground flex shrink-0 items-center gap-2 text-sm">
                <ClipboardList className="size-4" aria-hidden="true" />
                <span>
                  {applications.length}{' '}
                  {applications.length === 1 ? 'application' : 'applications'}
                  {pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
                </span>
              </div>
            )}
          </div>
        </header>

        {applications.length > 0 ? (
          <section aria-label="Your adoption applications" className="space-y-5">
            {applications.map((application) => {
              const primaryImage = application.pet.images[0];
              const isWithdrawing =
                withdrawMutation.isPending &&
                withdrawMutation.variables === application.id;

              return (
                <Card key={application.id} className="py-0 shadow-sm">
                  <article className="grid md:grid-cols-[14rem_minmax(0,1fr)]">
                    <Link
                      href={`/pets/${application.pet.id}`}
                      className="group/image relative aspect-4/3 overflow-hidden bg-muted md:self-start"
                      aria-label={`View ${application.pet.name}`}
                    >
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={application.pet.name}
                          fill
                          sizes="(min-width: 768px) 224px, 100vw"
                          className="object-cover transition-transform duration-300 group-hover/image:scale-105"
                        />
                      ) : (
                        <span className="text-muted-foreground flex h-full min-h-44 items-center justify-center">
                          <PawPrint className="size-8" aria-hidden="true" />
                        </span>
                      )}
                    </Link>

                    <CardContent className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <Link
                            href={`/pets/${application.pet.id}`}
                            className="group/title inline-flex items-center gap-1.5"
                          >
                            <h2 className="font-heading truncate text-2xl">
                              {application.pet.name}
                            </h2>
                            <ArrowUpRight
                              className="text-muted-foreground size-4 transition-transform group-hover/title:-translate-y-0.5 group-hover/title:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                            <CalendarDays className="size-4" aria-hidden="true" />
                            Applied {dateFormatter.format(application.createdAt)}
                          </p>
                        </div>

                        <StatusBadge status={application.status} />
                      </div>

                      <div className="bg-muted/60 flex-1 rounded-lg px-4 py-3">
                        <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                          <MessageSquareText className="size-3.5" aria-hidden="true" />
                          Your message
                        </p>
                        <p className="mt-1.5 text-sm leading-6">
                          {application.message || 'No message was provided.'}
                        </p>
                      </div>

                      {application.status === ApplicationStatus.PENDING && (
                        <div className="flex justify-end border-t pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              withdrawMutation.mutate(application.id)
                            }
                            disabled={withdrawMutation.isPending}
                          >
                            {isWithdrawing ? (
                              <Loader2 className="animate-spin" aria-hidden="true" />
                            ) : (
                              <RotateCcw aria-hidden="true" />
                            )}
                            {isWithdrawing ? 'Withdrawing...' : 'Withdraw application'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </article>
                </Card>
              );
            })}
          </section>
        ) : (
          <Card className="border-dashed bg-card/70 py-14">
            <CardContent className="flex flex-col items-center text-center">
              <span className="bg-secondary text-primary mb-4 flex size-12 items-center justify-center rounded-full">
                <PawPrint className="size-6" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl">No applications yet</h2>
              <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
                When you find a pet that feels like the right match, your
                application and its review status will appear here.
              </p>
              <Button asChild className="mt-5">
                <Link href="/pets">Browse available pets</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
