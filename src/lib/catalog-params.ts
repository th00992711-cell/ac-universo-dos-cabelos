import { SORT_OPTIONS, type SortValue } from "./constants";
import type { CatalogFilters } from "./services/catalog";

type Params = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []).map((s) => s.trim()).filter(Boolean).slice(0, 20);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Converte a query string do catálogo em filtros validados. */
export function parseCatalogParams(params: Params): CatalogFilters {
  const ordem = one(params.ordem);
  const disp = one(params.disponibilidade);
  const pagina = Math.max(1, Math.min(500, Math.floor(num(params.pagina) ?? 1)));
  return {
    q: one(params.q)?.slice(0, 80),
    categoria: one(params.categoria),
    textura: list(params.textura),
    cor: list(params.cor),
    comprimento: list(params.comprimento).map(Number).filter((n) => Number.isInteger(n) && n > 0),
    precoMin: num(params.preco_min),
    precoMax: num(params.preco_max),
    disponibilidade: disp === "disponivel" || disp === "sob-consulta" ? disp : undefined,
    ordem: SORT_OPTIONS.some((o) => o.value === ordem) ? (ordem as SortValue) : "destaque",
    pagina,
  };
}

export function hasActiveFilters(f: CatalogFilters) {
  return Boolean(
    f.q || f.categoria || f.textura.length || f.cor.length || f.comprimento.length || f.precoMin !== undefined || f.precoMax !== undefined || f.disponibilidade,
  );
}

/** Monta a query string a partir dos filtros (omite valores padrão). */
export function catalogQuery(f: CatalogFilters, { includeCategory = true } = {}) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (includeCategory && f.categoria) p.set("categoria", f.categoria);
  f.textura.forEach((v) => p.append("textura", v));
  f.comprimento.forEach((v) => p.append("comprimento", String(v)));
  f.cor.forEach((v) => p.append("cor", v));
  if (f.precoMin !== undefined) p.set("preco_min", String(f.precoMin));
  if (f.precoMax !== undefined) p.set("preco_max", String(f.precoMax));
  if (f.disponibilidade) p.set("disponibilidade", f.disponibilidade);
  if (f.ordem !== "destaque") p.set("ordem", f.ordem);
  if (f.pagina > 1) p.set("pagina", String(f.pagina));
  const s = p.toString();
  return s ? `?${s}` : "";
}
