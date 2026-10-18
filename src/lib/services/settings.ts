import "server-only";
import { cache } from "react";
import { BRAND_NAME, INSTAGRAM_HANDLE } from "@/lib/constants";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Banner, SiteSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  business_name: BRAND_NAME,
  tagline: "Cabelos selecionados para valorizar a sua beleza.",
  logo_url: null,
  logo_path: null,
  whatsapp_number: null,
  whatsapp_default_message: null,
  whatsapp_product_message: null,
  instagram_handle: INSTAGRAM_HANDLE,
  email: null,
  phone: null,
  address: null,
  business_hours: null,
  facebook_url: null,
  tiktok_url: null,
  youtube_url: null,
  about_title: "Sobre a AC Universo dos Cabelos",
  about_text: null,
  benefits_title: "Por que escolher a AC",
  benefits: [],
  footer_text: null,
  privacy_policy: null,
  seo_description:
    "Catálogo de cabelos da AC Universo dos Cabelos: lisos, ondulados, cacheados, crespos, mega hair e acessórios. Atendimento personalizado pelo WhatsApp.",
  metrics_enabled: true,
};

export const DEFAULT_HERO: Banner = {
  id: "default",
  placement: "hero",
  title: "Sua beleza merece o extraordinário.",
  subtitle: "Descubra nossa seleção de cabelos, escolhidos para valorizar sua beleza, seu estilo e sua personalidade.",
  primary_cta_label: "Explorar catálogo",
  primary_cta_href: "/catalogo",
  secondary_cta_label: "Falar com uma consultora",
  secondary_cta_href: "whatsapp",
  image_url: null,
  image_path: null,
  sort_order: 0,
  is_active: true,
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const { data, error } = await createPublicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  const merged = { ...DEFAULT_SETTINGS };
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && key in merged) (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
});

export const getBanners = cache(async (): Promise<{ hero: Banner; promos: Banner[] }> => {
  if (!isSupabaseConfigured) return { hero: DEFAULT_HERO, promos: [] };
  const { data } = await createPublicClient()
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("created_at");
  const banners = (data ?? []) as Banner[];
  return {
    hero: banners.find((b) => b.placement === "hero") ?? DEFAULT_HERO,
    promos: banners.filter((b) => b.placement === "promo" && b.image_url),
  };
});
