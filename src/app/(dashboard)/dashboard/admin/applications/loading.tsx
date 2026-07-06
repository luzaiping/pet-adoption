function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function AdminApplicationsLoading() {
  return (
    <main
      className="min-h-screen bg-muted/25"
      aria-busy="true"
      aria-label="Loading adoption review queue"
    >
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
            >
              <Skeleton className="size-10 shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-7 w-10" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div
              key={groupIndex}
              className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
            >
              <div className="grid gap-3 border-b px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4">
                <Skeleton className="size-16 sm:size-20" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="hidden h-5 w-24 rounded-full sm:block" />
              </div>

              <div className="divide-y">
                {Array.from({ length: 2 }).map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div className="space-y-3 rounded-lg bg-muted/60 px-3 py-2.5">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                    <div className="flex gap-2 sm:justify-end">
                      <Skeleton className="h-8 flex-1 sm:w-20 sm:flex-none" />
                      <Skeleton className="h-8 flex-1 sm:w-24 sm:flex-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
