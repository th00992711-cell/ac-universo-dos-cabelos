import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((c, i) => (
        <li key={c.id}>
          <Link
            href={`/categorias/${c.slug}`}
            className="group card-lift relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-champagne-soft focus-visible:ring-2 focus-visible:ring-ring"
          >
            {c.image_url ? (
              <Image
                src={c.image_url}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <span
                className="absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_0%,#fffaf0,#f3ead6_55%,#e8d7b0)]"
                aria-hidden
              >
                <span className="absolute top-6 left-1/2 -translate-x-1/2 font-display text-7xl text-gold/40">{String(i + 1).padStart(2, "0")}</span>
              </span>
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-cocoa-deep/75 via-cocoa-deep/10 to-transparent" aria-hidden />
            <span className="relative flex items-end justify-between gap-2 p-4 sm:p-5">
              <span className="font-display text-xl leading-tight text-white sm:text-2xl">{c.name}</span>
              <ArrowUpRight className="size-5 shrink-0 text-champagne transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
