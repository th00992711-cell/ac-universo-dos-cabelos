import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Benefits } from "@/components/site/benefits";
import { PageHero } from "@/components/site/page-hero";
import { getSiteSettings } from "@/lib/services/settings";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return { title: "Sobre nós", description: s.tagline ?? undefined, alternates: { canonical: "/sobre" } };
}

export default async function AboutPage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageHero eyebrow="Sobre nós" title={s.about_title ?? `Sobre a ${s.business_name}`} description={s.tagline} />
      <div className="container-page grid gap-16 py-14 sm:py-20">
        {s.about_text ? (
          <div className="mx-auto max-w-3xl text-lg leading-[1.85] whitespace-pre-line text-cocoa first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-gold-ink">
            {s.about_text}
          </div>
        ) : (
          <p className="mx-auto max-w-xl text-center text-muted-foreground">A história da marca será publicada em breve.</p>
        )}
        {s.benefits.length > 0 && <Benefits items={s.benefits} />}
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/catalogo">Conhecer o catálogo</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
