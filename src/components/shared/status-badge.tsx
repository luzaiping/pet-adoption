import { Badge } from '@/components/ui/badge';
import { ApplicationStatus, PetStatus } from '@prisma/client';

type Status = PetStatus | ApplicationStatus;

const statusMap: Record<Status, { label: string; className: string }> = {
  AVAILABLE: {
    label: 'Available',
    className:
      'bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]',
  },
  ADOPTED: {
    label: 'Adopted',
    className:
      'bg-[var(--neutral)] text-[var(--neutral-foreground)] hover:bg-[var(--neutral)]',
  },
  PENDING: {
    label: 'Pending',
    className:
      'bg-[var(--warning)] text-[var(--warning-foreground)] hover:bg-[var(--warning)]',
  },
  REJECTED: {
    label: 'Rejected',
    className:
      'bg-destructive/10 text-destructive hover:bg-destructive/10',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    className:
      'bg-[var(--neutral)] text-[var(--neutral-foreground)] hover:bg-[var(--neutral)]',
  },
  APPROVED: {
    label: 'Approved',
    className:
      'bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]',
  },
};

type StatusBadgeProps = {
  status: Status;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = statusMap[status];

  return <Badge className={className}>{label}</Badge>;
}
