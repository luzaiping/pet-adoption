import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPetById } from '@/lib/pets';
import { StatusBadge } from '@/components/features/pets/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { PetStatus } from '@prisma/client';
import { getPendingPetApplicationByUserId } from '@/lib/applications';
import { auth } from '@/auth';
import { ApplicationPanel } from '@/components/features/applications/panel';

// species is a plain string, gender is an enum — both formatted the same
// generic way ('DOG' -> 'Dog') rather than hardcoding a lookup map, since
// species isn't a closed enum and could grow without a migration.
function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

type PetDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const { id } = await params;
  const pet = await getPetById(id);

  if (!pet) {
    notFound();
  }

  const isAvailable = pet.status === PetStatus.AVAILABLE;

  const session = await auth();

  let hasPendingApplication = false;

  if (session?.user?.id) {
    hasPendingApplication = await getPendingPetApplicationByUserId(
      pet.id,
      session?.user?.id,
    );
  }

  const [primaryImage, ...secondaryImages] = pet.images;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-muted">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={pet.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          {secondaryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {secondaryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={image.url}
                    alt={pet.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pet info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-3xl">{pet.name}</h1>
            <StatusBadge status={pet.status} />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Species</dt>
              <dd>{formatLabel(pet.species)}</dd>
            </div>
            {pet.breed && (
              <div>
                <dt className="text-muted-foreground">Breed</dt>
                <dd>{pet.breed}</dd>
              </div>
            )}
            {pet.age !== null && (
              <div>
                <dt className="text-muted-foreground">Age</dt>
                <dd>
                  {pet.age} {pet.age === 1 ? 'year' : 'years'}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Gender</dt>
              <dd>{formatLabel(pet.gender)}</dd>
            </div>
          </dl>

          {pet.description && (
            <p className="text-sm leading-relaxed">{pet.description}</p>
          )}

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm font-medium">{pet.shelter.name}</p>
              {pet.shelter.address && (
                <p className="text-sm text-muted-foreground">
                  {pet.shelter.address}
                </p>
              )}
              {pet.shelter.phone && (
                <p className="text-sm text-muted-foreground">
                  {pet.shelter.phone}
                </p>
              )}
            </CardContent>
          </Card>

          <ApplicationPanel
            canApply={isAvailable}
            hasPendingApplication={hasPendingApplication}
            petId={pet.id}
          />
        </div>
      </div>
    </div>
  );
}
