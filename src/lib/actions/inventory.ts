"use server";

import { revalidatePath } from "next/cache";
import { movementSchema } from "@/lib/validations/catalog";
import { fail, type ActionResult } from "./result";
import { adminClient, friendlyDbError, revalidateSite } from "./shared";

/** Entrada, saída ou ajuste. A conta e a trava contra estoque negativo ficam no banco. */
export async function registerMovement(input: unknown): Promise<ActionResult<{ newQuantity: number }>> {
  const parsed = movementSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const d = parsed.data;
  const quantity = Number(d.quantity);
  if (d.movement_type !== "ajuste" && quantity === 0) return fail("Informe uma quantidade maior que zero");

  const { supabase } = await adminClient();
  const { data, error } = await supabase.rpc("register_inventory_movement", {
    p_product_id: d.product_id,
    p_type: d.movement_type,
    p_quantity: quantity,
    p_reason: d.reason || null,
  });
  if (error) return fail(friendlyDbError(error, "Não foi possível registrar a movimentação"));

  revalidatePath("/admin/estoque");
  revalidateSite();
  return { ok: true, data: { newQuantity: data as number }, message: `Estoque atualizado: ${data} unidade(s)` };
}
