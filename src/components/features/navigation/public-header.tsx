import { Role } from '@prisma/client';
import { LogOut, PawPrint, UserRound } from 'lucide-react';
import Link from 'next/link';

import { signOutAction } from '@/actions/auth';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { isDemoMode } from '@/lib/auth-guards';
import { SwitchUser } from '@/components/features/navigation/switch-user';

const ROLE_LABELS: Record<Role, string> = {
  [Role.USER]: 'Adopter',
  [Role.STAFF]: 'Staff',
  [Role.ADMIN]: 'Admin',
};

export async function PublicHeader() {
  const [session, demoMode] = await Promise.all([
    auth(),
    Promise.resolve(isDemoMode()),
  ]);

  const user = session?.user;
  const role = user?.role;

  return (
    <header className="border-b bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-3">
              <PawPrint className="size-4.5" aria-hidden="true" />
            </span>
            <span className="hidden truncate font-heading text-lg font-semibold sm:inline">
              PetAdopt
            </span>
          </Link>

          <nav aria-label="Primary navigation">
            <Link
              href="/pets"
              className="whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Browse Pets
            </Link>
          </nav>
        </div>

        {demoMode && <SwitchUser currentRole={role} />}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {user && role ? (
            <>
              <div className="hidden min-w-0 items-center gap-2 sm:flex">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <UserRound className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block max-w-36 truncate text-sm font-medium">
                    {user.name || user.email}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {ROLE_LABELS[role]}
                  </span>
                </span>
              </div>

              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="icon-sm">
                  <LogOut aria-hidden="true" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              {!demoMode && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              )}
              <Button asChild size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
