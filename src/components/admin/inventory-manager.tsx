"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownToLine, ArrowUpFromLine, History, Loader2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { registerMovement } from "@/lib/actions/inventory";
import type { AdminProduct, MovementType } from "@/lib/types";
import { movementSchema, type MovementInput } from "@/lib/validations/catalog";

type Row = Pick<AdminProduct, "id" | "name" | "sku" | "stock_quantity" | "min_stock" | "status">;

export function InventoryTable({ products }: { products: Row[] }) {
  const [target, setTarget] = useState<{ product: Row; type: MovementType } | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Movimentar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            const low = p.stock_quantity <= p.min_stock;
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/admin/produtos/${p.id}`} className="font-semibold text-cocoa-deep hover:text-gold-ink">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.sku}
                    {p.status === "inactive" ? " · inativo" : ""}
                  </p>
                </TableCell>
                <TableCell className="font-display text-2xl tabular-nums">{p.stock_quantity}</TableCell>
                <TableCell className="tabular-nums">{p.min_stock}</TableCell>
                <TableCell>
                  {p.stock_quantity === 0 ? (
                    <Badge variant="destructive">Sem estoque</Badge>
                  ) : low ? (
                    <Badge variant="warning">Estoque baixo</Badge>
                  ) : (
                    <Badge variant="success">Normal</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="secondary" size="sm" onClick={() => setTarget({ product: p, type: "entrada" })}>
                      <ArrowDownToLine /> Entrada
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setTarget({ product: p, type: "saida" })} disabled={p.stock_quantity === 0}>
                      <ArrowUpFromLine /> Saída
                    </Button>
                    <Button variant="ghost" size="icon-sm" title="Ajustar quantidade" aria-label={`Ajustar quantidade de ${p.name}`} onClick={() => setTarget({ product: p, type: "ajuste" })}>
                      <SlidersHorizontal />
                    </Button>
                    <Button asChild variant="ghost" size="icon-sm" title="Histórico" aria-label={`Histórico de ${p.name}`}>
                      <Link href={`/admin/estoque?produto=${p.id}#historico`}>
                        <History />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        {target && (
          <DialogContent
            title={target.type === "entrada" ? "Registrar entrada" : target.type === "saida" ? "Registrar saída" : "Ajustar quantidade"}
            description={`${target.product.name}: ${target.product.stock_quantity} unidade(s) em estoque.`}
          >
            <MovementForm product={target.product} type={target.type} onDone={() => setTarget(null)} />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function MovementForm({ product, type, onDone }: { product: Row; type: MovementType; onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<MovementInput>({
    resolver: zodResolver(movementSchema),
    defaultValues: { product_id: product.id, movement_type: type, quantity: type === "ajuste" ? String(product.stock_quantity) : "1", reason: "" },
  });
  const { errors } = form.formState;
  const movementType = useWatch({ control: form.control, name: "movement_type" });
  const qty = Number(useWatch({ control: form.control, name: "quantity" })) || 0;
  const preview = movementType === "entrada" ? product.stock_quantity + qty : movementType === "saida" ? product.stock_quantity - qty : qty;

  const onSubmit = form.handleSubmit((values) =>
    start(async () => {
      const res = await registerMovement(values);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      onDone();
      router.refresh();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <input type="hidden" {...form.register("product_id")} />
      <Field label="Tipo" htmlFor="mv-type">
        <NativeSelect id="mv-type" {...form.register("movement_type")}>
          <option value="entrada">Entrada (soma ao estoque)</option>
          <option value="saida">Saída (subtrai do estoque)</option>
          <option value="ajuste">Ajuste (define a quantidade contada)</option>
        </NativeSelect>
      </Field>
      <Field label={movementType === "ajuste" ? "Quantidade final" : "Quantidade"} htmlFor="mv-qty" error={errors.quantity?.message}>
        <Input id="mv-qty" inputMode="numeric" autoFocus aria-invalid={!!errors.quantity} {...form.register("quantity")} />
      </Field>
      <Field label="Motivo (opcional)" htmlFor="mv-reason" error={errors.reason?.message} hint="Ex.: venda pelo WhatsApp, reposição do fornecedor, contagem.">
        <Input id="mv-reason" {...form.register("reason")} />
      </Field>
      <p className={preview < 0 ? "text-sm font-medium text-destructive" : "text-sm text-muted-foreground"}>
        {preview < 0 ? `Saída maior que o estoque disponível (${product.stock_quantity}).` : `Estoque após a operação: ${preview} unidade(s).`}
      </p>
      <Button type="submit" disabled={pending || preview < 0}>
        {pending && <Loader2 className="animate-spin" />} Confirmar
      </Button>
    </form>
  );
}
