import { z } from "zod";

export const text = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres`);

export const requiredText = (label: string, min: number, max: number) =>
  z.string().trim().min(min, `Informe ${label}`).max(max, `Use no máximo ${max} caracteres`);

/** Inteiro opcional digitado como texto ("" = vazio). */
export const optionalInt = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= min && Number(v) <= max), `${label}: use um número inteiro entre ${min} e ${max}`);

export const requiredInt = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= min && Number(v) <= max, `${label}: use um número inteiro entre ${min} e ${max}`);

/** Valor em reais: aceita "1290", "1290,50" ou "1.290,50". */
export const money = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || parseMoney(v) !== null, `${label}: valor inválido (ex.: 1290,00)`);

export function parseMoney(v: string): number | null {
  if (!v.trim()) return null;
  const normalized = v.trim().replace(/\s|R\$/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const n = Number(normalized);
  return n <= 9_999_999 ? n : null;
}

export const toInt = (v: string) => (v.trim() === "" ? null : Number(v));
export const toNull = (v: string | undefined | null) => (v && v.trim() ? v.trim() : null);

/** Link interno ("/catalogo"), externo (https://) ou "whatsapp". */
export const linkHref = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || v === "whatsapp" || /^\/(?!\/)/.test(v) || /^https:\/\/[^\s]+$/.test(v), "Use um caminho do site (/catalogo), um link https:// ou a palavra whatsapp");

export const storagePath = z.string().regex(/^(products|categories|banners|branding)\/[A-Za-z0-9-]+\.(webp|jpg|jpeg|png|avif)$/, "Imagem inválida");
