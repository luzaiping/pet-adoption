import Link from 'next/link';
import { PencilIcon } from 'lucide-react';
import { PetGender, PetStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';

type AdminPet = {
  id: string;
  name: string;
  species: string;
  age: number | null;
  gender: PetGender;
  status: PetStatus;
  createdAt: Date;
  updatedAt: Date;
};

type AdminPetListProps = {
  pets: AdminPet[];
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const genderLabels: Record<PetGender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  UNKNOWN: 'Unknown',
};

export function AdminPetList({ pets }: AdminPetListProps) {
  const rows = pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    age: pet.age === null ? 'Unknown' : `${pet.age} yr`,
    gender: genderLabels[pet.gender],
    status: pet.status,
    createdAt: dateFormatter.format(pet.createdAt),
    updatedAt: dateFormatter.format(pet.updatedAt),
    editHref: `/dashboard/admin/pets/${pet.id}/edit`,
  }));

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Species</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-muted/25">
                  <td className="px-4 py-3.5 font-medium">{row.name}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {row.species}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {row.age}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {row.gender}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                    {row.createdAt}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                    {row.updatedAt}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={row.editHref} aria-label={`Edit ${row.name}`}>
                        <PencilIcon />
                        Edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.map((row) => (
          <article
            key={row.id}
            className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  {row.name}
                </h2>
                <p className="text-sm text-muted-foreground">{row.species}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Age</dt>
                <dd className="mt-0.5 font-medium">{row.age}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Gender</dt>
                <dd className="mt-0.5 font-medium">{row.gender}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd className="mt-0.5 font-medium">{row.createdAt}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Updated</dt>
                <dd className="mt-0.5 font-medium">{row.updatedAt}</dd>
              </div>
            </dl>

            <Button variant="outline" className="w-full" asChild>
              <Link href={row.editHref}>
                <PencilIcon />
                Edit pet
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
