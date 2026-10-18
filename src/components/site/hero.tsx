import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@/lib/types";
import { HairArt } from "./hair-art";
import { WhatsAppIcon } from "./icons";

function resolveHref(href: string | null, whatsapp: string | null) {
  if (!href) return null;
  if (href === "whatsapp") return whatsapp;
  return href;
}

function CtaLink({ href, children, variant }: { href: string; children: React.ReactNode; variant: "default" | "outline" }) {
  const external = /^https?:\/\//.test(href);
  return (
    <Button asChild size="lg" variant={variant} className="w-full sm:w-auto">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link href={href}>{children}</Link>
      )}
    </Button>
  );
}

export function Hero({ banner, whatsapp, businessName }: { banner: Banner; whatsapp: string | null; businessName: string }) {
  const primary = resolveHref(banner.primary_cta_href, whatsapp);
  const secondary = resolveHref(banner.secondary_cta_href, whatsapp);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_0%_0%,#f3ead6_0%,transparent_70%)]" aria-hidden />
      <div className="container-page relative grid items-center gap-10 pt-8 pb-16 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:pt-14 md:pb-24">
        <div className="flex flex-col gap-6">
          <p className="eyebrow animate-rise">{businessName}</p>
          <h1 className="animate-rise text-[2.75rem] leading-[1.02] [animation-delay:80ms] sm:text-6xl lg:text-7xl">{banner.title}</h1>
          <span className="gold-rule w-28 animate-rise [animation-delay:140ms]" aria-hidden />
          {banner.subtitle && (
            <p className="max-w-lg animate-rise text-base leading-relaxed text-muted-foreground [animation-delay:200ms] sm:text-lg">{banner.subtitle}</p>
          )}
          <div className="mt-2 flex animate-rise flex-col gap-3 [animation-delay:260ms] sm:flex-row">
            {primary && banner.primary_cta_label && (
              <CtaLink href={primary} variant="default">
                {banner.primary_cta_label} <ArrowRight />
              </CtaLink>
            )}
            {secondary && banner.secondary_cta_label && (
              <CtaLink href={secondary} variant="outline">
                {banner.secondary_cta_href === "whatsapp" && <WhatsAppIcon className="size-4" />}
                {banner.secondary_cta_label}
              </CtaLink>
            )}
          </div>
        </div>

        <div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[17rem] overflow-hidden sm:max-w-sm rounded-t-[999px] rounded-b-3xl border border-gold/40 shadow-lift md:max-w-none">
            {banner.image_url ? (
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                preload
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            ) : (
              <HairArt />
            )}
            <div className="pointer-events-none absolute inset-3 rounded-t-[999px] rounded-b-2xl border border-white/50" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
