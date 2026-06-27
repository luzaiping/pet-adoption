import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(50, 'Name must be at most 50 characters.'),
    email: z
      .email({ error: 'Please enter a valid email address' })
      .trim()
      .toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: `Password don't match`,
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
