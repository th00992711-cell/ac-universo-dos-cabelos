"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SORT_OPTIONS, type SortValue } from "@/lib/constants";
import { catalogQuery } from "@/lib/catalog-params";
import type { CatalogFilters, FilterOptions } from "@/lib/services/catalog";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  filters: CatalogFilters;
  options: FilterOptions;
  categories: Category[];
  basePath: string;
  lockedCategory?: boolean;
};

function useCatalogNavigation(filters: CatalogFilters, basePath: string, lockedCategory?: boolean) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function apply(next: Partial<CatalogFilters>) {
    const merged = { ...filters, pagina: 1, ...next };
    startTransition(() => {
      router.push(`${basePath}${catalogQuery(merged, { includeCategory: !lockedCategory })}`, { scroll: false });
    });
  }
  return { apply, pending };
}

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function activeCount(f: CatalogFilters) {
  return (
    f.textura.length +
    f.cor.length +
    f.comprimento.length +
    (f.precoMin !== undefined || f.precoMax !== undefined ? 1 : 0) +
    (f.disponibilidade ? 1 : 0) +
    (f.q ? 1 : 0)
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-b border-border pb-6">
      <legend className="eyebrow mb-3">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-gold bg-gold/15 font-semibold text-cocoa-deep" : "border-border bg-card text-cocoa hover:border-gold/60",
      )}
    >
      {children}
    </button>
  );
}

function FiltersPanel({ filters, options, categories, basePath, lockedCategory, onNavigate }: Props & { onNavigate?: () => void }) {
  const { apply, pending } = useCatalogNavigation(filters, basePath, lockedCategory);
  const [q, setQ] = useState(filters.q ?? "");
  const [min, setMin] = useState(filters.precoMin?.toString() ?? "");
  const [max, setMax] = useState(filters.precoMax?.toString() ?? "");

  function go(next: Partial<CatalogFilters>) {
    apply(next);
    onNavigate?.();
  }

  return (
    <div className={cn("grid gap-6 transition-opacity", pending && "opacity-60")} aria-busy={pending}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: q.trim() || undefined });
        }}
        className="relative"
      >
        <label htmlFor="catalogo-busca" className="sr-only">
          Buscar por nome ou código
        </label>
        <Input id="catalogo-busca" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou código" className="pr-11" maxLength={80} />
        <button type="submit" className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gold-ink hover:bg-secondary" aria-label="Buscar">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </button>
      </form>

      {!lockedCategory && categories.length > 0 && (
        <FilterGroup title="Categoria">
          <div className="flex flex-wrap gap-2">
            <Chip selected={!filters.categoria} onClick={() => go({ categoria: undefined })}>
              Todas
            </Chip>
            {categories.map((c) => (
              <Chip key={c.id} selected={filters.categoria === c.slug} onClick={() => go({ categoria: filters.categoria === c.slug ? undefined : c.slug })}>
                {c.name}
              </Chip>
            ))}
          </div>
        </FilterGroup>
      )}
      {lockedCategory && (
        <Link href="/catalogo" className="w-fit text-sm text-gold-ink underline-offset-4 hover:underline">
          Ver todas as categorias
        </Link>
      )}

      {options.textures.length > 0 && (
        <FilterGroup title="Textura">
          <div className="flex flex-wrap gap-2">
            {options.textures.map((t) => (
              <Chip key={t} selected={filters.textura.includes(t)} onClick={() => go({ textura: toggle(filters.textura, t) })}>
                {t}
              </Chip>
            ))}
          </div>
        </FilterGroup>
      )}

      {options.lengths.length > 0 && (
        <FilterGroup title="Comprimento">
          <div className="flex flex-wrap gap-2">
            {options.lengths.map((l) => (
              <Chip key={l} selected={filters.comprimento.includes(l)} onClick={() => go({ comprimento: toggle(filters.comprimento, l) })}>
                {l} cm
              </Chip>
            ))}
          </div>
        </FilterGroup>
      )}

      {options.colors.length > 0 && (
        <FilterGroup title="Cor">
          <div className="flex flex-wrap gap-2">
            {options.colors.map((c) => (
              <Chip key={c} selected={filters.cor.includes(c)} onClick={() => go({ cor: toggle(filters.cor, c) })}>
                {c}
              </Chip>
            ))}
          </div>
        </FilterGroup>
      )}

      {options.max_price !== null && (
        <FilterGroup title="Faixa de preço">
          <form
            className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const a = min ? Number(min) : undefined;
              const b = max ? Number(max) : undefined;
              go({ precoMin: a, precoMax: b });
            }}
          >
            <label className="grid gap-1 text-xs text-muted-foreground">
              Mínimo (R$)
              <Input inputMode="numeric" type="number" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder={String(Math.floor(options.min_price ?? 0))} />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              Máximo (R$)
              <Input inputMode="numeric" type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder={String(Math.ceil(options.max_price ?? 0))} />
            </label>
            <Button type="submit" variant="secondary" size="icon" aria-label="Aplicar faixa de preço" className="size-11">
              <Search className="size-4" />
            </Button>
          </form>
        </FilterGroup>
      )}

      <FilterGroup title="Disponibilidade">
        <div className="flex flex-wrap gap-2">
          <Chip selected={!filters.disponibilidade} onClick={() => go({ disponibilidade: undefined })}>
            Todos
          </Chip>
          <Chip selected={filters.disponibilidade === "disponivel"} onClick={() => go({ disponibilidade: "disponivel" })}>
            Em estoque
          </Chip>
          <Chip selected={filters.disponibilidade === "sob-consulta"} onClick={() => go({ disponibilidade: "sob-consulta" })}>
            Sob consulta
          </Chip>
        </div>
      </FilterGroup>

      {activeCount(filters) > 0 && (
        <Button
          variant="ghost"
          onClick={() => {
            setQ("");
            setMin("");
            setMax("");
            go({ q: undefined, textura: [], cor: [], comprimento: [], precoMin: undefined, precoMax: undefined, disponibilidade: undefined, categoria: lockedCategory ? filters.categoria : undefined });
          }}
        >
          <X /> Limpar filtros
        </Button>
      )}
    </div>
  );
}

export function CatalogSidebar(props: Props) {
  return (
    <aside className="hidden lg:block" aria-label="Filtros">
      <div className="sticky top-28">
        <FiltersPanel {...props} />
      </div>
    </aside>
  );
}

export function CatalogToolbar(props: Props & { total: number }) {
  const { apply, pending } = useCatalogNavigation(props.filters, props.basePath, props.lockedCategory);
  const [open, setOpen] = useState(false);
  const count = activeCount(props.filters);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {pending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Atualizando…
          </span>
        ) : (
          <>
            {props.total} {props.total === 1 ? "produto encontrado" : "produtos encontrados"}
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm" className="h-11 lg:hidden">
              <SlidersHorizontal /> Filtros{count ? ` (${count})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent title="Filtros" side="left">
            <FiltersPanel {...props} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <label htmlFor="ordenar" className="sr-only">
          Ordenar por
        </label>
        <NativeSelect
          id="ordenar"
          value={props.filters.ordem}
          onChange={(e) => apply({ ordem: e.target.value as SortValue })}
          className="h-11 min-w-44 rounded-full text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
