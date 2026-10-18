import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";
import { ProductGrid } from "@/components/site/product-grid";
import { hasActiveFilters } from "@/lib/catalog-params";
import { getCategories, getFilterOptions, searchProducts, type CatalogFilters } from "@/lib/services/catalog";
import { CatalogSidebar, CatalogToolbar } from "./catalog-filters";
import { ProductGridSkeleton } from "./catalog-skeleton";
import { Pagination } from "./pagination";

type Props = { filters: CatalogFilters; basePath: string; categoryId?: string | null; lockedCategory?: boolean };
type SharedProps = Omit<React.ComponentProps<typeof CatalogToolbar>, "total">;

/** Catálogo com filtros na lateral (desktop) ou em gaveta (celular). */
export async function CatalogView(props: Props) {
  const [categories, options] = await Promise.all([getCategories(), getFilterOptions()]);
  const categoryId = props.categoryId ?? (props.filters.categoria ? categories.find((c) => c.slug === props.filters.categoria)?.id ?? null : null);
  const shared = { filters: props.filters, options, categories, basePath: props.basePath, lockedCategory: props.lockedCategory };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <CatalogSidebar {...shared} />
      <div className="grid content-start gap-8">
        <Suspense key={JSON.stringify(props.filters)} fallback={<ResultsFallback {...shared} />}>
          <Results {...props} categoryId={categoryId} shared={shared} />
        </Suspense>
      </div>
    </div>
  );
}

function ResultsFallback(shared: SharedProps) {
  return (
    <>
      <CatalogToolbar {...shared} total={0} />
      <ProductGridSkeleton />
    </>
  );
}

async function Results({
  filters,
  basePath,
  lockedCategory,
  categoryId,
  shared,
}: Props & { shared: SharedProps }) {
  const unknownCategory = Boolean(filters.categoria && !categoryId && !lockedCategory);
  const { products, total } = unknownCategory ? { products: [], total: 0 } : await searchProducts(filters, categoryId);

  return (
    <>
      <CatalogToolbar {...shared} total={total} />
      {products.length ? (
        <>
          <ProductGrid products={products} priorityCount={4} />
          <Pagination filters={filters} total={total} basePath={basePath} lockedCategory={lockedCategory} />
        </>
      ) : (
        <EmptyState
          title={hasActiveFilters(filters) ? "Nenhum produto encontrado" : "Catálogo em preparação"}
          description={
            hasActiveFilters(filters)
              ? "Não encontramos produtos com essa combinação. Ajuste os filtros ou fale com uma consultora: podemos ajudar a encontrar o que você procura."
              : "Em breve, nossa seleção de cabelos estará disponível aqui."
          }
          action={
            hasActiveFilters(filters) ? (
              <Button asChild variant="outline">
                <Link href={basePath}>Limpar filtros</Link>
              </Button>
            ) : undefined
          }
        />
      )}
    </>
  );
}
