import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Você está em" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3" aria-hidden />}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-cocoa">
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="hover:text-gold-ink">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ eyebrow, title, description, crumbs }: { eyebrow?: string; title: string; description?: string | null; crumbs?: Crumb[] }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(70%_120%_at_50%_0%,#f3ead6_0%,transparent_75%)]">
      <div className="container-page flex flex-col items-center gap-4 py-14 text-center sm:py-20">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="max-w-3xl text-5xl leading-[1.02] sm:text-6xl">{title}</h1>
        <span className="gold-rule w-24" aria-hidden />
        {description && <p className="max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
    </section>
  );
}
