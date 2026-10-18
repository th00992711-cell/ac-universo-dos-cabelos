import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Recebe o link de e-mail do Supabase (recuperação de senha) e cria a sessão. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const target = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${target}`);
  }
  return NextResponse.redirect(`${origin}/admin/login?erro=link`);
}
