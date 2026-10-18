import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Benefits } from "@/components/site/benefits";
import { CategoryGrid } from "@/components/site/category-grid";
import { Hero } from "@/components/site/hero";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/icons";
import { JsonLd } from "@/components/site/json-ld";
import { ProductGrid } from "@/components/site/product-grid";
import { PromoStrip } from "@/components/site/promo-strip";
import { SectionHeading } from "@/components/site/section-heading";
import { getCategories, getFeaturedProducts, getNewAndPromoProducts } from "@/lib/services/catalog";
import { getBanners, getSiteSettings } from "@/lib/services/settings";
import { siteUrl } from "@/lib/utils";
import { generalWhatsappLink, instagramUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    description: settings.seo_description ?? undefined,
    alternates: { canonical: "/" },
    openGraph: { url: "/", description: settings.seo_description ?? undefined },
  };
}

export default async function HomePage() {
  const [settings, banners, categories, featured, { launches, promos }] = await Promise.all([
    getSiteSettings(),
    getBanners(),
    getCategories(),
    getFeaturedProducts(8),
    getNewAndPromoProducts(4),
  ]);
  const whatsapp = generalWhatsappLink(settings);
  const instagram = instagramUrl(settings.instagram_handle);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: settings.business_name,
          url: siteUrl("/"),
          logo: settings.logo_url ?? siteUrl("/brand/ac-emblema.png"),
          image: settings.logo_url ?? siteUrl("/brand/ac-emblema.png"),
          ...(settings.phone ? { telephone: settings.phone } : {}),
          ...(settings.email ? { email: settings.email } : {}),
          ...(settings.address ? { address: settings.address } : {}),
          ...(instagram ? { sameAs: [instagram] } : {}),
        }}
      />

      <Hero banner={banners.hero} whatsapp={whatsapp} businessName={settings.business_name} />

      {categories.length > 0 && (
        <section className="container-page py-16 sm:py-20" aria-label="Categorias em destaque">
          <SectionHeading eyebrow="Categorias" title="Encontre o seu estilo" description="Explore nossa seleção por textura e tipo de cabelo." />
          <div className="mt-12">
            <CategoryGrid categories={categories.slice(0, 8)} />
          </div>
        </section>
      )}

      <section className="bg-card py-16 sm:py-24" aria-label="Produtos em destaque">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="Seleção especial"
            title="Produtos em destaque"
            action={
              <Button asChild variant="link" className="h-auto">
                <Link href="/catalogo">
                  Ver catálogo completo <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="mt-10">
            {featured.length ? (
              <ProductGrid products={featured} />
            ) : (
              <p className="rounded-2xl border border-dashed border-gold/50 px-6 py-12 text-center text-muted-foreground">
                Em breve, nossa seleção de produtos estará disponível aqui.
              </p>
            )}
          </div>
        </div>
      </section>

      {banners.promos.length > 0 && (
        <section className="container-page py-16" aria-label="Destaques promocionais">
          <PromoStrip banners={banners.promos} />
        </section>
      )}

      {launches.length > 0 && (
        <section className="container-page py-16 sm:py-20" aria-label="Lançamentos">
          <SectionHeading align="left" eyebrow="Acabou de chegar" title="Lançamentos" />
          <div className="mt-10">
            <ProductGrid products={launches} />
          </div>
        </section>
      )}

      {promos.length > 0 && (
        <section className="container-page py-16 sm:py-20" aria-label="Promoções">
          <SectionHeading align="left" eyebrow="Por tempo limitado" title="Promoções" />
          <div className="mt-10">
            <ProductGrid products={promos} />
          </div>
        </section>
      )}

      {settings.benefits.length > 0 && (
        <section className="container-page py-16 sm:py-24" aria-label="Nossos diferenciais">
          <SectionHeading eyebrow="Nossos diferenciais" title={settings.benefits_title ?? "Por que escolher a AC"} />
          <div className="mt-12">
            <Benefits items={settings.benefits} />
          </div>
        </section>
      )}

      <section className="container-page pb-20 sm:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-cocoa-deep px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_50%_0%,rgba(201,162,77,0.35),transparent_70%)]" aria-hidden />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <p className="eyebrow !text-champagne">Atendimento exclusivo</p>
            <h2 className="text-4xl leading-tight !text-white sm:text-5xl">Fale com uma consultora e encontre o cabelo ideal para você</h2>
            <div className="mt-3 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              {whatsapp && (
                <Button asChild size="lg">
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="size-5" /> Conversar pelo WhatsApp
                  </a>
                </Button>
              )}
              {instagram && (
                <Button asChild size="lg" variant="outline" className="border-champagne/60 text-white hover:bg-white/10">
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    <InstagramIcon className="size-5" /> @{settings.instagram_handle?.replace(/^@/, "")}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
