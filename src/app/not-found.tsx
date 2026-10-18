import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="text-5xl">Página não encontrada</h1>
      <Link href="/" className="text-gold-ink underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  );
}
