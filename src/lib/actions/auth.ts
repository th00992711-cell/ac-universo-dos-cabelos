"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { siteUrl } from "@/lib/utils";
import { newPasswordSchema, resetRequestSchema, signInSchema } from "@/lib/validations/auth";
import { requireAdmin } from "@/lib/auth";
import { fail, type ActionResult } from "./result";

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function signIn(input: unknown, next?: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail("O Supabase ainda não foi configurado (veja o README).");
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return fail("E-mail ou senha incorretos");

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return fail("Esta conta não tem acesso ao painel. Peça à proprietária para liberar seu acesso.");
  }
  redirect(safeNext(next));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Sempre responde com a mesma mensagem, para não revelar quais e-mails existem. */
export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "E-mail inválido");
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: siteUrl("/auth/callback?next=/admin/conta"),
    });
  }
  return { ok: true, message: "Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha." };
}

export async function updatePassword(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Senha inválida");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(error.code === "same_password" ? "Escolha uma senha diferente da atual" : "Não foi possível alterar a senha");
  return { ok: true, message: "Senha alterada com sucesso" };
}
