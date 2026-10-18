import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(80%_60%_at_50%_0%,#f3ead6,transparent_70%)] px-4 py-12">
      <div className="grid w-full max-w-md gap-8">
        <Link href="/" className="mx-auto">
          <Logo />
        </Link>
        <div className="grid gap-6 rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-9">
          <div className="grid gap-1.5 text-center">
            <h1 className="text-3xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {!isSupabaseConfigured && (
            <p role="alert" className="rounded-xl border border-amber-700/20 bg-amber-50 p-3 text-sm text-amber-900">
              O Supabase ainda não foi configurado. Cadastre as variáveis de ambiente descritas no README.
            </p>
          )}
          {children}
        </div>
      </div>
    </main>
  );
}
