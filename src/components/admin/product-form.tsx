"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveProduct } from "@/lib/actions/products";
import { SUGGESTIONS } from "@/lib/constants";
import { uploadImage } from "@/lib/image-upload";
import { publicImageUrl } from "@/lib/storage";
import type { AdminProduct, Category } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { ImageManager, type ManagedImage } from "./image-manager";

const money = (v: number | null | undefined) => (v === null || v === undefined ? "" : Number(v).toFixed(2).replace(".", ","));

function toFormValues(p?: AdminProduct): ProductInput {
  return {
    name: p?.name ?? "",
    sku: p?.sku ?? "",
    slug: p?.slug ?? "",
    category_id: p?.category_id ?? "",
    short_description: p?.short_description ?? "",
    description: p?.description ?? "",
    hair_type: p?.hair_type ?? "",
    texture: p?.texture ?? "",
    length_cm: p?.length_cm?.toString() ?? "",
    weight_grams: p?.weight_grams?.toString() ?? "",
    color: p?.color ?? "",
    origin: p?.origin ?? "",
    price: money(p?.price),
    promo_price: money(p?.promo_price),
    stock_quantity: (p?.stock_quantity ?? 0).toString(),
    min_stock: (p?.min_stock ?? 1).toString(),
    status: p?.status ?? "active",
    is_featured: p?.is_featured ?? false,
    is_new: p?.is_new ?? false,
    sort_order: (p?.sort_order ?? 0).toString(),
    additional_info: p?.additional_info ?? [],
  };
}

export function ProductForm({ product, categories, suggestions }: { product?: AdminProduct; categories: Category[]; suggestions: typeof SUGGESTIONS }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [step, setStep] = useState<string | null>(null);
  const [images, setImages] = useState<ManagedImage[]>(
    [...(product?.images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ key: i.id, path: i.storage_path, preview: i.url, alt: i.alt ?? "" })),
  );

  const form = useForm<ProductInput>({ resolver: zodResolver(productSchema), defaultValues: toFormValues(product), mode: "onTouched" });
  const {
    register,
    control,
    formState: { errors, isDirty },
  } = form;
  const info = useFieldArray({ control, name: "additional_info" });
  const name = useWatch({ control, name: "name" });
  const slug = useWatch({ control, name: "slug" });

  const onSubmit = form.handleSubmit(
    (values) =>
      start(async () => {
        const uploaded: { storage_path: string; alt: string }[] = [];
        const pendingFiles = images.filter((i) => i.file).length;
        let sent = 0;
        for (const img of images) {
          if (img.path) {
            uploaded.push({ storage_path: img.path, alt: img.alt });
            continue;
          }
          if (!img.file) continue;
          sent += 1;
          setStep(`Enviando foto ${sent} de ${pendingFiles}…`);
          const res = await uploadImage(img.file, "products");
          if ("error" in res) {
            setStep(null);
            toast.error(res.error);
            return;
          }
          uploaded.push({ storage_path: res.path, alt: img.alt });
        }
        // Fotos enviadas passam a ser "salvas": se o cadastro falhar, não são reenviadas.
        setImages((list) =>
          list.map((img) => {
            if (img.path) return img;
            const idx = images.findIndex((i) => i.key === img.key);
            const path = uploaded[idx]?.storage_path;
            return path ? { ...img, path, file: undefined, preview: publicImageUrl(path) } : img;
          }),
        );

        setStep("Salvando produto…");
        const res = await saveProduct(values, uploaded, product?.id);
        setStep(null);
        if (!res.ok) return void toast.error(res.error);
        toast.success(res.message ?? "Produto salvo");
        if (!product) router.push(`/admin/produtos/${res.data!.id}`);
        else {
          form.reset(values);
          router.refresh();
        }
      }),
    () => toast.error("Confira os campos destacados"),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid content-start gap-6">
        <Card>
          <h2 className="text-2xl">Informações principais</h2>
          <Field label="Nome do produto *" htmlFor="name" error={errors.name?.message}>
            <Input id="name" placeholder="Cabelo humano liso 60 cm" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="SKU (código) *" htmlFor="sku" error={errors.sku?.message} hint="Usado na mensagem do WhatsApp. Ex.: LISO-60-CAST">
              <Input id="sku" className="uppercase" aria-invalid={!!errors.sku} {...register("sku")} />
            </Field>
            <Field label="Categoria" htmlFor="category_id" error={errors.category_id?.message}>
              <NativeSelect id="category_id" {...register("category_id")}>
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {!c.is_active ? " (inativa)" : ""}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field
            label="Endereço da página (slug)"
            htmlFor="slug"
            error={errors.slug?.message}
            hint={`Deixe em branco para gerar automaticamente: /produto/${slug || slugify(name) || "nome-do-produto"}`}
          >
            <Input id="slug" placeholder={slugify(name) || "cabelo-humano-liso-60cm"} {...register("slug")} />
          </Field>
          <Field label="Descrição curta" htmlFor="short_description" error={errors.short_description?.message} hint="Aparece abaixo do nome, até 300 caracteres.">
            <Textarea id="short_description" rows={2} className="min-h-0" {...register("short_description")} />
          </Field>
          <Field label="Descrição completa" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" rows={7} {...register("description")} />
          </Field>
        </Card>

        <Card>
          <h2 className="text-2xl">Fotos</h2>
          <ImageManager value={images} onChange={setImages} />
        </Card>

        <Card>
          <h2 className="text-2xl">Características</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <SuggestField id="hair_type" label="Tipo de cabelo" options={suggestions.hairType} error={errors.hair_type?.message} {...register("hair_type")} />
            <SuggestField id="texture" label="Textura" options={suggestions.texture} error={errors.texture?.message} {...register("texture")} />
            <Field label="Comprimento (cm)" htmlFor="length_cm" error={errors.length_cm?.message}>
              <Input id="length_cm" inputMode="numeric" placeholder="60" aria-invalid={!!errors.length_cm} {...register("length_cm")} />
            </Field>
            <Field label="Peso (gramas)" htmlFor="weight_grams" error={errors.weight_grams?.message} hint="Opcional">
              <Input id="weight_grams" inputMode="numeric" placeholder="100" aria-invalid={!!errors.weight_grams} {...register("weight_grams")} />
            </Field>
            <SuggestField id="color" label="Cor" options={suggestions.color} error={errors.color?.message} {...register("color")} />
            <SuggestField id="origin" label="Origem (opcional)" options={suggestions.origin} error={errors.origin?.message} {...register("origin")} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl">Informações adicionais</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => info.append({ label: "", value: "" })} disabled={info.fields.length >= 20}>
              <Plus /> Adicionar
            </Button>
          </div>
          <p className="-mt-2 text-sm text-muted-foreground">Ex.: “Cuidados” → “Lavar com shampoo sem sal”. Aparecem na página do produto.</p>
          {info.fields.map((f, i) => (
            <div key={f.id} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-start">
              <Input aria-label={`Título da informação ${i + 1}`} placeholder="Título" {...register(`additional_info.${i}.label`)} />
              <div className="grid gap-1">
                <Input aria-label={`Conteúdo da informação ${i + 1}`} placeholder="Conteúdo" aria-invalid={!!errors.additional_info?.[i]?.value} {...register(`additional_info.${i}.value`)} />
                {errors.additional_info?.[i]?.value && <p className="text-xs text-destructive">{errors.additional_info[i]?.value?.message}</p>}
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Remover informação" onClick={() => info.remove(i)}>
                <X />
              </Button>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid content-start gap-6 xl:sticky xl:top-6 xl:self-start">
        <Card>
          <h2 className="text-2xl">Publicação</h2>
          <Field label="Status" htmlFor="status">
            <NativeSelect id="status" {...register("status")}>
              <option value="active">Ativo (visível no site)</option>
              <option value="inactive">Inativo (oculto)</option>
              <option value="archived">Arquivado</option>
            </NativeSelect>
          </Field>
          <Controller
            control={control}
            name="is_featured"
            render={({ field }) => (
              <ToggleRow id="is_featured" label="Destaque na página inicial" checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="is_new"
            render={({ field }) => <ToggleRow id="is_new" label="Marcar como lançamento" checked={field.value} onChange={field.onChange} />}
          />
          <Field label="Ordem de exibição" htmlFor="sort_order" error={errors.sort_order?.message} hint="Números menores aparecem primeiro.">
            <Input id="sort_order" inputMode="numeric" {...register("sort_order")} />
          </Field>
        </Card>

        <Card>
          <h2 className="text-2xl">Preço</h2>
          <Field label="Preço de venda (R$)" htmlFor="price" error={errors.price?.message} hint="Deixe em branco para mostrar “Preço sob consulta”.">
            <Input id="price" inputMode="decimal" placeholder="1290,00" aria-invalid={!!errors.price} {...register("price")} />
          </Field>
          <Field label="Preço promocional (R$)" htmlFor="promo_price" error={errors.promo_price?.message} hint="Opcional. Ativa o selo “Promoção”.">
            <Input id="promo_price" inputMode="decimal" placeholder="990,00" aria-invalid={!!errors.promo_price} {...register("promo_price")} />
          </Field>
        </Card>

        <Card>
          <h2 className="text-2xl">Estoque</h2>
          <Field
            label="Quantidade disponível"
            htmlFor="stock_quantity"
            error={errors.stock_quantity?.message}
            hint={product ? "Alterações aqui ficam registradas no histórico como ajuste." : undefined}
          >
            <Input id="stock_quantity" inputMode="numeric" aria-invalid={!!errors.stock_quantity} {...register("stock_quantity")} />
          </Field>
          <Field label="Estoque mínimo" htmlFor="min_stock" error={errors.min_stock?.message} hint="Abaixo ou igual a este número, o painel avisa estoque baixo.">
            <Input id="min_stock" inputMode="numeric" aria-invalid={!!errors.min_stock} {...register("min_stock")} />
          </Field>
          {product && (
            <Link href={`/admin/estoque?produto=${product.id}`} className="text-sm text-gold-ink underline-offset-4 hover:underline">
              Ver histórico de movimentações
            </Link>
          )}
        </Card>

        <div className="grid gap-2">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {pending ? step ?? "Salvando…" : product ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
          {product && isDirty && !pending && <p className="text-center text-xs text-muted-foreground">Há alterações não salvas.</p>}
          {product && (
            <Button asChild variant="ghost">
              <Link href={`/produto/${product.slug}`} target="_blank">
                Ver no site
              </Link>
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function SuggestField({
  id,
  label,
  options,
  error,
  ...props
}: React.ComponentProps<"input"> & { id: string; label: string; options: string[]; error?: string }) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <Input id={id} list={`${id}-options`} autoComplete="off" aria-invalid={!!error} {...props} />
      <datalist id={`${id}-options`}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </Field>
  );
}

function ToggleRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
