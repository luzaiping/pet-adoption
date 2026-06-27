'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/schemas/auth';

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password.' };
        default:
          return { error: 'Something went wrong. Please try again.' };
      }
    }

    // Auth.js signals a successful sign-in via an internal redirect
    // exception — re-throw anything that isn't an AuthError so Next.js
    // can still handle that redirect correctly.
    throw error;
  }
  return {};
}

export type RegisterFormState = {
  error?: string;
  values: {
    name?: string;
    email?: string;
  };
};

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  if (process.env.IS_DEMO === 'true') {
    return { error: 'Registration is disabled in demo mode.', values: {} };
  }

  const inputName = formData.get('name') as string;
  const inputEmail = formData.get('email') as string;

  const parsed = registerSchema.safeParse({
    name: inputName,
    email: inputEmail,
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  const values = { name: inputName, email: inputEmail };

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Invalid form data.',
      values,
    };
  }

  const { name, email, password } = parsed.data;


  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return { error: 'An account with this email already exists.', values };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'USER' },
  });

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: 'Account created, but automatic sign-in failed — please log in.',
        values
      };
    }
    throw error; // redirect throw from a successful signIn, must rethrow
  }

  return { values };
}
