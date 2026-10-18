export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** Permite abrir o site sem Supabase configurado (catálogo vazio e aviso no painel). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
