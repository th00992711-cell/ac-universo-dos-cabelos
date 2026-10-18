import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

export type AdminSession = { userId: string; email: string; fullName: string; role: "owner" | "admin" };

/** Usuário autenticado + registro em admin_users. Verificado no servidor a cada requisição. */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  await cookies(); // o painel sempre renderiza por requisição
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("admin_users").select("full_name, role").eq("user_id", auth.user.id).maybeSingle();
  if (!data) return null;
  return { userId: auth.user.id, email: auth.user.email ?? "", fullName: data.full_name, role: data.role };
});

/** Use no início de páginas e Server Actions do painel. O RLS no banco é a segunda barreira. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
