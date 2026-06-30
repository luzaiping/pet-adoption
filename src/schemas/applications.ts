import { z } from 'zod';

export const applicationSchema = z.object({
  message: z
    .string()
    .trim()
    .max(300, 'Message must be at most 300 characters.')
    .optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
