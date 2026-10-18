import type { SiteSettings } from "./types";

const DEFAULT_PRODUCT_MESSAGE =
  "Olá! Vim pelo site da AC Universo dos Cabelos e gostaria de saber mais sobre o produto {produto}, código {sku}.";
const DEFAULT_MESSAGE = "Olá! Vim pelo site da AC Universo dos Cabelos e gostaria de atendimento.";

export function whatsappLink(number: string | null | undefined, message?: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function generalWhatsappLink(settings: Pick<SiteSettings, "whatsapp_number" | "whatsapp_default_message">) {
  return whatsappLink(settings.whatsapp_number, settings.whatsapp_default_message || DEFAULT_MESSAGE);
}

export function productWhatsappMessage(template: string | null | undefined, product: { name: string; sku: string }) {
  return (template || DEFAULT_PRODUCT_MESSAGE).replaceAll("{produto}", product.name).replaceAll("{sku}", product.sku);
}

export function productWhatsappLink(
  settings: Pick<SiteSettings, "whatsapp_number" | "whatsapp_product_message">,
  product: { name: string; sku: string },
) {
  return whatsappLink(settings.whatsapp_number, productWhatsappMessage(settings.whatsapp_product_message, product));
}

export function instagramUrl(handle: string | null | undefined) {
  const clean = (handle ?? "").replace(/^@/, "").trim();
  return clean ? `https://www.instagram.com/${clean}/` : null;
}
