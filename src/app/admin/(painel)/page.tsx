import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Boxes, Eye, FolderTree, Package, PackageCheck, PackageX, Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { getDashboardData } from "@/lib/services/admin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const d = await getDashboardData();
  const stats = [
    { label: "Produtos cadastrados", value: d.total, icon: Package, href: "/admin/produtos" },
    { label: "Produtos ativos", value: d.active, icon: PackageCheck, href: "/admin/produtos?status=active" },
    { label: "Ativos sem estoque", value: d.unavailable, icon: PackageX, href: "/admin/estoque?baixo=1" },
    { label: "Em destaque", value: d.featured, icon: Star, href: "/admin/produtos" },
    { label: "Categorias ativas", value: d.categories, icon: FolderTree, href: "/admin/categorias" },
    { label: "Estoque baixo", value: d.lowStock.length, icon: AlertTriangle, href: "/admin/estoque?baixo=1", warn: d.lowStock.length > 0 },
  ];

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Visão geral"
        description="Números atualizados a partir do banco de dados."
        actions={
          <Button asChild>
            <Link href="/admin/produtos/novo">
              <Plus /> Novo produto
            </Link>
          </Button>
        }
      />

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="card-lift flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5">
              <s.icon className={cn("size-5", s.warn ? "text-amber-700" : "text-gold-ink")} strokeWidth={1.6} />
              <span className="font-display text-4xl leading-none text-cocoa-deep">{s.value}</span>
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl">Produtos por categoria</h2>
          {d.byCategory.length ? <BarList rows={d.byCategory} unit="produto" /> : <Empty text="Nenhum produto cadastrado ainda." />}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl">Estoque baixo</h2>
            <Link href="/admin/estoque?baixo=1" className="text-sm text-gold-ink hover:underline">
              Ver estoque
            </Link>
          </div>
          {d.lowStock.length ? (
            <ul className="divide-y divide-border">
              {d.lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/produtos/${p.id}`} className="min-w-0">
                    <span className="block truncate text-sm font-medium hover:text-gold-ink">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.sku} · mínimo {p.min}
                    </span>
                  </Link>
                  <Badge variant={p.stock === 0 ? "destructive" : "warning"}>{p.stock} un.</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Nenhum produto abaixo do estoque mínimo." />
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-2xl">
              <Eye className="size-5 text-gold-ink" /> Visualizações de produtos
            </h2>
            {d.metricsEnabled ? (
              <span className="text-sm text-muted-foreground">
                <strong className="text-cocoa-deep">{d.views30d}</strong> nos últimos 30 dias
              </span>
            ) : (
              <Badge variant="outline">Métricas desligadas</Badge>
            )}
          </div>
          {!d.metricsEnabled ? (
            <Empty text="Ative as métricas em Configurações para contar as visualizações das páginas de produto." />
          ) : d.views30d === 0 ? (
            <Empty text="Ainda não há visualizações registradas." />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <DayColumns rows={d.viewsByDay} />
              <div className="grid content-start gap-3">
                <h3 className="eyebrow">Mais vistos (30 dias)</h3>
                <BarList rows={d.topViewed} unit="visualização" unitPlural="visualizações" />
              </div>
            </div>
          )}
        </Card>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Boxes className="size-4" /> Produtos arquivados não entram nesses números.
      </p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{text}</p>;
}

/** Barras horizontais com o valor escrito ao lado (série única, sem legenda). */
function BarList({ rows, unit, unitPlural }: { rows: { label: string; value: number }[]; unit: string; unitPlural?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="grid gap-3">
      {rows.map((r) => (
        <li key={r.label} className="grid gap-1.5" title={`${r.label}: ${r.value} ${r.value === 1 ? unit : unitPlural ?? `${unit}s`}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="font-semibold tabular-nums text-cocoa-deep">{r.value}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-gold" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Colunas por dia (últimos 14 dias) com rótulo de valor ao passar o mouse e tabela acessível. */
function DayColumns({ rows }: { rows: { day: string; views: number }[] }) {
  const max = Math.max(...rows.map((r) => r.views), 1);
  const fmt = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  return (
    <figure className="grid gap-2">
      <div className="flex h-44 items-end gap-[2px] border-b border-border" aria-hidden>
        {rows.map((r) => (
          <div key={r.day} className="group relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t-[4px] bg-gold transition-colors group-hover:bg-gold-deep" style={{ height: `${(r.views / max) * 100}%`, minHeight: r.views ? 4 : 0 }} />
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-cocoa-deep px-2 py-0.5 text-xs whitespace-nowrap text-white group-hover:block">
              {fmt(r.day)}: {r.views}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground" aria-hidden>
        <span>{fmt(rows[0].day)}</span>
        <span>{fmt(rows[rows.length - 1].day)}</span>
      </div>
      <figcaption className="text-xs text-muted-foreground">Visualizações por dia, últimos 14 dias</figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th>Dia</th>
            <th>Visualizações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.day}>
              <td>{fmt(r.day)}</td>
              <td>{r.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
