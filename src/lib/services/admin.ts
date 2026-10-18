import "server-only";
import { SUGGESTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { AdminProduct, Banner, Category, InventoryMovement, SiteSettings } from "@/lib/types";

/** Consultas do painel: usam a sessão do administrador (o RLS libera tudo para admins). */

const ADMIN_PRODUCT_COLUMNS =
  "*, category:categories(id, name, slug), images:product_images(id, url, storage_path, alt, sort_order, is_primary)";

export async function listAdminProducts(opts: { q?: string; status?: string; category?: string } = {}) {
  const supabase = await createClient();
  let query = supabase.from("products").select(ADMIN_PRODUCT_COLUMNS).order("sort_order").order("created_at", { ascending: false }).limit(500);
  if (opts.status && ["active", "inactive", "archived"].includes(opts.status)) query = query.eq("status", opts.status);
  else query = query.neq("status", "archived");
  if (opts.category) query = query.eq("category_id", opts.category);
  const term = opts.q?.replace(/[%_*,()"'\\:.]/g, " ").trim().slice(0, 60);
  if (term) query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  const { data } = await query;
  return (data ?? []) as unknown as AdminProduct[];
}

export async function getAdminProduct(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(ADMIN_PRODUCT_COLUMNS).eq("id", id).maybeSingle();
  return (data as unknown as AdminProduct | null) ?? null;
}

export async function listAllCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  return (data ?? []) as Category[];
}

/** Sugestões do formulário: valores padrão + o que já foi cadastrado. */
export async function getFormSuggestions() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("hair_type, texture, color, origin").limit(1000);
  const merge = (base: string[], key: "hair_type" | "texture" | "color" | "origin") =>
    [...new Set([...base, ...(data ?? []).map((r) => r[key]).filter((v): v is string => Boolean(v))])].sort((a, b) => a.localeCompare(b, "pt-BR"));
  return {
    hairType: merge(SUGGESTIONS.hairType, "hair_type"),
    texture: merge(SUGGESTIONS.texture, "texture"),
    color: merge(SUGGESTIONS.color, "color"),
    origin: merge(SUGGESTIONS.origin, "origin"),
  };
}

export async function listBanners() {
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("*").order("placement").order("sort_order").order("created_at");
  return (data ?? []) as Banner[];
}

export async function getAdminSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data as SiteSettings | null;
}

export async function listMovements(productId?: string, limit = 100) {
  const supabase = await createClient();
  let query = supabase
    .from("inventory_movements")
    .select("id, product_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, created_at, product:products(name, sku)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (productId) query = query.eq("product_id", productId);
  const { data } = await query;
  return (data ?? []) as unknown as InventoryMovement[];
}

export async function getDashboardData() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);
  const [products, categories, views, settings] = await Promise.all([
    supabase.from("products").select("id, name, sku, status, is_featured, stock_quantity, min_stock, category_id").limit(5000),
    supabase.from("categories").select("id, name, is_active"),
    supabase.from("product_views_daily").select("product_id, day, views").gte("day", since).limit(20000),
    supabase.from("site_settings").select("metrics_enabled").eq("id", 1).maybeSingle(),
  ]);

  const all = products.data ?? [];
  const live = all.filter((p) => p.status !== "archived");
  const cats = categories.data ?? [];
  const viewRows = views.data ?? [];

  const byCategory = cats
    .map((c) => ({ label: c.name, value: live.filter((p) => p.category_id === c.id).length }))
    .concat([{ label: "Sem categoria", value: live.filter((p) => !p.category_id).length }])
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const days: { day: string; views: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    days.push({ day, views: viewRows.filter((r) => r.day === day).reduce((s, r) => s + r.views, 0) });
  }

  const perProduct = new Map<string, number>();
  viewRows.forEach((r) => perProduct.set(r.product_id, (perProduct.get(r.product_id) ?? 0) + r.views));
  const topViewed = [...perProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, value]) => ({ label: all.find((p) => p.id === id)?.name ?? "Produto removido", value }));

  return {
    total: live.length,
    active: live.filter((p) => p.status === "active").length,
    unavailable: live.filter((p) => p.status === "active" && p.stock_quantity === 0).length,
    inactive: live.filter((p) => p.status === "inactive").length,
    featured: live.filter((p) => p.status === "active" && p.is_featured).length,
    categories: cats.filter((c) => c.is_active).length,
    lowStock: live
      .filter((p) => p.stock_quantity <= p.min_stock)
      .sort((a, b) => a.stock_quantity - b.stock_quantity)
      .map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock_quantity, min: p.min_stock })),
    byCategory,
    metricsEnabled: settings.data?.metrics_enabled ?? false,
    views30d: viewRows.reduce((s, r) => s + r.views, 0),
    viewsByDay: days,
    topViewed,
  };
}
