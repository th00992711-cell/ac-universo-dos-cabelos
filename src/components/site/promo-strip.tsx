import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Imagens promocionais cadastradas em Banners (posição "Promocional"). */
export function PromoStrip({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <div className={cn("grid gap-4 sm:gap-5", banners.length > 1 && "md:grid-cols-2")}>
      {banners.slice(0, 4).map((b) => {
        const content = (
          <>
            <Image src={b.image_url!} alt={b.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-gradient-to-r from-cocoa-deep/70 via-cocoa-deep/20 to-transparent" aria-hidden />
            <span className="relative flex max-w-sm flex-col gap-2 p-6 sm:p-8">
              <span className="font-display text-3xl leading-tight text-white sm:text-4xl">{b.title}</span>
              {b.subtitle && <span className="text-sm text-champagne">{b.subtitle}</span>}
              {b.primary_cta_label && (
                <span className="mt-2 w-fit border-b border-gold pb-0.5 text-xs font-semibold tracking-[0.16em] text-white uppercase">
                  {b.primary_cta_label}
                </span>
              )}
            </span>
          </>
        );
        const className = "group relative flex aspect-[16/9] items-end overflow-hidden rounded-3xl border border-border sm:aspect-[2/1]";
        const href = b.primary_cta_href;
        return href ? (
          /^https?:\/\//.test(href) ? (
            <a key={b.id} href={href} target="_blank" rel="noopener noreferrer" className={className}>
              {content}
            </a>
          ) : (
            <Link key={b.id} href={href} className={className}>
              {content}
            </Link>
          )
        ) : (
          <div key={b.id} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
