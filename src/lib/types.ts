export type ProductStatus = "active" | "inactive" | "archived";
export type MovementType = "entrada" | "saida" | "ajuste";
export type BannerPlacement = "hero" | "promo";

export type InfoItem = { label: string; value: string };
export type Benefit = { icon: string; title: string; description: string };

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  storage_path?: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
};

/** Campos que os visitantes podem ler (ver grant de colunas na migração 2). */
export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  hair_type: string | null;
  texture: string | null;
  length_cm: number | null;
  weight_grams: number | null;
  color: string | null;
  origin: string | null;
  price: number | null;
  promo_price: number | null;
  effective_price: number | null;
  stock_quantity: number;
  status: ProductStatus;
  is_featured: boolean;
  is_new: boolean;
  sort_order: number;
  additional_info: InfoItem[];
  created_at: string;
  updated_at: string;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
};

export type ProductCardData = Pick<
  Product,
  | "id"
  | "sku"
  | "name"
  | "slug"
  | "price"
  | "promo_price"
  | "effective_price"
  | "length_cm"
  | "texture"
  | "stock_quantity"
  | "is_new"
  | "images"
>;

export type AdminProduct = Product & { min_stock: number };

export type SiteSettings = {
  business_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_path: string | null;
  whatsapp_number: string | null;
  whatsapp_default_message: string | null;
  whatsapp_product_message: string | null;
  instagram_handle: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  business_hours: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  about_title: string | null;
  about_text: string | null;
  benefits_title: string | null;
  benefits: Benefit[];
  footer_text: string | null;
  privacy_policy: string | null;
  seo_description: string | null;
  metrics_enabled: boolean;
};

export type Banner = {
  id: string;
  placement: BannerPlacement;
  title: string;
  subtitle: string | null;
  primary_cta_label: string | null;
  primary_cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  image_url: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
};

export type InventoryMovement = {
  id: string;
  product_id: string;
  movement_type: MovementType;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  created_at: string;
  product: { name: string; sku: string } | null;
};
