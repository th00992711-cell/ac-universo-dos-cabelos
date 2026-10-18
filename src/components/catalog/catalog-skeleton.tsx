import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Carregando produtos">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <Skeleton className="aspect-[4/5] rounded-none" />
          <div className="grid gap-3 p-4 sm:p-5">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
