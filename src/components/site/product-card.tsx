import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/lib/types";
import { availability, cn, primaryImage } from "@/lib/utils";
import { Price } from "./price";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const image = primaryImage(product.images);
  const stock = availability(product.stock_quantity);
  const specs = [product.length_cm ? `${product.length_cm} cm` : null, product.texture].filter(Boolean).join(" · ");

  return (
    <article className="group card-lift relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-champagne-soft">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            loading={priority ? "eager" : undefined}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-gold" aria-hidden>
            <ImageOff className="size-8" />
          </span>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.promo_price !== null && product.price !== null && <Badge variant="solid">Promoção</Badge>}
          {product.is_new && <Badge className="bg-white/90 backdrop-blur">Lançamento</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        {specs && <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-gold-ink uppercase">{specs}</p>}
        <h3 className="font-display text-[1.35rem] leading-snug text-cocoa-deep">
          <Link href={`/produto/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} promoPrice={product.promo_price} />
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 pt-2">
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              stock.tone === "success" && "text-emerald-800",
              stock.tone === "warning" && "text-amber-800",
              stock.tone === "muted" && "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                stock.tone === "success" && "bg-emerald-600",
                stock.tone === "warning" && "bg-amber-600",
                stock.tone === "muted" && "bg-muted-foreground",
              )}
              aria-hidden
            />
            {stock.label}
          </span>
          <span className="text-xs font-semibold tracking-wide text-cocoa underline decoration-gold decoration-1 underline-offset-[6px] transition-colors group-hover:text-gold-ink">
            Ver detalhes
          </span>
        </div>
      </div>
    </article>
  );
}
