'use client';

import { useActionState, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  submitApplicationAction,
  type ApplicationFormState,
} from '@/actions/applications';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Send, X } from 'lucide-react';

type Props = {
  petId: string;
  canApply: boolean;
  hasPendingApplication: boolean;
};

export function ApplicationPanel({
  petId,
  canApply,
  hasPendingApplication,
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    submitApplicationAction,
    {} as ApplicationFormState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success('Apply successfully, please wait for verifying.');
    }
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state.message, state.success]);

  if (hasPendingApplication) {
    return (
      <Card className="border-primary/20 bg-secondary/60">
        <CardContent className="flex gap-3 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Application submitted</p>
            <p className="text-sm text-muted-foreground">
              Your request is waiting for review. You can check updates from
              your dashboard once the shelter responds.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (canApply) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="font-heading text-xl">Adopt this pet</CardTitle>
          <p className="text-sm text-muted-foreground">
            Send a short note to the shelter. The message is optional, but it
            can help them understand your home and experience.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isFormOpen && (
            <Button
              type="button"
              className="w-full"
              onClick={() => setIsFormOpen(true)}
            >
              <Send className="size-4" />
              Apply to adopt
            </Button>
          )}

          {isFormOpen && (
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <input type="hidden" name="petId" value={petId} />
                <Label htmlFor="message">Message to the shelter</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Optional: tell us why you would like to adopt this pet."
                  maxLength={300}
                  className="min-h-28 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Keep it brief. You can share more details after the shelter
                  reviews your request.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" className="flex-1" disabled={isPending}>
                  <Send className="size-4" />
                  {isPending ? 'Submitting...' : 'Submit application'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isPending}
                >
                  <X className="size-4" />
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
