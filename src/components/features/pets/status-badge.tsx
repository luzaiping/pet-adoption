import { PetStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';

const statusMap: Record<PetStatus, { label: string; className: string }> = {
  AVAILABLE: {
    label: 'Available',
    className:
      'bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]',
  },
  PENDING: {
    label: 'Pending',
    className:
      'bg-[var(--warning)] text-[var(--warning-foreground)] hover:bg-[var(--warning)]',
  },
  ADOPTED: {
    label: 'Adopted',
    className:
      'bg-[var(--neutral)] text-[var(--neutral-foreground)] hover:bg-[var(--neutral)]',
  },
};

type StatusBadgeProps = {
  status: PetStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = statusMap[status];

  return <Badge className={className}>{label}</Badge>;
}
