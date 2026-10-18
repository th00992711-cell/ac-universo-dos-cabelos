import { z } from "zod";
import { MAX_PRODUCT_IMAGES } from "@/lib/constants";
import { money, optionalInt, parseMoney, requiredInt, requiredText, storagePath, text } from "./helpers";

export const productSchema = z
  .object({
    name: requiredText("o nome do produto", 2, 140),
    sku: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9._-]{2,40}$/, "SKU: use de 2 a 40 letras, números, ponto, hífen ou sublinhado"),
    slug: z
      .string()
      .trim()
      .max(140)
      .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, "Use letras minúsculas, números e hífens"),
    category_id: z.union([z.literal(""), z.uuid("Categoria inválida")]),
    short_description: text(300),
    description: text(8000),
    hair_type: text(60),
    texture: text(60),
    length_cm: optionalInt("Comprimento", 1, 200),
    weight_grams: optionalInt("Peso", 1, 5000),
    color: text(60),
    origin: text(80),
    price: money("Preço"),
    promo_price: money("Preço promocional"),
    stock_quantity: requiredInt("Quantidade", 0, 100000),
    min_stock: requiredInt("Estoque mínimo", 0, 100000),
    status: z.enum(["active", "inactive", "archived"]),
    is_featured: z.boolean(),
    is_new: z.boolean(),
    sort_order: requiredInt("Ordem", 0, 100000),
    additional_info: z
      .array(z.object({ label: text(60), value: text(300) }))
      .max(20, "Use no máximo 20 informações adicionais"),
  })
  .superRefine((d, ctx) => {
    const price = parseMoney(d.price);
    const promo = parseMoney(d.promo_price);
    if (promo !== null && price === null) {
      ctx.addIssue({ code: "custom", path: ["promo_price"], message: "Informe o preço de venda antes do promocional" });
    }
    if (promo !== null && price !== null && promo >= price) {
      ctx.addIssue({ code: "custom", path: ["promo_price"], message: "O preço promocional deve ser menor que o preço de venda" });
    }
    d.additional_info.forEach((item, i) => {
      if (Boolean(item.label) !== Boolean(item.value)) {
        ctx.addIssue({ code: "custom", path: ["additional_info", i, "value"], message: "Preencha o título e o conteúdo" });
      }
    });
  });

export type ProductInput = z.infer<typeof productSchema>;

export const productImagesSchema = z
  .array(z.object({ storage_path: storagePath, alt: text(200) }))
  .max(MAX_PRODUCT_IMAGES, `Use no máximo ${MAX_PRODUCT_IMAGES} fotos`);

export type ProductImageInput = z.infer<typeof productImagesSchema>[number];
