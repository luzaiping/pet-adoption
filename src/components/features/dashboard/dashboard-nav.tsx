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
    icon: ClipboardList,
    matchSubPath: false,
  },
  {
    href: '/dashboard/admin/applications',
    label: 'Applications Queue',
    icon: ShieldCheck,
    matchSubPath: true,
  },
  {
    href: '/dashboard/admin/pets',
    label: 'Pet Management',
    icon: ShieldCheck,
    matchSubPath: true,
  },
] as const;

export default function DashboardNav({ role }: Props) {
  const menuItems = role === Role.ADMIN ? adminMenuItems : [];

  const path = usePathname();

  return (
    menuItems.length > 0 && (
      <nav aria-label="Dashboard navigation" className="flex gap-2">
        {menuItems.map(({ href, label, icon: Icon, matchSubPath }) => {
          const hasPathMatched =
            path === href || (matchSubPath && path.startsWith(`${href}/`));
          return (
            <Button
              key={href}
              asChild
              variant={hasPathMatched ? 'link' : 'ghost'}
              className="justify-start"
            >
              <Link
                href={href}
                aria-current={hasPathMatched ? 'page' : undefined}
              >
                <Icon aria-hidden="true" />
                {label}
              </Link>
            </Button>
          );
        })}
      </nav>
    )
  );
}
