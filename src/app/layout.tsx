import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const headingFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'PetAdopt',
  description: 'Find your new best friend.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
