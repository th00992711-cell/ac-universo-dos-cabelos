export const BRAND_NAME = "AC Universo dos Cabelos";
export const INSTAGRAM_HANDLE = "ac.universodoscabelos";
export const STORAGE_BUCKET = "site-images";
export const CATALOG_PAGE_SIZE = 12;
export const MAX_PRODUCT_IMAGES = 10;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/categorias", label: "Categorias" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
] as const;

/** Sugestões exibidas nos campos do cadastro; a proprietária pode digitar outros valores. */
export const SUGGESTIONS = {
  hairType: ["Cabelo humano", "Cabelo humano virgem", "Cabelo orgânico", "Fibra sintética"],
  texture: ["Liso", "Ondulado", "Cacheado", "Crespo"],
  color: ["Preto natural", "Castanho escuro", "Castanho claro", "Loiro", "Ruivo", "Mel", "Ombré"],
  origin: ["Brasileiro", "Indiano", "Peruano", "Vietnamita"],
};

export const SORT_OPTIONS = [
  { value: "destaque", label: "Destaques" },
  { value: "novidades", label: "Novidades" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
