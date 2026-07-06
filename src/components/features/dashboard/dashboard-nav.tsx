'use client';

import { Button } from '@/components/ui/button';
import { Role } from '@prisma/client';
import { ClipboardList, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  role: Role;
};

const adminMenuItems = [
  {
    href: '/dashboard/admin',
    label: 'Overview',
    shortLabel: 'Overview',
    icon: ClipboardList,
    matchSubPath: false,
  },
  {
    href: '/dashboard/admin/applications',
    label: 'Applications Queue',
    shortLabel: 'Queue',
    icon: ShieldCheck,
    matchSubPath: true,
  },
  {
    href: '/dashboard/admin/pets',
    label: 'Pet Management',
    shortLabel: 'Pets',
    icon: ShieldCheck,
    matchSubPath: true,
  },
] as const;

export default function DashboardNav({ role }: Props) {
  const menuItems = role === Role.ADMIN ? adminMenuItems : [];

  const path = usePathname();

  return (
    menuItems.length > 0 && (
      <nav
        aria-label="Dashboard navigation"
        className="grid grid-cols-3 gap-1 sm:flex sm:gap-2"
      >
        {menuItems.map(
          ({ href, label, shortLabel, icon: Icon, matchSubPath }) => {
            const hasPathMatched =
              path === href || (matchSubPath && path.startsWith(`${href}/`));
            return (
              <Button
                key={href}
                asChild
                variant={hasPathMatched ? 'link' : 'ghost'}
                className="min-w-0 justify-center px-1 sm:justify-start sm:px-2.5"
              >
                <Link
                  href={href}
                  aria-current={hasPathMatched ? 'page' : undefined}
                >
                  <Icon className="hidden sm:block" aria-hidden="true" />
                  <span className="sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </Button>
            );
          },
        )}
      </nav>
    )
  );
}
