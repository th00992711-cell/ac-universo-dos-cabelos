import { z } from "zod";
import { storagePath, text } from "./helpers";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Use um link completo começando com https://");

export const BENEFIT_ICON_KEYS = ["sparkles", "gem", "heart", "crown", "star", "scissors", "truck", "message"] as const;

export const settingsSchema = z.object({
  business_name: z.string().trim().min(2, "Informe o nome comercial").max(80),
  tagline: text(160),
  logo_path: z.union([z.literal(""), storagePath]),
  whatsapp_number: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || /^[0-9]{10,15}$/.test(v), "Use DDI + DDD + número, ex.: 5511999998888"),
  whatsapp_default_message: text(500),
  whatsapp_product_message: text(500),
  instagram_handle: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, ""))
    .refine((v) => v === "" || /^[A-Za-z0-9._]{1,30}$/.test(v), "Use apenas o usuário, ex.: ac.universodoscabelos"),
  email: z.union([z.literal(""), z.email("E-mail inválido")]),
  phone: text(30),
  address: text(300),
  business_hours: text(300),
  facebook_url: optionalUrl,
  tiktok_url: optionalUrl,
  youtube_url: optionalUrl,
  about_title: text(120),
  about_text: text(6000),
  benefits_title: text(120),
  benefits: z
    .array(
      z.object({
        icon: z.enum(BENEFIT_ICON_KEYS),
        title: z.string().trim().min(2, "Informe o título do diferencial").max(60),
        description: text(220),
      }),
    )
    .max(6, "Use no máximo 6 diferenciais"),
  footer_text: text(300),
  privacy_policy: text(12000),
  seo_description: text(300),
  metrics_enabled: z.boolean(),
});

export type SettingsFormValues = z.input<typeof settingsSchema>;
export type SettingsInput = z.output<typeof settingsSchema>;
