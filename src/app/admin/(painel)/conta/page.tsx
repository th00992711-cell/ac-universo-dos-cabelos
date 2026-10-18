import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PasswordForm } from "@/components/admin/auth-forms";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: admins } = await supabase.from("admin_users").select("full_name, role, created_at").order("created_at");

  return (
    <div className="grid gap-6">
      <PageHeader title="Minha conta" description={admin.email} />
      <Card>
        <h2 className="text-2xl">Alterar senha</h2>
        <PasswordForm />
      </Card>
      <Card>
        <h2 className="text-2xl">Administradores</h2>
        <ul className="divide-y divide-border">
          {(admins ?? []).map((a, i) => (
            <li key={i} className="flex justify-between py-2.5 text-sm">
              <span>{a.full_name || "Sem nome"}</span>
              <span className="text-muted-foreground">{a.role === "owner" ? "Proprietária" : "Administrador"}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Por segurança, novos administradores são liberados apenas pelo SQL Editor do Supabase (passo a passo no README). Ninguém consegue se promover pelo site.
        </p>
      </Card>
    </div>
  );
}
