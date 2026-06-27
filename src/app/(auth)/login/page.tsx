import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoginForm } from '@/components/features/auth/login-form';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PawPrint className="size-5" />
        </span>
        <span className="font-heading text-xl font-semibold text-foreground">
          PetAdopt
        </span>
      </Link>

      <LoginForm />
    </main>
  );
}