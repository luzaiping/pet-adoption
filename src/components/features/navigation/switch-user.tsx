'use client';

import { Role } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { useActionState, useEffect, useState } from 'react';
import { switchUserAction } from '@/actions/auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
  currentRole?: Role;
};

export function SwitchUser({ currentRole }: Props) {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState<Role>();
  const [state, formAction, isPending] = useActionState(switchUserAction, {
    success: false,
  });

  useEffect(() => {
    if (!state.success && state.message) {
      toast.error(state.message);
    }
    if (state.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="order-3 grid w-full grid-cols-2 gap-2 border-t pt-3 lg:order-0 lg:flex lg:w-auto lg:border-0 lg:pt-0"
      aria-label="Demo account options"
    >
      <Button
        type="submit"
        name="role"
        value={Role.USER}
        variant="secondary"
        size="sm"
        disabled={isPending || currentRole === Role.USER}
        onClick={() => setTargetRole(Role.USER)}
      >
        {isPending && targetRole === Role.USER && (
          <Loader2 className="mr-2 size-4 animate-spin" />
        )}
        {currentRole === Role.USER ? 'Adopter: Current' : 'Try as Adopter'}
      </Button>
      <Button
        type="submit"
        name="role"
        value={Role.ADMIN}
        variant="outline"
        size="sm"
        disabled={isPending || currentRole === Role.ADMIN}
        onClick={() => setTargetRole(Role.ADMIN)}
      >
        {isPending && targetRole === Role.ADMIN && (
          <Loader2 className="mr-2 size-4 animate-spin" />
        )}
        {currentRole === Role.ADMIN ? 'Admin: Current' : 'Try as Admin'}
      </Button>
    </form>
  );
}
