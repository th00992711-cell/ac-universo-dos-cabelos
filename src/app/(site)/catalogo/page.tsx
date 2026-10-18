import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/catalog-view";
import { PageHero } from "@/components/site/page-hero";
import { hasActiveFilters, parseCatalogParams } from "@/lib/catalog-params";
import { getCategories } from "@/lib/services/catalog";

export async function generateMetadata({ searchParams }: PageProps<"/catalogo">): Promise<Metadata> {
  const filters = parseCatalogParams(await searchParams);
  const category = filters.categoria ? (await getCategories()).find((c) => c.slug === filters.categoria) : undefined;
  return {
    title: category ? `${category.name} | Catálogo` : "Catálogo de cabelos",
    description: "Veja todos os cabelos da AC Universo dos Cabelos e filtre por categoria, textura, comprimento, cor e preço.",
    alternates: { canonical: category ? `/categorias/${category.slug}` : "/catalogo" },
    // Combinações de filtros não precisam ser indexadas, apenas a página principal.
    robots: hasActiveFilters(filters) || filters.pagina > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function CatalogPage({ searchParams }: PageProps<"/catalogo">) {
  const filters = parseCatalogParams(await searchParams);
  return (
    <>
      <PageHero eyebrow="Catálogo" title="Nossa coleção" description="Explore cabelos selecionados e encontre a textura, o comprimento e a cor ideais para você." />
      <div className="container-page pt-10 pb-24 sm:pt-14">
        <CatalogView filters={filters} basePath="/catalogo" />
      </div>
    </>
  );
}
