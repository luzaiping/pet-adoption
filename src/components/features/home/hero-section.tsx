import { ArrowRight, Heart, PawPrint } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="pointer-events-none absolute -left-24 top-16 -z-10 size-72 rounded-full bg-secondary/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 -z-10 size-96 rounded-full bg-accent/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur-sm sm:text-sm">
            <PawPrint className="size-4" aria-hidden="true" />
            Find your new best friend
          </div>

          <h1 className="font-heading text-5xl font-semibold leading-[0.98] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-7xl">
            A loving home can{' '}
            <span className="text-primary">change everything.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Meet wonderful pets from local shelters and take the first step
            toward a lifetime of companionship.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-11 px-5 text-base">
              <Link href="/pets">
                Browse available pets
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>

            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart
                className="size-4 fill-accent text-accent-foreground"
                aria-hidden="true"
              />
              Your next chapter could start today.
            </p>
          </div>
        </div>

        <div className="relative mx-auto aspect-[5/4] w-full max-w-2xl">
          <div
            className="absolute right-2 top-0 size-28 rounded-full bg-accent sm:right-8 sm:size-36"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-3 left-7 size-24 rounded-full border-2 border-dashed border-primary/25 sm:size-32"
            aria-hidden="true"
          />

          <div className="absolute inset-y-5 right-0 w-[84%] overflow-hidden rounded-[2rem] border-4 border-card bg-card shadow-xl shadow-foreground/10 sm:rounded-[2.75rem]">
            <Image
              src="/pets/dog-02.jpg"
              alt="A cheerful white puppy waiting to be adopted"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, (min-width: 640px) 70vw, 84vw"
              className="object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/25 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="absolute bottom-0 left-0 aspect-square w-[34%] overflow-hidden rounded-[1.5rem] border-4 border-card bg-card shadow-lg sm:rounded-[2rem]">
            <Image
              src="/pets/cat-08.jpg"
              alt="A playful silver cat looking for a home"
              fill
              sizes="(min-width: 1024px) 18vw, (min-width: 640px) 24vw, 34vw"
              className="object-cover"
            />
          </div>

          <div className="absolute left-[4%] top-[9%] rounded-2xl border bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-sm sm:left-[8%] sm:px-4 sm:py-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-foreground sm:text-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground sm:size-8">
                <Heart className="size-4 fill-current" aria-hidden="true" />
              </span>
              Ready for a loving home
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
