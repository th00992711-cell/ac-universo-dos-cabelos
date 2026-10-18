import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/auth-forms";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return (
    <AuthShell title="Painel administrativo" description="Acesso restrito à equipe da AC Universo dos Cabelos.">
      <LoginForm next={next} linkError={sp.erro === "link"} />
    </AuthShell>
  );
}
