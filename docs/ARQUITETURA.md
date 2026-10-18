# Arquitetura — AC Universo dos Cabelos

## 1. Visão geral

```
Navegador ──► Vercel (Next.js 16, App Router)
               ├─ Páginas públicas: renderizadas no servidor e guardadas em cache (ISR, 5 min)
               │   └─ cliente Supabase sem cookies, chave publicável, só lê o que o RLS libera
               ├─ Painel /admin: renderizado por requisição com a sessão do administrador
               │   └─ Server Actions (requireAdmin + validação Zod) → Supabase
               └─ proxy.ts: renova a sessão e barra /admin sem login
Supabase
  ├─ PostgreSQL com RLS em todas as tabelas + funções SECURITY DEFINER para estoque e métricas
  ├─ Auth (e-mail e senha, cadastro público desligado)
  └─ Storage: bucket público "site-images" (escrita só para admins)
```

Ao salvar qualquer coisa no painel, `revalidatePath("/", "layout")` invalida o cache e o site público reflete a mudança na próxima visita.

**Conversão:** todos os botões levam ao WhatsApp configurado pela proprietária. Na página de produto, a mensagem é montada a partir do modelo com `{produto}` e `{sku}`.

**Preparado para carrinho:** preço efetivo calculado no banco (`effective_price`), SKU único e estoque transacional permitem adicionar carrinho/checkout sem refazer o catálogo.

## 2. Páginas

| Rota | Conteúdo | Renderização |
|---|---|---|
| `/` | Banner principal, categorias, destaques, imagens promocionais, lançamentos, promoções, diferenciais, chamada para WhatsApp/Instagram | ISR 5 min |
| `/catalogo` | Busca, filtros (categoria, textura, comprimento, cor, faixa de preço, disponibilidade), ordenação, paginação, skeletons | Dinâmica (query string) |
| `/categorias` | Grade de categorias | ISR |
| `/categorias/[slug]` | Catálogo filtrado pela categoria | Dinâmica |
| `/produto/[slug]` | Galeria com zoom e tela cheia, preço, disponibilidade, ficha técnica, informações adicionais, WhatsApp, relacionados, JSON-LD | ISR |
| `/sobre`, `/contato`, `/politica-de-privacidade` | Textos editáveis no painel | ISR |
| `/admin/*` | Painel | Dinâmica, protegida |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/manifest.webmanifest` | SEO | Gerados |

## 3. Design system

**Paleta** (derivada da logo oficial, em `public/brand/`):

| Token | Cor | Uso |
|---|---|---|
| `gold` | `#C9A24D` | Botões, filetes, ícones, destaques |
| `gold-deep` | `#B58A36` | Hover dos botões, gradiente do monograma |
| `gold-ink` | `#8A6829` | Texto dourado sobre fundo claro (contraste AA) |
| `champagne` / `champagne-soft` | `#E8D7B0` / `#F3EAD6` | Fundos de seção, placeholders |
| `ivory` | `#FAF8F4` | Fundo do site |
| `white` | `#FFFFFF` | Cards |
| `cocoa` / `cocoa-deep` | `#473727` / `#2B2016` | Texto e títulos, faixa escura de chamada |

Texto sobre botão dourado usa `cocoa-deep` (contraste ~6:1); branco sobre dourado não atinge o mínimo de acessibilidade.

**Tipografia:** Cormorant Garamond (títulos, serifada elegante, algarismos alinhados) + Manrope (navegação, textos, botões). Rótulos pequenos em caixa alta com espaçamento amplo (`eyebrow`).

**Elementos:** moldura em arco no banner principal, filetes dourados (`gold-rule`), cards brancos com borda champagne e sombra suave que sobe 3 px no hover (`card-lift`), botões em pílula, animação de entrada discreta no topo (desligada para quem prefere menos movimento).

**Componentes base** (`src/components/ui`): Button (default dourado, dark, outline, secondary, ghost, link, whatsapp), Input, Textarea, NativeSelect, Switch, Field (rótulo + dica + erro acessível), Dialog, Sheet, Table, Badge, Card, Skeleton, Toaster.

## 4. Modelo de dados

```
auth.users 1─1 admin_users
categories 1─N products 1─N product_images
                products 1─N inventory_movements
                products 1─N product_views_daily
site_settings (linha única)      banners (hero | promo)
```

| Tabela | Campos principais | Regras |
|---|---|---|
| `admin_users` | user_id (PK → auth.users), full_name, role (owner/admin) | Sem política de escrita: só via SQL Editor |
| `categories` | name, slug (único), description, image_url/path, sort_order, is_active | Público lê as ativas |
| `products` | sku (único), name, slug (único), category_id, descrições, hair_type, texture, length_cm, weight_grams, color, origin, price, promo_price (< price), effective_price (gerado), stock_quantity (≥ 0), min_stock, status (active/inactive/archived), is_featured, is_new, sort_order, additional_info (jsonb) | Público lê os ativos e não vê `min_stock`; estoque só muda pela função |
| `product_images` | product_id, storage_path, url, alt, sort_order, is_primary (uma por produto) | Segue a visibilidade do produto |
| `inventory_movements` | product_id, movement_type (entrada/saida/ajuste), quantity_change, previous/new_quantity, reason, created_by | Somente admin lê; gravação pela função |
| `site_settings` | marca, logo, WhatsApp e mensagens, Instagram, contato, redes, textos, diferenciais (jsonb), rodapé, privacidade, SEO, metrics_enabled | Público lê; admin altera |
| `banners` | placement, título, subtítulo, 2 botões (rótulo + link), imagem, ordem, ativo | Público lê os ativos |
| `product_views_daily` | product_id, day, views | Somente admin lê; incremento por `track_product_view` |

**Funções:** `is_admin()`, `register_inventory_movement()` (trava a linha, impede negativo, registra histórico), `replace_product_images()` (troca fotos numa transação), `track_product_view()` (respeita a chave de métricas), `catalog_filter_options()` (valores reais para os filtros).

Todas as tabelas têm timestamps, chaves estrangeiras com `on delete` definido, constraints de formato/limites e índices para os filtros do catálogo.

## 5. Etapas executadas

1. Arquitetura, identidade visual, estrutura de pastas e modelagem de dados.
2. Layout público, página inicial e componentes visuais.
3. Catálogo, filtros e páginas de produto.
4. Supabase: tabelas, autenticação e políticas RLS (testadas em PostgreSQL 16 com Auth do Supabase).
5. Painel administrativo e gestão completa de produtos.
6. Integração com WhatsApp e configurações da loja.
7. Testes de ponta a ponta, segurança, responsividade, SEO e otimizações.
8. Preparação para GitHub e Vercel (README).
