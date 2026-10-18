import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listAdminProducts, listAllCategories } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Categorias" };

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([listAllCategories(), listAdminProducts()]);
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  });
  return (
    <div className="grid gap-6">
      <PageHeader title="Categorias" description="Categorias desativadas somem do site, mas os produtos continuam cadastrados." />
      <CategoryManager categories={categories} counts={counts} />
    </div>
  );
}
