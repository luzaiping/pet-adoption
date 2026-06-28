export default function PetsLoading() {
  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex gap-2">
        <div className="h-10 w-16 animate-pulse rounded bg-muted" />
        <div className="h-10 w-20 animate-pulse rounded bg-muted" />
        <div className="h-10 w-20 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border bg-card"
          >
            <div className="aspect-4/3 animate-pulse bg-muted" />

            <div className="space-y-3 p-4">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}