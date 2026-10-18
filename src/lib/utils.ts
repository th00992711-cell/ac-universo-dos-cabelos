import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(value: number | string | null | undefined) {
  return brl.format(Number(value ?? 0));
}

export function formatDate(value: string | Date, withTime = true) {
  return new Intl.DateTimeFormat("pt-BR", withTime ? { dateStyle: "short", timeStyle: "short" } : { dateStyle: "short" }).format(
    new Date(value),
  );
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

/** Disponibilidade exibida ao cliente, derivada da quantidade em estoque. */
export function availability(stock: number) {
  if (stock <= 0) return { label: "Sob consulta", tone: "muted" as const };
  if (stock <= 2) return { label: "Últimas unidades", tone: "warning" as const };
  return { label: "Disponível", tone: "success" as const };
}

export function primaryImage<T extends { is_primary: boolean; sort_order: number }>(images: T[] | null | undefined) {
  if (!images?.length) return undefined;
  return images.find((i) => i.is_primary) ?? [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
}

export function sortImages<T extends { sort_order: number }>(images: T[] | null | undefined) {
  return [...(images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}
