"use server";

import { publicImageUrl } from "@/lib/storage";
import { toNull } from "@/lib/validations/helpers";
import { settingsSchema } from "@/lib/validations/settings";
import { fail, type ActionResult } from "./result";
import { adminClient, friendlyDbError, removeUnusedFiles, revalidateSite } from "./shared";

export async function saveSettings(input: unknown): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const d = parsed.data;
  const { supabase } = await adminClient();

  const { data: before } = await supabase.from("site_settings").select("logo_path").eq("id", 1).single();

  const row = {
    business_name: d.business_name,
    tagline: toNull(d.tagline),
    logo_path: d.logo_path || null,
    logo_url: d.logo_path ? publicImageUrl(d.logo_path) : null,
    whatsapp_number: d.whatsapp_number || null,
    whatsapp_default_message: toNull(d.whatsapp_default_message),
    whatsapp_product_message: toNull(d.whatsapp_product_message),
    instagram_handle: toNull(d.instagram_handle),
    email: toNull(d.email),
    phone: toNull(d.phone),
    address: toNull(d.address),
    business_hours: toNull(d.business_hours),
    facebook_url: toNull(d.facebook_url),
    tiktok_url: toNull(d.tiktok_url),
    youtube_url: toNull(d.youtube_url),
    about_title: toNull(d.about_title),
    about_text: toNull(d.about_text),
    benefits_title: toNull(d.benefits_title),
    benefits: d.benefits.map((b) => ({ icon: b.icon, title: b.title, description: b.description })),
    footer_text: toNull(d.footer_text),
    privacy_policy: toNull(d.privacy_policy),
    seo_description: toNull(d.seo_description),
    metrics_enabled: d.metrics_enabled,
  };

  const { error } = await supabase.from("site_settings").update(row).eq("id", 1);
  if (error) return fail(friendlyDbError(error, "Erro ao salvar as configurações"));

  if (before?.logo_path && before.logo_path !== row.logo_path) await removeUnusedFiles(supabase, [before.logo_path]);
  revalidateSite();
  return { ok: true, message: "Configurações salvas. O site já foi atualizado." };
}
