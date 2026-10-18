"use server";

import { z } from "zod";
import { publicImageUrl } from "@/lib/storage";
import { toNull } from "@/lib/validations/helpers";
import { bannerSchema } from "@/lib/validations/catalog";
import { fail, type ActionResult } from "./result";
import { adminClient, friendlyDbError, removeUnusedFiles, revalidateSite } from "./shared";

const uuid = z.uuid();

export async function saveBanner(input: unknown, bannerId?: string): Promise<ActionResult> {
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
  if (bannerId && !uuid.safeParse(bannerId).success) return fail("Banner inválido");
  const d = parsed.data;
  if (d.placement === "promo" && !d.image_path) return fail("Imagens promocionais precisam de uma foto");
  const { supabase } = await adminClient();

  let previousPath: string | null = null;
  if (bannerId) {
    const { data } = await supabase.from("banners").select("image_path").eq("id", bannerId).single();
    previousPath = data?.image_path ?? null;
  }

  const row = {
    placement: d.placement,
    title: d.title,
    subtitle: toNull(d.subtitle),
    primary_cta_label: toNull(d.primary_cta_label),
    primary_cta_href: toNull(d.primary_cta_href),
    secondary_cta_label: toNull(d.secondary_cta_label),
    secondary_cta_href: toNull(d.secondary_cta_href),
    sort_order: Number(d.sort_order),
    is_active: d.is_active,
    image_path: d.image_path || null,
    image_url: d.image_path ? publicImageUrl(d.image_path) : null,
  };
  const { error } = bannerId ? await supabase.from("banners").update(row).eq("id", bannerId) : await supabase.from("banners").insert(row);
  if (error) return fail(friendlyDbError(error, "Erro ao salvar o banner"));

  if (previousPath && previousPath !== row.image_path) await removeUnusedFiles(supabase, [previousPath]);
  revalidateSite();
  return { ok: true, message: "Banner salvo" };
}

export async function deleteBanner(bannerId: string): Promise<ActionResult> {
  if (!uuid.safeParse(bannerId).success) return fail("Banner inválido");
  const { supabase } = await adminClient();
  const { data } = await supabase.from("banners").select("image_path").eq("id", bannerId).single();
  const { error } = await supabase.from("banners").delete().eq("id", bannerId);
  if (error) return fail(friendlyDbError(error, "Erro ao excluir o banner"));
  await removeUnusedFiles(supabase, [data?.image_path]);
  revalidateSite();
  return { ok: true, message: "Banner excluído" };
}
