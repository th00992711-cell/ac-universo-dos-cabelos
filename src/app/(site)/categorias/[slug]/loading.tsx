import { ProductGridSkeleton } from "@/components/catalog/catalog-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page grid gap-10 pt-16 pb-24">
      <div className="grid justify-items-center gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-72" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
