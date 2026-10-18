"use server";

import { z } from "zod";
import { publicImageUrl } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { parseMoney, toInt, toNull } from "@/lib/validations/helpers";
import { productImagesSchema, productSchema } from "@/lib/validations/product";
import { fail, type ActionResult } from "./result";
import { adminClient, friendlyDbError, removeUnusedFiles, revalidateSite } from "./shared";

const uuid = z.uuid();

export async function saveProduct(input: unknown, imagesInput: unknown, productId?: string): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const images = productImagesSchema.safeParse(imagesInput);
  if (!images.success) return fail(images.error.issues[0]?.message ?? "Fotos inválidas");
  if (productId && !uuid.safeParse(productId).success) return fail("Produto inválido");

  const d = parsed.data;
  const { supabase } = await adminClient();

  const row = {
    name: d.name,
    sku: d.sku.toUpperCase(),
    slug: d.slug || slugify(d.name),
    category_id: d.category_id || null,
    short_description: toNull(d.short_description),
    description: toNull(d.description),
    hair_type: toNull(d.hair_type),
    texture: toNull(d.texture),
    length_cm: toInt(d.length_cm),
    weight_grams: toInt(d.weight_grams),
    color: toNull(d.color),
    origin: toNull(d.origin),
    price: parseMoney(d.price),
    promo_price: parseMoney(d.promo_price),
    min_stock: Number(d.min_stock),
    status: d.status,
    is_featured: d.is_featured,
    is_new: d.is_new,
    sort_order: Number(d.sort_order),
    additional_info: d.additional_info.filter((i) => i.label && i.value),
  };
  if (!row.slug) return fail("Não foi possível gerar o endereço do produto. Informe um slug.");

  let id = productId;
  let previousPaths: string[] = [];

  if (id) {
    const { data: before } = await supabase.from("product_images").select("storage_path").eq("product_id", id);
    previousPaths = (before ?? []).map((r) => r.storage_path);
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return fail(friendlyDbError(error, "Erro ao salvar o produto"));

    // Quantidade alterada no cadastro vira um "ajuste" no histórico de estoque.
    const { data: current } = await supabase.from("products").select("stock_quantity").eq("id", id).single();
    const desired = Number(d.stock_quantity);
    if (current && current.stock_quantity !== desired) {
      const { error: stockError } = await supabase.rpc("register_inventory_movement", {
        p_product_id: id,
        p_type: "ajuste",
        p_quantity: desired,
        p_reason: "Ajuste pelo cadastro do produto",
      });
      if (stockError) return fail(friendlyDbError(stockError, "Produto salvo, mas o estoque não foi atualizado"));
    }
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...row, stock_quantity: Number(d.stock_quantity) })
      .select("id")
      .single();
    if (error || !data) return fail(friendlyDbError(error, "Erro ao cadastrar o produto"));
    id = data.id as string;
  }

  const imageRows = images.data.map((img) => ({
    storage_path: img.storage_path,
    url: publicImageUrl(img.storage_path),
    alt: img.alt || d.name,
  }));
  const { error: imgError } = await supabase.rpc("replace_product_images", { p_product_id: id, p_images: imageRows });
  if (imgError) return fail("Produto salvo, mas houve um erro ao salvar as fotos. Tente novamente.");

  const kept = new Set(imageRows.map((i) => i.storage_path));
  await removeUnusedFiles(supabase, previousPaths.filter((p) => !kept.has(p)));

  revalidateSite();
  return { ok: true, data: { id: id! }, message: productId ? "Produto atualizado" : "Produto cadastrado" };
}

export async function setProductStatus(productId: string, status: unknown): Promise<ActionResult> {
  const s = z.enum(["active", "inactive", "archived"]).safeParse(status);
  if (!s.success || !uuid.safeParse(productId).success) return fail("Dados inválidos");
  const { supabase } = await adminClient();
  const { error } = await supabase.from("products").update({ status: s.data }).eq("id", productId);
  if (error) return fail(friendlyDbError(error, "Erro ao alterar o status"));
  revalidateSite();
  return { ok: true };
}

export async function setProductFlag(productId: string, flag: "is_featured" | "is_new", value: boolean): Promise<ActionResult> {
  if (!uuid.safeParse(productId).success || !["is_featured", "is_new"].includes(flag)) return fail("Dados inválidos");
  const { supabase } = await adminClient();
  const { error } = await supabase.from("products").update({ [flag]: Boolean(value) }).eq("id", productId);
  if (error) return fail(friendlyDbError(error, "Erro ao atualizar o produto"));
  revalidateSite();
  return { ok: true };
}

export async function updateProductOrder(productId: string, sortOrder: number): Promise<ActionResult> {
  if (!uuid.safeParse(productId).success || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) return fail("Ordem inválida");
  const { supabase } = await adminClient();
  const { error } = await supabase.from("products").update({ sort_order: sortOrder }).eq("id", productId);
  if (error) return fail(friendlyDbError(error, "Erro ao salvar a ordem"));
  revalidateSite();
  return { ok: true };
}

/** Cria uma cópia inativa, sem estoque, reaproveitando as fotos. */
export async function duplicateProduct(productId: string): Promise<ActionResult<{ id: string }>> {
  if (!uuid.safeParse(productId).success) return fail("Produto inválido");
  const { supabase } = await adminClient();
  const { data: p, error } = await supabase.from("products").select("*, product_images(storage_path, url, alt, sort_order)").eq("id", productId).single();
  if (error || !p) return fail("Produto não encontrado");

  const suffix = Math.random().toString(36).slice(2, 6);
  const copy = {
    name: `${p.name} (cópia)`.slice(0, 140),
    sku: `${p.sku}-C${suffix}`.toUpperCase().slice(0, 40),
    slug: `${p.slug}-copia-${suffix}`.slice(0, 140),
    category_id: p.category_id,
    short_description: p.short_description,
    description: p.description,
    hair_type: p.hair_type,
    texture: p.texture,
    length_cm: p.length_cm,
    weight_grams: p.weight_grams,
    color: p.color,
    origin: p.origin,
    price: p.price,
    promo_price: p.promo_price,
    min_stock: p.min_stock,
    stock_quantity: 0,
    status: "inactive",
    is_featured: false,
    is_new: p.is_new,
    sort_order: p.sort_order,
    additional_info: p.additional_info,
  };
  const { data: created, error: insertError } = await supabase.from("products").insert(copy).select("id").single();
  if (insertError || !created) return fail(friendlyDbError(insertError, "Erro ao duplicar o produto"));

  const imgs = [...(p.product_images ?? [])].sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
  if (imgs.length) {
    await supabase.rpc("replace_product_images", {
      p_product_id: created.id,
      p_images: imgs.map((i: { storage_path: string; url: string; alt: string | null }) => ({ storage_path: i.storage_path, url: i.url, alt: i.alt ?? "" })),
    });
  }
  revalidateSite();
  return { ok: true, data: { id: created.id }, message: "Cópia criada como inativa. Revise e ative quando quiser." };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!uuid.safeParse(productId).success) return fail("Produto inválido");
  const { supabase } = await adminClient();
  const { data: imgs } = await supabase.from("product_images").select("storage_path").eq("product_id", productId);
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return fail(friendlyDbError(error, "Não foi possível excluir. Tente arquivar o produto."));
  await removeUnusedFiles(supabase, (imgs ?? []).map((i) => i.storage_path));
  revalidateSite();
  return { ok: true, message: "Produto excluído" };
}
