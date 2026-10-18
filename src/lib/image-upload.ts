"use client";

import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, STORAGE_BUCKET } from "./constants";
import type { StorageFolder } from "./storage";
import { createClient } from "./supabase/client";

const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;
const MAX_DIMENSION = 2000;

/** Confere formato e tamanho antes de qualquer processamento. Retorna a mensagem de erro, se houver. */
export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${file.name}: use fotos JPG, PNG, WEBP ou AVIF`;
  if (file.size > MAX_ORIGINAL_BYTES) return `${file.name}: a foto original deve ter até 20 MB`;
  return null;
}

/** Redimensiona para no máximo 2000 px e converte para WEBP (qualidade 85%). */
export async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (!blob || blob.type !== "image/webp") return file;
    return blob.size < file.size || file.size > MAX_UPLOAD_BYTES ? blob : file;
  } catch {
    return file;
  }
}

const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/avif": "avif" };

/** Envia a foto já otimizada para o bucket público. O RLS só permite administradores. */
export async function uploadImage(file: File, folder: StorageFolder): Promise<{ path: string } | { error: string }> {
  const invalid = validateImageFile(file);
  if (invalid) return { error: invalid };
  const blob = await compressImage(file);
  if (blob.size > MAX_UPLOAD_BYTES) return { error: `${file.name}: mesmo otimizada, a foto passou de 5 MB` };

  const ext = EXT[blob.type] ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await createClient()
    .storage.from(STORAGE_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) return { error: `${file.name}: falha no envio (${error.message})` };
  return { path };
}
