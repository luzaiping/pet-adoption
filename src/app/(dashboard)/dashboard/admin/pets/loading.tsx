function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function AdminPetsLoading() {
  return (
    <main
      className="min-h-[calc(100vh-4rem)] bg-muted/20"
      aria-busy="true"
      aria-label="Loading pets"
    >
      <div className="mx-auto w-full max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex items-end justify-between gap-4">
          <div className="w-full max-w-2xl space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-5 w-full max-w-lg" />
          </div>
          <Skeleton className="hidden h-8 w-24 sm:block" />
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>

          <div className="hidden grid-cols-4 gap-4 border-t pt-4 lg:grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>

          <div className="border-t pt-3 lg:hidden">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>

        <Skeleton className="h-4 w-24" />

        <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
          <div className="flex h-11 items-center gap-6 border-b bg-muted/40 px-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-16 flex-1" />
            ))}
          </div>
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex h-14 items-center gap-6 px-4"
              >
                {Array.from({ length: 7 }).map((_, cellIndex) => (
                  <Skeleton
                    key={cellIndex}
                    className="h-4 w-16 flex-1"
                  />
                ))}
                <Skeleton className="h-7 w-14" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-5 rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
