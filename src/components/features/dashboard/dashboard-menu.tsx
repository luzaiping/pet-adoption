import { auth } from '@/auth';
import { signOutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Role } from '@prisma/client';
import { LogOut, PawPrint } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardNav from './dashboard-nav';

export async function DashboardMenu() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { name, email, role } = session.user;

  return (
    <header className="border-b bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-3">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-heading text-lg font-semibold leading-tight">
                PetAdopt
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {name || email || 'Home'}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground sm:inline-flex">
              {role === Role.ADMIN ? 'Admin' : 'Member'}
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
                <span className="sr-only sm:hidden">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
        <DashboardNav role={role} />
      </div>
    </header>
  );
}
