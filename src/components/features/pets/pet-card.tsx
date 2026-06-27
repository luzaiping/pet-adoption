'use client'

import Image from 'next/image';
import Link from 'next/link';

import { Pet, PetImage } from '@prisma/client';

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/features/pets/status-badge';

type PetCardProps = {
  pet: Pet & {
    images: PetImage[];
  };
};

export function PetCard({ pet }: PetCardProps) {
  const image = pet.images[0];

  return (
    <Link href={`/pets/${pet.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-4/3">
          <Image
            src={image?.url ?? '/placeholder.svg'}
            alt={pet.name}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />

          <div className="absolute top-3 right-3">
            <StatusBadge status={pet.status} />
          </div>
        </div>

        <CardContent className="space-y-2 p-4">
          <div>
            <h3 className="font-heading text-lg">{pet.name}</h3>

            <p className="text-muted-foreground text-sm">
              {pet.species}
              {pet.breed ? ` • ${pet.breed}` : ''}
            </p>
          </div>

          <div className="text-muted-foreground flex gap-4 text-sm">
            {pet.age !== null && <span>{pet.age} yrs</span>}

            <span>{pet.gender}</span>
          </div>

          {pet.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {pet.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}