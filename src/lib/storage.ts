import { STORAGE_BUCKET } from "./constants";
import { supabaseUrl } from "./supabase/env";

export type StorageFolder = "products" | "categories" | "banners" | "branding";

const PATH_RE = /^(products|categories|banners|branding)\/[A-Za-z0-9-]+\.(webp|jpg|jpeg|png|avif)$/;

export function isValidStoragePath(path: string, folder?: StorageFolder) {
  return PATH_RE.test(path) && (!folder || path.startsWith(`${folder}/`));
}

/** URL pública montada no servidor a partir do caminho (não confiamos em URLs vindas do navegador). */
export function publicImageUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}
