import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page grid gap-10 pt-10 pb-20 lg:grid-cols-2 lg:gap-16">
      <Skeleton className="aspect-[4/5] rounded-3xl" />
      <div className="grid content-start gap-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-14 w-full rounded-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
