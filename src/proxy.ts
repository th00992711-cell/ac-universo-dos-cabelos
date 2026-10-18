import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Só o painel e o retorno de login precisam da sessão; o site público fica livre de cookies (e em cache).
export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
