export default function PetDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-4/3 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-3">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}