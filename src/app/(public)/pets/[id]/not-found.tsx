import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PetNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-heading text-2xl">Pet not found</h1>
      <p className="text-muted-foreground">
        This pet may have already been adopted or removed from our listings.
      </p>
      <Button asChild>
        <Link href="/pets">Browse all pets</Link>
      </Button>
    </div>
  );
}