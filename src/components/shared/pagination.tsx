import Link from 'next/link';

type PaginationProps = {
  page: number;
  totalPages: number;
  createHref: (page: number) => string;
};

export function Pagination({ page, totalPages, createHref }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={createHref(page - 1)}>Previous</Link>
      ) : (
        <span className="text-muted-foreground">Previous</span>
      )}
  
      <span className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </span>
  
      {page < totalPages ? (
        <Link href={createHref(page + 1)}>Next</Link>
      ) : (
        <span className="text-muted-foreground">Next</span>
      )}
    </div>
  );
}
