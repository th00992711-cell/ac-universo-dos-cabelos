import { z } from "zod";
import { linkHref, requiredInt, requiredText, storagePath, text } from "./helpers";

export const categorySchema = z.object({
  name: requiredText("o nome da categoria", 2, 80),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, "Use letras minúsculas, números e hífens"),
  description: text(600),
  sort_order: requiredInt("Ordem", 0, 10000),
  is_active: z.boolean(),
  image_path: z.union([z.literal(""), storagePath]),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const bannerSchema = z.object({
  placement: z.enum(["hero", "promo"]),
  title: requiredText("o título", 1, 140),
  subtitle: text(400),
  primary_cta_label: text(40),
  primary_cta_href: linkHref,
  secondary_cta_label: text(40),
  secondary_cta_href: linkHref,
  sort_order: requiredInt("Ordem", 0, 10000),
  is_active: z.boolean(),
  image_path: z.union([z.literal(""), storagePath]),
});
export type BannerInput = z.infer<typeof bannerSchema>;

export const movementSchema = z.object({
  product_id: z.uuid("Selecione um produto"),
  movement_type: z.enum(["entrada", "saida", "ajuste"]),
  quantity: requiredInt("Quantidade", 0, 100000),
  reason: text(300),
});
export type MovementInput = z.infer<typeof movementSchema>;
