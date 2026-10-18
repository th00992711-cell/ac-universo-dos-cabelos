-- AC Universo dos Cabelos — 2/3: permissões, funções seguras, RLS e Storage
-- Execute depois de 20261018120000_schema.sql.

-- ---------------------------------------------------------------------------
-- Quem é administrador
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Estoque: só muda pela função register_inventory_movement (com histórico).
-- Um UPDATE direto em products.stock_quantity é recusado.
-- ---------------------------------------------------------------------------
create or replace function public.guard_stock_quantity()
returns trigger
language plpgsql
as $$
begin
  if new.stock_quantity is distinct from old.stock_quantity
     and coalesce(current_setting('app.inventory_movement', true), '') <> 'on' then
    raise exception 'Use a movimentação de estoque para alterar quantidades'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger products_guard_stock before update on public.products
  for each row execute function public.guard_stock_quantity();

-- Registra o estoque inicial de um produto recém-criado.
create or replace function public.log_initial_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stock_quantity > 0 then
    insert into public.inventory_movements
      (product_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, created_by)
    values (new.id, 'entrada', new.stock_quantity, 0, new.stock_quantity, 'Estoque inicial', auth.uid());
  end if;
  return new;
end;
$$;

create trigger products_initial_stock after insert on public.products
  for each row execute function public.log_initial_stock();

/**
 * Entrada soma, saída subtrai e ajuste define a quantidade final.
 * Trava a linha do produto (FOR UPDATE) para que duas operações simultâneas
 * não se atropelem, e nunca deixa o estoque negativo.
 */
create or replace function public.register_inventory_movement(
  p_product_id uuid,
  p_type text,
  p_quantity int,
  p_reason text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current int;
  v_new int;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;
  if p_type not in ('entrada', 'saida', 'ajuste') then
    raise exception 'Tipo de movimentação inválido' using errcode = '22023';
  end if;
  if p_quantity is null or p_quantity < 0 or (p_type <> 'ajuste' and p_quantity = 0) then
    raise exception 'Quantidade inválida' using errcode = '22023';
  end if;

  select stock_quantity into v_current from public.products where id = p_product_id for update;
  if not found then
    raise exception 'Produto não encontrado' using errcode = 'P0002';
  end if;

  v_new := case p_type
    when 'entrada' then v_current + p_quantity
    when 'saida' then v_current - p_quantity
    else p_quantity
  end;

  if v_new < 0 then
    raise exception 'Estoque insuficiente: há % unidade(s) disponível(is)', v_current using errcode = '23514';
  end if;
  if v_new = v_current then
    return v_current;
  end if;

  perform set_config('app.inventory_movement', 'on', true);
  update public.products set stock_quantity = v_new where id = p_product_id;
  perform set_config('app.inventory_movement', 'off', true);

  insert into public.inventory_movements
    (product_id, movement_type, quantity_change, previous_quantity, new_quantity, reason, created_by)
  values (p_product_id, p_type, v_new - v_current, v_current, v_new, nullif(left(trim(p_reason), 300), ''), auth.uid());

  return v_new;
end;
$$;

revoke all on function public.register_inventory_movement(uuid, text, int, text) from public;
grant execute on function public.register_inventory_movement(uuid, text, int, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Métricas: o site público conta uma visualização por chamada.
-- Só conta produtos ativos e só quando as métricas estão ligadas.
-- ---------------------------------------------------------------------------
create or replace function public.track_product_view(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not coalesce((select metrics_enabled from public.site_settings where id = 1), false) then
    return;
  end if;
  if not exists (select 1 from public.products where id = p_product_id and status = 'active') then
    return;
  end if;

  insert into public.product_views_daily (product_id, day, views)
  values (p_product_id, current_date, 1)
  on conflict (product_id, day) do update set views = public.product_views_daily.views + 1;
end;
$$;

revoke all on function public.track_product_view(uuid) from public;
grant execute on function public.track_product_view(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Opções dos filtros do catálogo (somente valores de produtos ativos)
-- ---------------------------------------------------------------------------
create or replace function public.catalog_filter_options()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'textures', coalesce((select jsonb_agg(distinct texture order by texture) from products where status = 'active' and texture is not null), '[]'::jsonb),
    'colors', coalesce((select jsonb_agg(distinct color order by color) from products where status = 'active' and color is not null), '[]'::jsonb),
    'lengths', coalesce((select jsonb_agg(distinct length_cm order by length_cm) from products where status = 'active' and length_cm is not null), '[]'::jsonb),
    'min_price', (select min(effective_price) from products where status = 'active'),
    'max_price', (select max(effective_price) from products where status = 'active')
  );
$$;

grant execute on function public.catalog_filter_options() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.site_settings enable row level security;
alter table public.banners enable row level security;
alter table public.product_views_daily enable row level security;

-- admin_users: cada admin enxerga a lista; ninguém grava pela API
create policy "admin_users: admins leem" on public.admin_users
  for select to authenticated using (public.is_admin());

-- categorias: público vê as ativas
create policy "categorias: leitura pública das ativas" on public.categories
  for select using (is_active or public.is_admin());
create policy "categorias: admin insere" on public.categories
  for insert to authenticated with check (public.is_admin());
create policy "categorias: admin altera" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "categorias: admin exclui" on public.categories
  for delete to authenticated using (public.is_admin());

-- produtos: público vê somente os ativos
create policy "produtos: leitura pública dos ativos" on public.products
  for select using (status = 'active' or public.is_admin());
create policy "produtos: admin insere" on public.products
  for insert to authenticated with check (public.is_admin());
create policy "produtos: admin altera" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "produtos: admin exclui" on public.products
  for delete to authenticated using (public.is_admin());

-- imagens: seguem a visibilidade do produto
create policy "imagens: leitura pública de produtos ativos" on public.product_images
  for select using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.status = 'active')
  );
create policy "imagens: admin insere" on public.product_images
  for insert to authenticated with check (public.is_admin());
create policy "imagens: admin altera" on public.product_images
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "imagens: admin exclui" on public.product_images
  for delete to authenticated using (public.is_admin());

-- estoque: somente admin lê; gravação só pela função acima (sem política de insert)
create policy "estoque: admin lê" on public.inventory_movements
  for select to authenticated using (public.is_admin());

-- configurações: leitura pública (não há segredos aqui), escrita do admin
create policy "configurações: leitura pública" on public.site_settings
  for select using (true);
create policy "configurações: admin altera" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- banners
create policy "banners: leitura pública dos ativos" on public.banners
  for select using (is_active or public.is_admin());
create policy "banners: admin insere" on public.banners
  for insert to authenticated with check (public.is_admin());
create policy "banners: admin altera" on public.banners
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "banners: admin exclui" on public.banners
  for delete to authenticated using (public.is_admin());

-- métricas: somente admin lê; gravação pela função track_product_view
create policy "métricas: admin lê" on public.product_views_daily
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Imagens de um produto: troca a lista inteira numa única transação
-- (ordem e foto principal). Roda com as permissões de quem chama (RLS vale).
-- ---------------------------------------------------------------------------
create or replace function public.replace_product_images(p_product_id uuid, p_images jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;
  if jsonb_typeof(p_images) <> 'array' or jsonb_array_length(p_images) > 12 then
    raise exception 'Lista de imagens inválida' using errcode = '22023';
  end if;

  delete from public.product_images where product_id = p_product_id;

  insert into public.product_images (product_id, storage_path, url, alt, sort_order, is_primary)
  select p_product_id,
         img ->> 'storage_path',
         img ->> 'url',
         nullif(img ->> 'alt', ''),
         (ord - 1)::int,
         ord = 1
  from jsonb_array_elements(p_images) with ordinality as t(img, ord);
end;
$$;

revoke all on function public.replace_product_images(uuid, jsonb) from public;
grant execute on function public.replace_product_images(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Permissões de tabela da Data API (o RLS acima decide quais linhas)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- Colunas internas que o público não precisa ver
-- ---------------------------------------------------------------------------
revoke select on public.products from anon;
grant select (
  id, sku, name, slug, category_id, short_description, description, hair_type, texture,
  length_cm, weight_grams, color, origin, price, promo_price, effective_price, stock_quantity,
  status, is_featured, is_new, sort_order, additional_info, created_at, updated_at
) on public.products to anon;

-- ---------------------------------------------------------------------------
-- Storage: bucket público "site-images" (fotos de produtos, categorias,
-- banners e logo). Qualquer pessoa vê as imagens pelo link público;
-- somente administradores enviam, substituem ou excluem.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "site-images: admin lista" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-images' and public.is_admin());
create policy "site-images: admin envia" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'site-images'
    and public.is_admin()
    and (storage.foldername(name))[1] in ('products', 'categories', 'banners', 'branding')
  );
create policy "site-images: admin altera" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-images' and public.is_admin());
create policy "site-images: admin exclui" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-images' and public.is_admin());
