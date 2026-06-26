'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export async function loginAction(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
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
          return 'Invalid email or password.';
        default:
          return 'Something went wrong. Please try again.';
      }
    }

    // Auth.js signals a successful sign-in via an internal redirect
    // exception — re-throw anything that isn't an AuthError so Next.js
    // can still handle that redirect correctly.
    throw error;
  }
}