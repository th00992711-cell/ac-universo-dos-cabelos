"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderTree, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deleteCategory, saveCategory, toggleCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";
import { categorySchema, type CategoryInput } from "@/lib/validations/catalog";
import { ConfirmButton } from "./confirm-button";
import { ImageField } from "./image-field";

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [, start] = useTransition();

  return (
    <div className="grid gap-4">
      <div>
        <Button onClick={() => setEditing("new")}>
          <Plus /> Nova categoria
        </Button>
      </div>
      <ul className="grid gap-3">
        {categories.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-champagne-soft">
              {c.image_url ? <Image src={c.image_url} alt="" fill sizes="64px" className="object-cover" /> : <FolderTree className="m-auto mt-5 size-5 text-gold" />}
            </span>
            <div className="grid min-w-0 flex-1 gap-0.5">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-cocoa-deep">
                {c.name}
                {!c.is_active && <Badge variant="outline">Desativada</Badge>}
              </p>
              <p className="text-xs text-muted-foreground">
                /{c.slug} · ordem {c.sort_order} · {counts[c.id] ?? 0} produto(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                aria-label={`Categoria ${c.name} ativa`}
                checked={c.is_active}
                onCheckedChange={(v) =>
                  start(async () => {
                    const res = await toggleCategory(c.id, v);
                    if (!res.ok) return void toast.error(res.error);
                    router.refresh();
                  })
                }
              />
              <Button variant="ghost" size="icon-sm" aria-label={`Editar ${c.name}`} onClick={() => setEditing(c)}>
                <Pencil />
              </Button>
              <ConfirmButton
                title="Excluir categoria?"
                description={`Os ${counts[c.id] ?? 0} produto(s) de “${c.name}” continuam cadastrados, mas ficam sem categoria. Para apenas esconder, desative a categoria.`}
                confirmLabel="Excluir"
                onConfirm={async () => {
                  const res = await deleteCategory(c.id);
                  if (!res.ok) {
                    toast.error(res.error);
                    return false;
                  }
                  toast.success(res.message);
                  router.refresh();
                }}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${c.name}`} className="hover:text-destructive">
                    <Trash2 />
                  </Button>
                }
              />
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing !== null && (
          <DialogContent title={editing === "new" ? "Nova categoria" : "Editar categoria"} className="max-w-xl">
            <CategoryForm
              category={editing === "new" ? undefined : editing}
              nextOrder={categories.length + 1}
              onDone={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function CategoryForm({ category, nextOrder, onDone }: { category?: Category; nextOrder: number; onDone: () => void }) {
  const [pending, start] = useTransition();
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      sort_order: String(category?.sort_order ?? nextOrder),
      is_active: category?.is_active ?? true,
      image_path: category?.image_path ?? "",
    },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    start(async () => {
      const res = await saveCategory(values, category?.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      onDone();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field label="Nome *" htmlFor="cat-name" error={errors.name?.message}>
        <Input id="cat-name" aria-invalid={!!errors.name} {...form.register("name")} />
      </Field>
      <Field label="Endereço (slug)" htmlFor="cat-slug" error={errors.slug?.message} hint="Em branco: gerado a partir do nome.">
        <Input id="cat-slug" {...form.register("slug")} />
      </Field>
      <Field label="Descrição" htmlFor="cat-desc" error={errors.description?.message}>
        <Textarea id="cat-desc" rows={3} {...form.register("description")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Ordem" htmlFor="cat-order" error={errors.sort_order?.message}>
          <Input id="cat-order" inputMode="numeric" {...form.register("sort_order")} />
        </Field>
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <div className="grid content-start gap-3">
              <label htmlFor="cat-active" className="text-sm font-medium">
                Ativa
              </label>
              <Switch id="cat-active" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </div>
      <Controller
        control={form.control}
        name="image_path"
        render={({ field }) => <ImageField label="Imagem da categoria" folder="categories" value={field.value} onChange={field.onChange} aspect="aspect-[4/5]" />}
      />
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Salvar categoria
      </Button>
    </form>
  );
}
