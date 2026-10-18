import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { ResetRequestForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false } };

export default function ResetPage() {
  return (
    <AuthShell title="Recuperar senha" description="Enviaremos um link para você criar uma nova senha.">
      <ResetRequestForm />
    </AuthShell>
  );
}
