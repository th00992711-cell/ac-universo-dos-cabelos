"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Copy, ImageOff, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteProduct, duplicateProduct, setProductFlag, setProductStatus, updateProductOrder } from "@/lib/actions/products";
import type { ActionResult } from "@/lib/actions/result";
import type { AdminProduct } from "@/lib/types";
import { cn, formatBRL, primaryImage } from "@/lib/utils";
import { ConfirmButton } from "./confirm-button";

const STATUS_LABEL = { active: "Ativo", inactive: "Inativo", archived: "Arquivado" } as const;

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(action: () => Promise<ActionResult<unknown>>, success?: string) {
    start(async () => {
      const res = await action();
      if (!res.ok) return void toast.error(res.error);
      if (success || res.message) toast.success(res.message ?? success);
      router.refresh();
    });
  }

  return (
    <Table className={cn(pending && "opacity-70")}>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Estoque</TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead>Destaque</TableHead>
          <TableHead>Ordem</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => {
          const img = primaryImage(p.images);
          const low = p.stock_quantity <= p.min_stock;
          return (
            <TableRow key={p.id}>
              <TableCell>
                <Link href={`/admin/produtos/${p.id}`} className="flex min-w-56 items-center gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-champagne-soft">
                    {img ? <Image src={img.url} alt="" fill sizes="56px" className="object-cover" /> : <ImageOff className="m-auto mt-4 size-5 text-gold" />}
                  </span>
                  <span className="grid gap-0.5">
                    <span className="font-semibold text-cocoa-deep hover:text-gold-ink">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.sku}
                      {p.category ? ` · ${p.category.name}` : ""}
                    </span>
                    {p.status !== "active" && (
                      <Badge variant={p.status === "archived" ? "outline" : "secondary"} className="mt-0.5">
                        {STATUS_LABEL[p.status]}
                      </Badge>
                    )}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {p.price === null ? (
                  <span className="text-muted-foreground">Sob consulta</span>
                ) : p.promo_price !== null ? (
                  <span className="grid">
                    <s className="text-xs text-muted-foreground">{formatBRL(p.price)}</s>
                    <span className="font-semibold">{formatBRL(p.promo_price)}</span>
                  </span>
                ) : (
                  formatBRL(p.price)
                )}
              </TableCell>
              <TableCell>
                <Badge variant={p.stock_quantity === 0 ? "destructive" : low ? "warning" : "success"}>{p.stock_quantity} un.</Badge>
              </TableCell>
              <TableCell>
                <Switch
                  aria-label={`Ativar ${p.name}`}
                  checked={p.status === "active"}
                  onCheckedChange={(v) => run(() => setProductStatus(p.id, v ? "active" : "inactive"), v ? "Produto ativado" : "Produto desativado")}
                />
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={() => run(() => setProductFlag(p.id, "is_featured", !p.is_featured))}
                  aria-pressed={p.is_featured}
                  aria-label={p.is_featured ? `Remover ${p.name} dos destaques` : `Destacar ${p.name}`}
                  className="cursor-pointer rounded-full p-2 hover:bg-secondary"
                >
                  <Star className={cn("size-5", p.is_featured ? "fill-gold text-gold" : "text-muted-foreground")} />
                </button>
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  min={0}
                  defaultValue={p.sort_order}
                  aria-label={`Ordem de exibição de ${p.name}`}
                  className="h-9 w-20 rounded-lg border border-input bg-card px-2 text-sm"
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v !== p.sort_order) run(() => updateProductOrder(p.id, v), "Ordem atualizada");
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm" aria-label={`Editar ${p.name}`} title="Editar">
                    <Link href={`/admin/produtos/${p.id}`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Duplicar"
                    aria-label={`Duplicar ${p.name}`}
                    onClick={() =>
                      start(async () => {
                        const res = await duplicateProduct(p.id);
                        if (!res.ok) return void toast.error(res.error);
                        toast.success(res.message);
                        router.push(`/admin/produtos/${res.data!.id}`);
                      })
                    }
                  >
                    <Copy />
                  </Button>
                  {p.status !== "archived" && (
                    <Button variant="ghost" size="icon-sm" title="Arquivar" aria-label={`Arquivar ${p.name}`} onClick={() => run(() => setProductStatus(p.id, "archived"), "Produto arquivado")}>
                      <Archive />
                    </Button>
                  )}
                  <ConfirmButton
                    title="Excluir produto?"
                    description={`“${p.name}” e o histórico de estoque dele serão apagados definitivamente. Para apenas tirar do site, use Arquivar.`}
                    confirmLabel="Excluir"
                    onConfirm={async () => {
                      const res = await deleteProduct(p.id);
                      if (!res.ok) {
                        toast.error(res.error);
                        return false;
                      }
                      toast.success(res.message);
                      router.refresh();
                    }}
                    trigger={
                      <Button variant="ghost" size="icon-sm" title="Excluir" aria-label={`Excluir ${p.name}`} className="hover:text-destructive">
                        <Trash2 />
                      </Button>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
