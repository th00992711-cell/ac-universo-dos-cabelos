import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/lib/services/catalog";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProductSlugs(), getCategories()]);
  const pages = ["/", "/catalogo", "/categorias", "/sobre", "/contato", "/politica-de-privacidade"];
  return [
    ...pages.map((p) => ({ url: siteUrl(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: siteUrl(`/categorias/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: siteUrl(`/produto/${p.slug}`), lastModified: p.updated_at, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
