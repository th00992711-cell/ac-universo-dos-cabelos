import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryTable } from "@/components/admin/inventory-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listAdminProducts, listMovements } from "@/lib/services/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Estoque" };

const TYPE_LABEL = { entrada: "Entrada", saida: "Saída", ajuste: "Ajuste" } as const;

export default async function InventoryPage({ searchParams }: PageProps<"/admin/estoque">) {
  const sp = await searchParams;
  const onlyLow = sp.baixo === "1";
  const productId = typeof sp.produto === "string" && z.uuid().safeParse(sp.produto).success ? sp.produto : undefined;
  const [products, movements] = await Promise.all([listAdminProducts(), listMovements(productId)]);
  const rows = onlyLow ? products.filter((p) => p.stock_quantity <= p.min_stock) : products;
  const filtered = productId ? products.find((p) => p.id === productId) : undefined;

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Estoque"
        description="Toda alteração fica registrada. O banco não permite estoque negativo."
        actions={
          <Button asChild variant={onlyLow ? "default" : "secondary"}>
            <Link href={onlyLow ? "/admin/estoque" : "/admin/estoque?baixo=1"}>{onlyLow ? "Mostrar todos" : "Somente estoque baixo"}</Link>
          </Button>
        }
      />
      {rows.length ? (
        <InventoryTable products={rows} />
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {onlyLow ? "Nenhum produto com estoque baixo." : "Nenhum produto cadastrado."}
        </p>
      )}

      <section id="historico" className="grid scroll-mt-6 gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-3xl">Histórico de movimentações</h2>
          {filtered && (
            <Link href="/admin/estoque#historico" className="text-sm text-gold-ink hover:underline">
              Ver de todos os produtos
            </Link>
          )}
        </div>
        {filtered && <p className="text-sm text-muted-foreground">Mostrando: {filtered.name}</p>}
        {movements.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Variação</TableHead>
                <TableHead>Antes → depois</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(m.created_at)}</TableCell>
                  <TableCell>
                    <Link href={`/admin/estoque?produto=${m.product_id}#historico`} className="hover:text-gold-ink">
                      {m.product?.name ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.movement_type === "entrada" ? "success" : m.movement_type === "saida" ? "warning" : "secondary"}>{TYPE_LABEL[m.movement_type]}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums">{m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}</TableCell>
                  <TableCell className="tabular-nums">
                    {m.previous_quantity} → {m.new_quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.reason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
        )}
      </section>
    </div>
  );
}
