import type { Metadata } from "next";
import { CategoryGrid } from "@/components/site/category-grid";
import { EmptyState } from "@/components/site/empty-state";
import { PageHero } from "@/components/site/page-hero";
import { getCategories } from "@/lib/services/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Categorias",
  description: "Cabelos lisos, ondulados, cacheados, crespos, mega hair e acessórios: navegue pelas categorias da AC Universo dos Cabelos.",
  alternates: { canonical: "/categorias" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHero eyebrow="Categorias" title="Escolha por estilo" description="Cada categoria reúne cabelos selecionados para diferentes texturas, ocasiões e personalidades." />
      <div className="container-page py-14 sm:py-20">
        {categories.length ? <CategoryGrid categories={categories} /> : <EmptyState title="Categorias em preparação" description="Em breve, nossas categorias estarão disponíveis aqui." />}
      </div>
    </>
  );
}
