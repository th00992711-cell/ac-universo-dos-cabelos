import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./env";

/**
 * Cliente sem cookies para as páginas públicas. Lê apenas o que o RLS libera
 * para visitantes e permite que o Next.js guarde as páginas em cache (ISR).
 */
export function createPublicClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
