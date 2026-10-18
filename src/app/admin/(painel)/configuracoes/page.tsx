import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/services/admin";
import { DEFAULT_SETTINGS } from "@/lib/services/settings";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const settings = await getAdminSettings();
  return (
    <div className="grid gap-6">
      <PageHeader title="Configurações do site" description="Tudo o que for salvo aqui aparece no site público imediatamente." />
      {settings ? (
        <SettingsForm settings={{ ...DEFAULT_SETTINGS, ...Object.fromEntries(Object.entries(settings).filter(([, v]) => v !== null)) }} />
      ) : (
        <p role="alert" className="rounded-2xl border border-amber-700/20 bg-amber-50 p-5 text-sm text-amber-900">
          A tabela de configurações está vazia. Rode o arquivo supabase/migrations/20261018120200_initial_content.sql no SQL Editor do Supabase.
        </p>
      )}
    </div>
  );
}
