'use client';

import Image from 'next/image';
import { CalendarDays, Check, Loader2, Mail, UserRound, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AdminApplicationQueue } from '@/lib/admin/applications';

type QueuePet = AdminApplicationQueue[number];

type PetApplicationGroupProps = {
  pet: QueuePet;
  isMutating: boolean;
  activeApplicationId?: string;
  activeAction: 'approve' | 'reject';
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
};

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
});

function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function PetApplicationGroup({
  pet,
  isMutating,
  activeApplicationId,
  activeAction,
  onApprove,
  onReject,
}: PetApplicationGroupProps) {
  const primaryImage = pet.images[0];

  return (
    <Card className="overflow-hidden py-0 shadow-sm">
      <CardHeader className="border-b bg-card py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4">
        <div className="relative row-span-2 size-16 overflow-hidden rounded-lg bg-muted sm:size-20">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={pet.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{pet.name}</CardTitle>
            <Badge variant="secondary">
              {pet.applications.length}{' '}
              {pet.applications.length === 1 ? 'application' : 'applications'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {formatLabel(pet.species)}
            {pet.breed ? ` · ${pet.breed}` : ''}
            {pet.age !== null
              ? ` · ${pet.age} ${pet.age === 1 ? 'year' : 'years'} old`
              : ''}
          </p>
        </div>

        <Badge variant="outline" className="hidden sm:inline-flex">
          Pending review
        </Badge>
      </CardHeader>

      <CardContent className="divide-y px-0">
        {pet.applications.map((application) => {
          const isActive = activeApplicationId === application.id;

          return (
            <article
              key={application.id}
              className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
            >
              <div className="min-w-0 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                  <span className="flex items-center gap-2 font-medium">
                    <UserRound
                      className="text-muted-foreground size-4"
                      aria-hidden="true"
                    />
                    {application.applicant.name || 'Unnamed applicant'}
                  </span>
                  <a
                    href={`mailto:${application.applicant.email}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    <span className="truncate">
                      {application.applicant.email}
                    </span>
                  </a>
                  <span className="text-muted-foreground flex items-center gap-2 text-sm">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    Applied {dateFormatter.format(application.createdAt)}
                  </span>
                </div>

                <div className="bg-muted/60 rounded-lg px-3 py-2.5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Applicant message
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {application.message || 'No message was provided.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  disabled={isMutating}
                  onClick={() => onReject(application.id)}
                  aria-label={`Reject ${application.applicant.name || application.applicant.email}'s application for ${pet.name}`}
                >
                  {isActive && activeAction === 'reject' ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <X aria-hidden="true" />
                  )}
                  Reject
                </Button>
                <Button
                  type="button"
                  className="flex-1 sm:flex-none"
                  disabled={isMutating}
                  onClick={() => onApprove(application.id)}
                  aria-label={`Approve ${application.applicant.name || application.applicant.email}'s application for ${pet.name}`}
                >
                  {isActive && activeAction === 'approve' ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Check aria-hidden="true" />
                  )}
                  Approve
                </Button>
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
