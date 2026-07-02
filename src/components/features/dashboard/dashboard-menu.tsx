import { auth } from '@/auth';
import { signOutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Role } from '@prisma/client';
import { ClipboardList, LogOut, PawPrint, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const userMenuItems = [
  {
    href: '/dashboard/applications',
    label: 'My Applications',
    icon: ClipboardList,
  },
] as const;

const adminMenuItems = [
  {
    href: '/dashboard/admin/applications',
    label: 'Applications Queue',
    icon: ShieldCheck,
  },
] as const;

export async function DashboardMenu() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { name, email, role } = session.user;
  const menuItems =
    role === Role.ADMIN
      ? adminMenuItems
      : role === Role.USER
        ? userMenuItems
        : [];

  return (
    <header className="border-b bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={role === Role.ADMIN ? '/dashboard/admin' : '/dashboard'}
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
                {name || email || 'Dashboard'}
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

        {menuItems.length > 0 && (
          <nav aria-label="Dashboard navigation" className="flex gap-2">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost" className="justify-start">
                <Link href={href}>
                  <Icon aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
