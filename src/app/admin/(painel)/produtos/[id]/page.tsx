import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminProduct, getFormSuggestions, listAllCategories } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [product, categories, suggestions] = await Promise.all([getAdminProduct(id), listAllCategories(), getFormSuggestions()]);
  if (!product) notFound();
  return (
    <div className="grid gap-6">
      <Link href="/admin/produtos" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-gold-ink">
        <ChevronLeft className="size-4" /> Produtos
      </Link>
      <PageHeader title={product.name} description={`SKU ${product.sku}`} />
      <ProductForm key={product.updated_at} product={product} categories={categories} suggestions={suggestions} />
    </div>
  );
}
