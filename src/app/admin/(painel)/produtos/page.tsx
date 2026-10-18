import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/admin/page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { EmptyState } from "@/components/site/empty-state";
import { listAdminProducts, listAllCategories } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Produtos" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/produtos">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const category = typeof sp.categoria === "string" ? sp.categoria : "";
  const [products, categories] = await Promise.all([listAdminProducts({ q, status, category }), listAllCategories()]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Produtos"
        description={`${products.length} ${products.length === 1 ? "produto" : "produtos"} ${status === "archived" ? "arquivados" : ""}`}
        actions={
          <Button asChild>
            <Link href="/admin/produtos/novo">
              <Plus /> Novo produto
            </Link>
          </Button>
        }
      />
      <form className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_12rem_12rem_auto]" role="search">
        <label className="sr-only" htmlFor="q">
          Buscar
        </label>
        <Input id="q" name="q" defaultValue={q} placeholder="Buscar por nome ou SKU" />
        <NativeSelect name="status" defaultValue={status} aria-label="Status">
          <option value="">Ativos e inativos</option>
          <option value="active">Somente ativos</option>
          <option value="inactive">Somente inativos</option>
          <option value="archived">Arquivados</option>
        </NativeSelect>
        <NativeSelect name="categoria" defaultValue={category} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="secondary">
          <Search /> Filtrar
        </Button>
      </form>
      {products.length ? (
        <ProductsTable products={products} />
      ) : (
        <EmptyState
          title={q || status || category ? "Nenhum produto encontrado" : "Cadastre o primeiro produto"}
          description={q || status || category ? "Tente outros filtros." : "Os produtos cadastrados e ativos aparecem automaticamente no catálogo."}
          action={
            <Button asChild>
              <Link href="/admin/produtos/novo">
                <Plus /> Novo produto
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
