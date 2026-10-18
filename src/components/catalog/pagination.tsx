import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATALOG_PAGE_SIZE } from "@/lib/constants";
import { catalogQuery } from "@/lib/catalog-params";
import type { CatalogFilters } from "@/lib/services/catalog";
import { cn } from "@/lib/utils";

export function Pagination({ filters, total, basePath, lockedCategory }: { filters: CatalogFilters; total: number; basePath: string; lockedCategory?: boolean }) {
  const pages = Math.ceil(total / CATALOG_PAGE_SIZE);
  if (pages <= 1) return null;
  const current = Math.min(filters.pagina, pages);
  const href = (p: number) => `${basePath}${catalogQuery({ ...filters, pagina: p }, { includeCategory: !lockedCategory })}`;

  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - current) <= 1);

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1.5">
      {current > 1 && (
        <Link href={href(current - 1)} className="flex size-11 items-center justify-center rounded-full border border-border bg-card hover:border-gold" aria-label="Página anterior">
          <ChevronLeft className="size-4" />
        </Link>
      )}
      {numbers.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - numbers[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Link
            href={href(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(
              "flex size-11 items-center justify-center rounded-full border text-sm transition-colors",
              p === current ? "border-gold bg-gold font-semibold text-cocoa-deep" : "border-border bg-card hover:border-gold",
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      {current < pages && (
        <Link href={href(current + 1)} className="flex size-11 items-center justify-center rounded-full border border-border bg-card hover:border-gold" aria-label="Próxima página">
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
