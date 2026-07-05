function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export function PetFormSkeleton() {
  return (
    <main
      className="min-h-[calc(100vh-4rem)] bg-muted/20"
      aria-busy="true"
      aria-label="Loading pet form"
    >
      <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="space-y-4">
          <Skeleton className="h-7 w-28" />
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="space-y-2 border-b bg-muted/20 px-6 py-5 sm:px-8">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="grid gap-8 px-6 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-full" />
                    {index === 1 && <Skeleton className="h-3 w-44" />}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="aspect-4/3 w-full rounded-xl" />
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-7 w-24" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t bg-muted/20 px-6 py-5 sm:px-8">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
    </main>
  );
}
