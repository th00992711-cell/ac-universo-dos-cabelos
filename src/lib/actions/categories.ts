"use server";

import { z } from "zod";
import { publicImageUrl } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { toNull } from "@/lib/validations/helpers";
import { categorySchema } from "@/lib/validations/catalog";
import { fail, type ActionResult } from "./result";
import { adminClient, friendlyDbError, removeUnusedFiles, revalidateSite } from "./shared";

const uuid = z.uuid();

export async function saveCategory(input: unknown, categoryId?: string): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
  if (categoryId && !uuid.safeParse(categoryId).success) return fail("Categoria inválida");
  const d = parsed.data;
  const { supabase } = await adminClient();

  let previousPath: string | null = null;
  if (categoryId) {
    const { data } = await supabase.from("categories").select("image_path").eq("id", categoryId).single();
    previousPath = data?.image_path ?? null;
  }

  const row = {
    name: d.name,
    slug: d.slug || slugify(d.name),
    description: toNull(d.description),
    sort_order: Number(d.sort_order),
    is_active: d.is_active,
    image_path: d.image_path || null,
    image_url: d.image_path ? publicImageUrl(d.image_path) : null,
  };
  const { error } = categoryId
    ? await supabase.from("categories").update(row).eq("id", categoryId)
    : await supabase.from("categories").insert(row);
  if (error) return fail(friendlyDbError(error, "Erro ao salvar a categoria"));

  if (previousPath && previousPath !== row.image_path) await removeUnusedFiles(supabase, [previousPath]);
  revalidateSite();
  return { ok: true, message: categoryId ? "Categoria atualizada" : "Categoria criada" };
}

export async function toggleCategory(categoryId: string, isActive: boolean): Promise<ActionResult> {
  if (!uuid.safeParse(categoryId).success) return fail("Categoria inválida");
  const { supabase } = await adminClient();
  const { error } = await supabase.from("categories").update({ is_active: Boolean(isActive) }).eq("id", categoryId);
  if (error) return fail(friendlyDbError(error, "Erro ao atualizar a categoria"));
  revalidateSite();
  return { ok: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  if (!uuid.safeParse(categoryId).success) return fail("Categoria inválida");
  const { supabase } = await adminClient();
  const { data } = await supabase.from("categories").select("image_path").eq("id", categoryId).single();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return fail(friendlyDbError(error, "Erro ao excluir a categoria"));
  await removeUnusedFiles(supabase, [data?.image_path]);
  revalidateSite();
  return { ok: true, message: "Categoria excluída. Os produtos dela ficaram sem categoria." };
}
