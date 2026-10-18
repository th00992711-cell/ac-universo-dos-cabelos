import "server-only";
import { cache } from "react";
import { CATALOG_PAGE_SIZE, type SortValue } from "@/lib/constants";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Category, Product, ProductCardData } from "@/lib/types";

/** Colunas liberadas para visitantes. Não use "*" em products: min_stock é privado. */
const IMAGE_COLUMNS = "images:product_images(id, url, alt, sort_order, is_primary)";
export const CARD_COLUMNS = `id, sku, name, slug, price, promo_price, effective_price, length_cm, texture, stock_quantity, is_new, ${IMAGE_COLUMNS}`;
export const DETAIL_COLUMNS = `id, sku, name, slug, category_id, short_description, description, hair_type, texture, length_cm, weight_grams, color, origin, price, promo_price, effective_price, stock_quantity, status, is_featured, is_new, sort_order, additional_info, created_at, updated_at, category:categories(id, name, slug), ${IMAGE_COLUMNS}`;

export type CatalogFilters = {
  q?: string;
  categoria?: string;
  textura: string[];
  cor: string[];
  comprimento: number[];
  precoMin?: number;
  precoMax?: number;
  disponibilidade?: "disponivel" | "sob-consulta";
  ordem: SortValue;
  pagina: number;
};

export type FilterOptions = {
  textures: string[];
  colors: string[];
  lengths: number[];
  min_price: number | null;
  max_price: number | null;
};

const EMPTY_OPTIONS: FilterOptions = { textures: [], colors: [], lengths: [], min_price: null, max_price: null };

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return [];
  const { data } = await createPublicClient()
    .from("categories")
    .select("id, name, slug, description, image_url, image_path, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  return (data ?? []) as Category[];
});

export const getFilterOptions = cache(async (): Promise<FilterOptions> => {
  if (!isSupabaseConfigured) return EMPTY_OPTIONS;
  const { data } = await createPublicClient().rpc("catalog_filter_options");
  return { ...EMPTY_OPTIONS, ...((data as FilterOptions | null) ?? {}) };
});

/** Remove caracteres que têm significado na sintaxe de filtros do PostgREST. */
function sanitizeSearch(term: string) {
  return term.replace(/[%_*,()"'\\:.]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export async function searchProducts(filters: CatalogFilters, categoryId?: string | null) {
  if (!isSupabaseConfigured) return { products: [] as ProductCardData[], total: 0 };

  let query = createPublicClient()
    .from("products")
    .select(CARD_COLUMNS, { count: "exact" })
    .eq("status", "active");

  if (categoryId) query = query.eq("category_id", categoryId);
  const term = filters.q ? sanitizeSearch(filters.q) : "";
  if (term) query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  if (filters.textura.length) query = query.in("texture", filters.textura);
  if (filters.cor.length) query = query.in("color", filters.cor);
  if (filters.comprimento.length) query = query.in("length_cm", filters.comprimento);
  if (filters.precoMin !== undefined) query = query.gte("effective_price", filters.precoMin);
  if (filters.precoMax !== undefined) query = query.lte("effective_price", filters.precoMax);
  if (filters.disponibilidade === "disponivel") query = query.gt("stock_quantity", 0);
  if (filters.disponibilidade === "sob-consulta") query = query.eq("stock_quantity", 0);

  switch (filters.ordem) {
    case "menor-preco":
      query = query.order("effective_price", { ascending: true, nullsFirst: false });
      break;
    case "maior-preco":
      query = query.order("effective_price", { ascending: false, nullsFirst: false });
      break;
    case "novidades":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("is_featured", { ascending: false }).order("sort_order").order("created_at", { ascending: false });
  }

  const from = (filters.pagina - 1) * CATALOG_PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + CATALOG_PAGE_SIZE - 1);
  if (error) {
    // Página fora do intervalo devolve erro 416 no PostgREST: tratamos como lista vazia.
    return { products: [] as ProductCardData[], total: count ?? 0 };
  }
  return { products: (data ?? []) as unknown as ProductCardData[], total: count ?? 0 };
}

export const getFeaturedProducts = cache(async (limit = 8): Promise<ProductCardData[]> => {
  if (!isSupabaseConfigured) return [];
  const { data } = await createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("sort_order")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ProductCardData[];
});

export const getNewAndPromoProducts = cache(async (limit = 8) => {
  if (!isSupabaseConfigured) return { launches: [] as ProductCardData[], promos: [] as ProductCardData[] };
  const supabase = createPublicClient();
  const [launches, promos] = await Promise.all([
    supabase.from("products").select(CARD_COLUMNS).eq("status", "active").eq("is_new", true).order("created_at", { ascending: false }).limit(limit),
    supabase.from("products").select(CARD_COLUMNS).eq("status", "active").not("promo_price", "is", null).order("sort_order").limit(limit),
  ]);
  return {
    launches: (launches.data ?? []) as unknown as ProductCardData[],
    promos: (promos.data ?? []) as unknown as ProductCardData[],
  };
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) return null;
  const { data } = await createPublicClient()
    .from("products")
    .select(DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  return (data as unknown as Product | null) ?? null;
});

export async function getRelatedProducts(product: Product, limit = 4): Promise<ProductCardData[]> {
  if (!isSupabaseConfigured || !product.category_id) return [];
  const { data } = await createPublicClient()
    .from("products")
    .select(CARD_COLUMNS)
    .eq("status", "active")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .order("is_featured", { ascending: false })
    .order("sort_order")
    .limit(limit);
  return (data ?? []) as unknown as ProductCardData[];
}

export async function getAllProductSlugs() {
  if (!isSupabaseConfigured) return [];
  const { data } = await createPublicClient().from("products").select("slug, updated_at").eq("status", "active").limit(5000);
  return (data ?? []) as { slug: string; updated_at: string }[];
}
