import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPetNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-heading text-2xl">Page not found</h1>
      <p className="text-muted-foreground">
        You visited a not found page. Please confirm the page url.
      </p>
      <Button asChild>
        <Link href="/dashboard/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}