import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getFormSuggestions, listAllCategories } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const [categories, suggestions] = await Promise.all([listAllCategories(), getFormSuggestions()]);
  return (
    <div className="grid gap-6">
      <Link href="/admin/produtos" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-gold-ink">
        <ChevronLeft className="size-4" /> Produtos
      </Link>
      <PageHeader title="Novo produto" description="Campos com * são obrigatórios." />
      <ProductForm categories={categories} suggestions={suggestions} />
    </div>
  );
}
