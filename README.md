# AC Universo dos Cabelos — catálogo premium com painel administrativo

Catálogo digital da **AC Universo dos Cabelos** (@ac.universodoscabelos) com conversão pelo WhatsApp e painel para a proprietária cadastrar produtos, preços, fotos, categorias, estoque, banners e textos do site sem programar.

- **Site público:** início, catálogo com busca e filtros, categorias, página de produto com galeria e zoom, sobre nós, contato e política de privacidade.
- **Painel (`/admin`):** visão geral com números reais, produtos (cadastrar, editar, duplicar, arquivar, excluir, ativar, destacar, ordenar), fotos, categorias, estoque com histórico, banners e configurações.
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · componentes no padrão shadcn/ui (Radix) · Lucide · Supabase (PostgreSQL, Auth, Storage, RLS) · Vercel.

A arquitetura, o design system e o modelo de dados estão em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

---

## Sumário

1. [Rodar no computador](#1-rodar-no-computador)
2. [Criar o projeto no Supabase](#2-criar-o-projeto-no-supabase)
3. [Criar o banco (SQL Editor)](#3-criar-o-banco-sql-editor)
4. [Configurar autenticação](#4-configurar-autenticação)
5. [Conferir o Storage](#5-conferir-o-storage)
6. [Cadastrar o primeiro administrador](#6-cadastrar-o-primeiro-administrador)
7. [Enviar o código para o GitHub](#7-enviar-o-código-para-o-github)
8. [Publicar na Vercel](#8-publicar-na-vercel)
9. [Primeiros passos no painel](#9-primeiros-passos-no-painel)
10. [Cadastrar o primeiro produto](#10-cadastrar-o-primeiro-produto)
11. [Problemas comuns](#11-problemas-comuns)
12. [Segurança](#12-segurança)
13. [Estrutura de pastas](#13-estrutura-de-pastas)

---

## 1. Rodar no computador

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
cp .env.example .env.local   # preencha com os dados do passo 2
npm run dev                  # http://localhost:3000
```

Outros comandos: `npm run build` (build de produção), `npm run start` (servidor de produção), `npm run lint`.

Sem as variáveis do Supabase o site abre com o catálogo vazio e o painel avisa que falta configuração.

## 2. Criar o projeto no Supabase

1. Acesse <https://supabase.com/dashboard> e clique em **New project**.
2. Nome: `ac-universo-dos-cabelos`. Região: **South America (São Paulo)**. Guarde a senha do banco num gerenciador de senhas.
3. Quando o projeto terminar de criar, abra **Project Settings → API Keys** (ou **Connect**) e copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`). Se o painel mostrar só as chaves antigas, use a **anon public** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

> ⚠️ Nunca use a chave **secret** / **service_role** no site. Ela ignora todas as regras de segurança. Este projeto não precisa dela.

## 3. Criar o banco (SQL Editor)

No Supabase, abra **SQL Editor → New query**. Para cada arquivo abaixo, **nesta ordem**, abra o arquivo, copie todo o conteúdo, cole no editor e clique em **Run**:

| Ordem | Arquivo | O que faz |
|---|---|---|
| 1 | `supabase/migrations/20261018120000_schema.sql` | Tabelas, índices, constraints e gatilhos |
| 2 | `supabase/migrations/20261018120100_security.sql` | RLS, funções seguras de estoque e métricas, bucket de imagens |
| 3 | `supabase/migrations/20261018120200_initial_content.sql` | Configurações iniciais, 7 categorias de exemplo e o banner principal |

Cada um deve terminar com **Success. No rows returned**. Se der erro, não rode o próximo: copie a mensagem e peça ajuda.

> Quem usa a Supabase CLI pode rodar `supabase link` e `supabase db push`, que aplica a mesma pasta `supabase/migrations`.

## 4. Configurar autenticação

Em **Authentication**:

1. **Sign In / Providers → Email**: mantenha **Email** ligado.
2. **Desligue "Allow new users to sign up"**. Só a equipe usa login, e os usuários são criados por você (passo 6).
3. **URL Configuration**:
   - **Site URL**: o endereço público do site (ex.: `https://ac-universo-dos-cabelos.vercel.app`). Enquanto testa no computador, pode ser `http://localhost:3000`.
   - **Redirect URLs**: adicione `https://SEU-DOMINIO/auth/callback` e `http://localhost:3000/auth/callback`. Isso faz o link de "Esqueci minha senha" funcionar.

## 5. Conferir o Storage

O arquivo 2 já cria o bucket **`site-images`** (público para leitura, até 5 MB por arquivo, JPG/PNG/WEBP/AVIF) e as políticas que deixam **somente administradores** enviar, trocar ou excluir arquivos. Confira em **Storage**: o bucket deve aparecer com a etiqueta **Public**. Não é preciso fazer mais nada.

As fotos são redimensionadas (máx. 2000 px) e convertidas para WEBP no navegador antes do envio, e o site ainda as otimiza na entrega.

## 6. Cadastrar o primeiro administrador

O acesso ao painel é dado pela tabela `admin_users`, que **não aceita gravações pelo site**. Só quem tem acesso ao Supabase consegue liberar um administrador, e ninguém consegue se promover sozinho.

1. **Authentication → Users → Add user → Create new user**. Informe o e-mail e uma senha forte e marque **Auto Confirm User**.
2. **SQL Editor → New query**, cole o comando abaixo trocando o e-mail e o nome, e clique em **Run**:

```sql
insert into public.admin_users (user_id, full_name, role)
select id, 'Nome da proprietária', 'owner'
from auth.users
where email = 'email-da-proprietaria@exemplo.com';
```

3. Confira (deve aparecer uma linha com o e-mail):

```sql
select u.email, a.full_name, a.role
from public.admin_users a
join auth.users u on u.id = a.user_id;
```

4. Acesse `/admin/login` e entre com esse e-mail e senha.

Para liberar outra pessoa, repita os passos 1 e 2 usando `'admin'` no lugar de `'owner'`. Para remover o acesso:

```sql
delete from public.admin_users
where user_id = (select id from auth.users where email = 'email@exemplo.com');
```

## 7. Enviar o código para o GitHub

1. Crie um repositório **privado** vazio em <https://github.com/new> (sugestão de nome: `ac-universo-dos-cabelos`), sem README.
2. Na pasta do projeto:

```bash
git init -b main          # se a pasta ainda não for um repositório
git add .
git commit -m "AC Universo dos Cabelos: catálogo e painel"
git remote add origin https://github.com/SEU-USUARIO/ac-universo-dos-cabelos.git
git push -u origin main
```

O `.gitignore` já impede o envio de `.env.local` e de qualquer arquivo `.env` com chaves.

## 8. Publicar na Vercel

1. Em <https://vercel.com/new>, clique em **Import** no repositório do GitHub. A Vercel reconhece o Next.js sozinha.
2. Antes de clicar em **Deploy**, abra **Environment Variables** e cadastre as três variáveis (para Production, Preview e Development):

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (ou anon public) |
| `NEXT_PUBLIC_SITE_URL` | Endereço do site, sem barra no final (ex.: `https://ac-universo-dos-cabelos.vercel.app`) |

3. Clique em **Deploy**.
4. Depois do primeiro deploy, volte ao passo 4 e coloque o endereço definitivo em **Site URL** e **Redirect URLs** do Supabase.

> **Importante:** variáveis `NEXT_PUBLIC_...` são gravadas no site durante o build. **Sempre que alterar uma variável na Vercel, faça um novo deploy** (Deployments → ⋯ → **Redeploy**). Colar a chave errada ou esquecer o redeploy é a causa mais comum de "o site não mostra produtos" ou "não consigo entrar".

A partir daí, cada `git push` na branch `main` publica uma nova versão automaticamente. Para usar um domínio próprio: **Vercel → Settings → Domains**, e depois atualize `NEXT_PUBLIC_SITE_URL` (com redeploy) e as URLs do passo 4.

## 9. Primeiros passos no painel

Em **Configurações**:

- **WhatsApp:** somente números, com 55 + DDD (ex.: `5511999998888`). Use o link **Testar a mensagem** para conferir.
- **Mensagem da página de produto:** `{produto}` e `{sku}` são trocados pelo nome e pelo código. Padrão: *"Olá! Vim pelo site da AC Universo dos Cabelos e gostaria de saber mais sobre o produto {produto}, código {sku}."*
- **Logo:** envie o PNG oficial com fundo transparente. Enquanto não houver logo, o site mostra o monograma "AC".
- **Textos institucionais, diferenciais, rodapé, contato e política de privacidade.**

Em **Banners**, troque a ilustração do topo por uma fotografia vertical (proporção 4:5) e cadastre imagens promocionais (horizontais, 2:1).

Em **Categorias**, ajuste nomes, descrições, fotos e ordem. As 7 categorias criadas são exemplos.

Tudo o que é salvo aparece no site na hora.

## 10. Cadastrar o primeiro produto

1. **Produtos → Novo produto.**
2. Preencha **Nome** e **SKU** (código curto e único, ex.: `LISO-60-CAST`; ele vai na mensagem do WhatsApp).
3. Escolha a **Categoria** e escreva as descrições.
4. Em **Fotos**, clique em **Adicionar fotos** e escolha uma ou várias. A primeira é a **principal**; use **Tornar principal** e as setas para reordenar. As fotos só são enviadas quando você salva.
5. Em **Características**, informe tipo de cabelo, textura, comprimento (cm), peso (g), cor e origem. Os campos sugerem valores, mas aceitam qualquer texto. **Use sempre a mesma grafia** (ex.: sempre "Liso"), pois os filtros do catálogo usam esses valores.
6. **Preço:** deixe em branco para mostrar "Preço sob consulta". O **preço promocional** precisa ser menor que o de venda e ativa o selo "Promoção".
7. **Estoque:** quantidade disponível e estoque mínimo (o painel avisa quando a quantidade chegar nele).
8. **Publicação:** status **Ativo** para aparecer no site, **Destaque** para aparecer na página inicial, **Lançamento** para a seção de lançamentos.
9. Clique em **Cadastrar produto**. O endereço da página é criado automaticamente, por exemplo `/produto/cabelo-humano-liso-60-cm` (você pode definir outro no campo slug).

Dica: para cadastrar variações (outro comprimento ou cor), use **Duplicar** na lista de produtos. A cópia nasce inativa e sem estoque; ajuste e ative.

**Estoque no dia a dia:** em **Estoque**, use **Entrada** (chegou mercadoria), **Saída** (venda) ou **Ajuste** (contagem). Cada operação fica no histórico com data, quantidade anterior e nova, e o banco não deixa o estoque ficar negativo.

## 11. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Site sem produtos e sem categorias | Variáveis erradas ou sem redeploy | Confira as variáveis na Vercel e faça **Redeploy** |
| "E-mail ou senha incorretos" | Usuário não confirmado ou senha errada | Em Authentication → Users, confira se o usuário está confirmado |
| "Esta conta não tem acesso ao painel" | Usuário não está em `admin_users` | Rode o comando do passo 6 |
| Erro ao enviar foto | Arquivo não é imagem ou falta o arquivo 2 | Use JPG/PNG/WEBP e confira se o bucket `site-images` existe |
| Link de recuperar senha não funciona | Redirect URL ausente | Adicione `https://SEU-DOMINIO/auth/callback` no passo 4 |
| Alteração não aparece no site | Página guardada em cache | O painel já atualiza o site ao salvar; se editar direto no banco, aguarde até 5 minutos |

## 12. Segurança

- **RLS em todas as tabelas.** Visitantes leem apenas produtos com status *ativo*, categorias e banners ativos, as imagens desses produtos e as configurações públicas. Toda gravação exige estar em `admin_users`.
- **Verificação no servidor.** Cada página e ação do painel confere a sessão e o cadastro de administrador (`requireAdmin`). O RLS do banco é uma segunda barreira, independente das telas.
- **Sem promoção de privilégio.** `admin_users` não tem política de gravação: nem um administrador consegue alterar o próprio papel pelo site.
- **Estoque consistente.** Quantidades só mudam pela função `register_inventory_movement`, que trava a linha do produto, impede valores negativos e registra o histórico. Um `UPDATE` direto é recusado.
- **Colunas internas** (como o estoque mínimo) não são legíveis por visitantes.
- **Uploads** validados no navegador (formato, tamanho) e no Storage (tipos permitidos, 5 MB, pastas fixas, somente admin). O servidor monta as URLs a partir do caminho, sem confiar em links vindos do navegador.
- **Nenhum segredo no código.** O site usa só a chave publicável. `.env*` está no `.gitignore`.
- Cabeçalhos de segurança (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) em todas as respostas.

## 13. Estrutura de pastas

```
src/
  app/
    (site)/            páginas públicas: início, catálogo, categorias, produto, sobre, contato, privacidade
    admin/login        login do painel
    admin/(painel)/    painel protegido: visão geral, produtos, categorias, estoque, banners, configurações, conta
    auth/callback      retorno do link de e-mail (recuperar senha)
    sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
  components/
    ui/                componentes base (botão, campos, diálogo, gaveta, tabela…)
    brand/             logo e monograma
    site/              cabeçalho, rodapé, banner, cards, seções da home
    catalog/           filtros, paginação, esqueletos de carregamento
    product/           galeria com zoom, contador de visualizações
    admin/             telas e formulários do painel
  lib/
    supabase/          clientes do Supabase (navegador, servidor, público, proxy)
    services/          consultas (site público e painel)
    actions/           Server Actions do painel (todas com requireAdmin)
    validations/       schemas Zod compartilhados entre formulário e servidor
    auth.ts, whatsapp.ts, storage.ts, image-upload.ts, catalog-params.ts, utils.ts, types.ts, constants.ts
  proxy.ts             renova a sessão e protege /admin
supabase/migrations/   SQL versionado (rodar na ordem)
docs/ARQUITETURA.md    arquitetura, design system e modelo de dados
```

## Próximos passos possíveis

- **Carrinho e checkout:** produtos já têm SKU, preço efetivo (`effective_price`) e estoque transacional. Um carrinho pode reaproveitar `register_inventory_movement` para baixar estoque, e o botão de WhatsApp pode virar "Adicionar ao carrinho" sem mudar o catálogo.
- **Variações** (comprimentos/cores de um mesmo cabelo) como tabela filha de `products`.
