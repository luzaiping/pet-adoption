function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function ApplicationsLoading() {
  return (
    <main
      className="min-h-screen bg-muted/25"
      aria-busy="true"
      aria-label="Loading applications"
    >
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-3">
          <Skeleton className="h-4 w-44" />
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="w-full max-w-2xl space-y-3">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-4 w-32 shrink-0" />
          </div>
        </header>

        <div className="space-y-5">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="grid overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:grid-cols-[14rem_minmax(0,1fr)]"
            >
              <Skeleton className="aspect-4/3 rounded-none md:self-start" />
              <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-7 w-36" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>

                <div className="space-y-3 rounded-lg bg-muted/60 px-4 py-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="flex justify-end border-t pt-4">
                  <Skeleton className="h-8 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
