import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package, Ruler, Scale, Palette, Sparkles, MapPin, Tag, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/icons";
import { JsonLd } from "@/components/site/json-ld";
import { Breadcrumbs } from "@/components/site/page-hero";
import { Price } from "@/components/site/price";
import { ProductGrid } from "@/components/site/product-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { ProductGallery } from "@/components/product/product-gallery";
import { ViewTracker } from "@/components/product/view-tracker";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/services/catalog";
import { getSiteSettings } from "@/lib/services/settings";
import { availability, cn, siteUrl, sortImages } from "@/lib/utils";
import { instagramUrl, productWhatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.slice(0, 50).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Produto não encontrado", robots: { index: false } };
  const images = sortImages(product.images);
  const description =
    product.short_description ??
    [product.name, product.texture, product.length_cm ? `${product.length_cm} cm` : null, product.color].filter(Boolean).join(" · ");
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/produto/${product.slug}`,
      title: product.name,
      description,
      images: images.slice(0, 1).map((i) => ({ url: i.url, alt: i.alt ?? product.name })),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([getSiteSettings(), getRelatedProducts(product)]);
  const images = sortImages(product.images);
  const stock = availability(product.stock_quantity);
  const whatsapp = productWhatsappLink(settings, product);
  const instagram = instagramUrl(settings.instagram_handle);

  const specs = [
    { icon: Ruler, label: "Comprimento", value: product.length_cm ? `${product.length_cm} cm` : null },
    { icon: Scale, label: "Peso", value: product.weight_grams ? `${product.weight_grams} g` : null },
    { icon: Waves, label: "Textura", value: product.texture },
    { icon: Palette, label: "Cor", value: product.color },
    { icon: Sparkles, label: "Tipo de cabelo", value: product.hair_type },
    { icon: MapPin, label: "Origem", value: product.origin },
    { icon: Tag, label: "Código (SKU)", value: product.sku },
    {
      icon: Package,
      label: "Quantidade disponível",
      value: product.stock_quantity > 0 ? `${product.stock_quantity} ${product.stock_quantity === 1 ? "unidade" : "unidades"}` : "Sob consulta",
    },
  ].filter((s): s is typeof s & { value: string } => Boolean(s.value));

  const extra = (product.additional_info ?? []).filter((i) => i.label && i.value);

  return (
    <>
      <ViewTracker productId={product.id} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.sku,
          description: product.short_description ?? product.description ?? undefined,
          image: images.map((i) => i.url),
          brand: { "@type": "Brand", name: settings.business_name },
          ...(product.category ? { category: product.category.name } : {}),
          ...(product.color ? { color: product.color } : {}),
          ...(product.effective_price !== null
            ? {
                offers: {
                  "@type": "Offer",
                  url: siteUrl(`/produto/${product.slug}`),
                  priceCurrency: "BRL",
                  price: Number(product.effective_price).toFixed(2),
                  availability: product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
                  seller: { "@type": "Organization", name: settings.business_name },
                },
              }
            : {}),
        }}
      />

      <div className="container-page pt-6 pb-20 sm:pt-10">
        <Breadcrumbs
          items={[
            { href: "/", label: "Início" },
            product.category ? { href: `/categorias/${product.category.slug}`, label: product.category.name } : { href: "/catalogo", label: "Catálogo" },
            { href: `/produto/${product.slug}`, label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={images} name={product.name} />

          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap gap-2">
              {product.category && <Badge variant="outline">{product.category.name}</Badge>}
              {product.is_new && <Badge>Lançamento</Badge>}
              {product.promo_price !== null && product.price !== null && <Badge variant="solid">Promoção</Badge>}
            </div>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl">{product.name}</h1>
            {product.short_description && <p className="text-base leading-relaxed text-muted-foreground">{product.short_description}</p>}

            <div className="grid gap-2 border-y border-border py-5">
              <Price price={product.price} promoPrice={product.promo_price} size="lg" />
              <p
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  stock.tone === "success" && "text-emerald-800",
                  stock.tone === "warning" && "text-amber-800",
                  stock.tone === "muted" && "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    stock.tone === "success" && "bg-emerald-600",
                    stock.tone === "warning" && "bg-amber-600",
                    stock.tone === "muted" && "bg-muted-foreground",
                  )}
                  aria-hidden
                />
                {stock.label}
                {product.stock_quantity === 0 && <span className="font-normal">: consulte prazos e encomendas pelo WhatsApp</span>}
              </p>
            </div>

            {whatsapp ? (
              <Button asChild variant="whatsapp" size="lg" className="h-14 w-full text-base">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-5" /> Consultar este produto pelo WhatsApp
                </a>
              </Button>
            ) : (
              <p className="rounded-2xl border border-dashed border-gold/50 p-4 text-sm text-muted-foreground">
                O WhatsApp de atendimento ainda não foi configurado.
              </p>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-cocoa hover:text-gold-ink">
                <InstagramIcon className="size-4" /> Veja mais no Instagram @{settings.instagram_handle?.replace(/^@/, "")}
              </a>
            )}

            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
              {specs.map((s) => (
                <div key={s.label} className="flex items-start gap-3 bg-card p-4 sm:[&:last-child:nth-child(odd)]:col-span-2">
                  <s.icon className="mt-0.5 size-4 shrink-0 text-gold-ink" strokeWidth={1.6} aria-hidden />
                  <div>
                    <dt className="text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{s.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-cocoa-deep">{s.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {(product.description || extra.length > 0) && (
          <div className="mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {product.description && (
              <section aria-labelledby="descricao">
                <h2 id="descricao" className="text-3xl">
                  Descrição
                </h2>
                <div className="mt-4 text-[0.98rem] leading-relaxed whitespace-pre-line text-cocoa">{product.description}</div>
              </section>
            )}
            {extra.length > 0 && (
              <section aria-labelledby="informacoes">
                <h2 id="informacoes" className="text-3xl">
                  Informações adicionais
                </h2>
                <dl className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
                  {extra.map((i, idx) => (
                    <div key={`${i.label}-${idx}`} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 p-4 text-sm">
                      <dt className="text-muted-foreground">{i.label}</dt>
                      <dd className="font-medium text-cocoa-deep">{i.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-20" aria-label="Produtos relacionados">
            <SectionHeading align="left" eyebrow="Você também pode gostar" title="Produtos relacionados" />
            <div className="mt-8">
              <ProductGrid products={related} />
            </div>
          </section>
        )}
      </div>

      {whatsapp && <div className="h-20 lg:hidden" aria-hidden />}
      {whatsapp && (
        <div data-sticky-cta className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <Button asChild variant="whatsapp" className="h-12 w-full">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-5" /> Consultar pelo WhatsApp
            </a>
          </Button>
        </div>
      )}
    </>
  );
}
