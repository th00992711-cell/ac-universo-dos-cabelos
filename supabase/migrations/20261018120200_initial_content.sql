-- AC Universo dos Cabelos — 3/3: conteúdo inicial editável pelo painel
-- Nenhum produto, preço ou número é inventado: a proprietária cadastra tudo pelo /admin.

insert into public.site_settings (
  id, business_name, tagline, instagram_handle,
  whatsapp_default_message, whatsapp_product_message,
  about_title, about_text, benefits_title, benefits, footer_text, seo_description
) values (
  1,
  'AC Universo dos Cabelos',
  'Cabelos selecionados para valorizar a sua beleza.',
  'ac.universodoscabelos',
  'Olá! Vim pelo site da AC Universo dos Cabelos e gostaria de atendimento.',
  'Olá! Vim pelo site da AC Universo dos Cabelos e gostaria de saber mais sobre o produto {produto}, código {sku}.',
  'Sobre a AC Universo dos Cabelos',
  'Escreva aqui a história da marca pelo painel administrativo, em Configurações > Textos institucionais.',
  'Por que escolher a AC',
  '[
    {"icon": "sparkles", "title": "Atendimento personalizado", "description": "Uma consultora acompanha sua escolha do início ao fim pelo WhatsApp."},
    {"icon": "gem", "title": "Variedade de produtos", "description": "Texturas, comprimentos e cores para diferentes estilos."},
    {"icon": "heart", "title": "Compromisso com a qualidade", "description": "Cada peça é selecionada com cuidado antes de chegar até você."}
  ]'::jsonb,
  'Cabelos selecionados com carinho para valorizar a sua beleza.',
  'Catálogo de cabelos da AC Universo dos Cabelos: lisos, ondulados, cacheados, crespos, mega hair e acessórios. Atendimento personalizado pelo WhatsApp.'
)
on conflict (id) do nothing;

insert into public.categories (name, slug, description, sort_order) values
  ('Cabelos lisos', 'cabelos-lisos', 'Fios lisos com caimento natural e movimento.', 1),
  ('Cabelos ondulados', 'cabelos-ondulados', 'Ondas suaves para um visual leve e sofisticado.', 2),
  ('Cabelos cacheados', 'cabelos-cacheados', 'Cachos definidos, cheios de volume e personalidade.', 3),
  ('Cabelos crespos', 'cabelos-crespos', 'Textura crespa com volume e beleza natural.', 4),
  ('Cabelos naturais', 'cabelos-naturais', 'Fios naturais selecionados.', 5),
  ('Mega hair', 'mega-hair', 'Mechas para alongamento e volume.', 6),
  ('Acessórios', 'acessorios', 'Itens para cuidar e manter o seu cabelo.', 7)
on conflict (slug) do nothing;

insert into public.banners (placement, title, subtitle, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, sort_order)
select 'hero',
  'Sua beleza merece o extraordinário.',
  'Descubra nossa seleção de cabelos, escolhidos para valorizar sua beleza, seu estilo e sua personalidade.',
  'Explorar catálogo', '/catalogo',
  'Falar com uma consultora', 'whatsapp',
  0
where not exists (select 1 from public.banners where placement = 'hero');
