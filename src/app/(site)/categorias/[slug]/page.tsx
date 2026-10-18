import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/catalog-view";
import { PageHero } from "@/components/site/page-hero";
import { hasActiveFilters, parseCatalogParams } from "@/lib/catalog-params";
import { getCategories } from "@/lib/services/catalog";

async function findCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function generateMetadata({ params, searchParams }: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const category = await findCategory((await params).slug);
  if (!category) return { title: "Categoria não encontrada" };
  const filters = parseCatalogParams(await searchParams);
  return {
    title: category.name,
    description: category.description ?? `${category.name} da AC Universo dos Cabelos. Atendimento personalizado pelo WhatsApp.`,
    alternates: { canonical: `/categorias/${category.slug}` },
    openGraph: category.image_url ? { images: [category.image_url] } : undefined,
    robots: hasActiveFilters(filters) || filters.pagina > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/categorias/[slug]">) {
  const category = await findCategory((await params).slug);
  if (!category) notFound();
  const filters = { ...parseCatalogParams(await searchParams), categoria: category.slug };

  return (
    <>
      <PageHero
        eyebrow="Categoria"
        title={category.name}
        description={category.description}
        crumbs={[
          { href: "/", label: "Início" },
          { href: "/categorias", label: "Categorias" },
          { href: `/categorias/${category.slug}`, label: category.name },
        ]}
      />
      <div className="container-page pt-10 pb-24 sm:pt-14">
        <CatalogView filters={filters} basePath={`/categorias/${category.slug}`} categoryId={category.id} lockedCategory />
      </div>
    </>
  );
}
