-- AC Universo dos Cabelos — 1/3: tabelas, índices, constraints e gatilhos
-- Execute no SQL Editor do Supabase, na ordem dos arquivos (1, 2 e 3).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Administradores
-- Só entra nesta tabela quem for cadastrado pelo SQL Editor (ver README).
-- Nenhuma política de escrita é criada: ninguém se promove pelo site.
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'admin' check (role in ('owner', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 600),
  image_url text,
  image_path text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_active_order_idx on public.categories (is_active, sort_order, name);
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Produtos
-- status: active (visível no site), inactive (oculto), archived (fora de uso)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique check (sku ~ '^[A-Za-z0-9._-]{2,40}$'),
  name text not null check (char_length(name) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.categories (id) on delete set null,
  short_description text check (char_length(short_description) <= 300),
  description text check (char_length(description) <= 8000),
  hair_type text check (char_length(hair_type) <= 60),
  texture text check (char_length(texture) <= 60),
  length_cm int check (length_cm between 1 and 200),
  weight_grams int check (weight_grams between 1 and 5000),
  color text check (char_length(color) <= 60),
  origin text check (char_length(origin) <= 80),
  price numeric(10, 2) check (price >= 0),
  promo_price numeric(10, 2) check (promo_price >= 0),
  effective_price numeric(10, 2) generated always as (coalesce(promo_price, price)) stored,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  min_stock int not null default 1 check (min_stock >= 0),
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  is_featured boolean not null default false,
  is_new boolean not null default false,
  sort_order int not null default 0,
  additional_info jsonb not null default '[]'::jsonb check (jsonb_typeof(additional_info) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_promo_lower_than_price check (promo_price is null or (price is not null and promo_price < price))
);

create index products_status_idx on public.products (status, sort_order, created_at desc);
create index products_category_idx on public.products (category_id) where status = 'active';
create index products_featured_idx on public.products (is_featured) where status = 'active' and is_featured;
create index products_effective_price_idx on public.products (effective_price);
create index products_texture_idx on public.products (texture);
create index products_length_idx on public.products (length_cm);
create index products_color_idx on public.products (color);
create index products_name_search_idx on public.products using gin (to_tsvector('portuguese', name));

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Imagens dos produtos (arquivos no bucket "site-images")
-- ---------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null check (storage_path ~ '^products/[A-Za-z0-9/_.-]+$'),
  url text not null,
  alt text check (char_length(alt) <= 200),
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, sort_order);
create unique index product_images_one_primary_idx on public.product_images (product_id) where is_primary;

-- ---------------------------------------------------------------------------
-- Movimentações de estoque (histórico imutável)
-- ---------------------------------------------------------------------------
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  movement_type text not null check (movement_type in ('entrada', 'saida', 'ajuste')),
  quantity_change int not null check (quantity_change <> 0),
  previous_quantity int not null check (previous_quantity >= 0),
  new_quantity int not null check (new_quantity >= 0),
  reason text check (char_length(reason) <= 300),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint inventory_movements_math check (previous_quantity + quantity_change = new_quantity)
);

create index inventory_movements_product_idx on public.inventory_movements (product_id, created_at desc);
create index inventory_movements_created_idx on public.inventory_movements (created_at desc);

-- ---------------------------------------------------------------------------
-- Configurações do site (linha única, id = 1)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'AC Universo dos Cabelos',
  tagline text,
  logo_url text,
  logo_path text,
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{10,15}$'),
  whatsapp_default_message text,
  whatsapp_product_message text,
  instagram_handle text,
  email text,
  phone text,
  address text,
  business_hours text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  about_title text,
  about_text text,
  benefits_title text,
  benefits jsonb not null default '[]'::jsonb check (jsonb_typeof(benefits) = 'array'),
  footer_text text,
  privacy_policy text,
  seo_description text,
  metrics_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Banners: "hero" (banner principal da home) e "promo" (imagens promocionais)
-- ---------------------------------------------------------------------------
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'hero' check (placement in ('hero', 'promo')),
  title text not null check (char_length(title) between 1 and 140),
  subtitle text check (char_length(subtitle) <= 400),
  primary_cta_label text check (char_length(primary_cta_label) <= 40),
  primary_cta_href text check (char_length(primary_cta_href) <= 300),
  secondary_cta_label text check (char_length(secondary_cta_label) <= 40),
  secondary_cta_href text check (char_length(secondary_cta_href) <= 300),
  image_url text,
  image_path text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index banners_placement_idx on public.banners (placement, is_active, sort_order);
create trigger banners_updated_at before update on public.banners
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Métricas: visualizações por produto e por dia
-- ---------------------------------------------------------------------------
create table public.product_views_daily (
  product_id uuid not null references public.products (id) on delete cascade,
  day date not null default current_date,
  views int not null default 0 check (views >= 0),
  primary key (product_id, day)
);

create index product_views_daily_day_idx on public.product_views_daily (day);
