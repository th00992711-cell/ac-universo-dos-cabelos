import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { STORAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function adminClient() {
  const admin = await requireAdmin();
  return { admin, supabase: await createClient() };
}

/** Atualiza o site público (páginas em cache) e o painel após qualquer alteração. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

/** Remove do Storage arquivos que não são mais usados por nenhum registro. */
export async function removeUnusedFiles(supabase: Awaited<ReturnType<typeof createClient>>, paths: (string | null | undefined)[]) {
  const candidates = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  if (!candidates.length) return;
  const [images, categories, banners, settings] = await Promise.all([
    supabase.from("product_images").select("storage_path").in("storage_path", candidates),
    supabase.from("categories").select("image_path").in("image_path", candidates),
    supabase.from("banners").select("image_path").in("image_path", candidates),
    supabase.from("site_settings").select("logo_path").in("logo_path", candidates),
  ]);
  const inUse = new Set<string>([
    ...(images.data ?? []).map((r) => r.storage_path),
    ...(categories.data ?? []).map((r) => r.image_path),
    ...(banners.data ?? []).map((r) => r.image_path),
    ...(settings.data ?? []).map((r) => r.logo_path),
  ]);
  const unused = candidates.filter((p) => !inUse.has(p));
  if (unused.length) await supabase.storage.from(STORAGE_BUCKET).remove(unused);
}

export function friendlyDbError(error: { code?: string; message?: string } | null, fallback: string) {
  if (!error) return fallback;
  if (error.code === "23505") {
    if (error.message?.includes("sku")) return "Já existe um produto com este SKU";
    if (error.message?.includes("slug")) return "Já existe um item com este endereço (slug). Altere o nome ou o slug";
    return "Registro duplicado";
  }
  if (error.code === "23514" || error.code === "P0001") return error.message || fallback;
  if (error.code === "42501") return "Você não tem permissão para esta ação";
  return fallback;
}
