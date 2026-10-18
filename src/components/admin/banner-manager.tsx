"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deleteBanner, saveBanner } from "@/lib/actions/banners";
import type { Banner, BannerPlacement } from "@/lib/types";
import { bannerSchema, type BannerInput } from "@/lib/validations/catalog";
import { ConfirmButton } from "./confirm-button";
import { ImageField } from "./image-field";

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Banner | BannerPlacement | null>(null);

  const groups: { placement: BannerPlacement; title: string; help: string }[] = [
    { placement: "hero", title: "Banner principal", help: "O primeiro banner ativo aparece no topo da página inicial." },
    { placement: "promo", title: "Imagens promocionais", help: "Faixas com foto exibidas na página inicial, abaixo dos destaques." },
  ];

  return (
    <div className="grid gap-10">
      {groups.map((g) => {
        const items = banners.filter((b) => b.placement === g.placement);
        return (
          <section key={g.placement} className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl">{g.title}</h2>
                <p className="text-sm text-muted-foreground">{g.help}</p>
              </div>
              <Button variant="secondary" onClick={() => setEditing(g.placement)}>
                <Plus /> Adicionar
              </Button>
            </div>
            {items.length ? (
              <ul className="grid gap-3 md:grid-cols-2">
                {items.map((b) => (
                  <li key={b.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                    <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-champagne-soft">
                      {b.image_url ? <Image src={b.image_url} alt="" fill sizes="80px" className="object-cover" /> : <ImageIcon className="m-auto mt-9 size-5 text-gold" />}
                    </span>
                    <div className="grid min-w-0 flex-1 content-start gap-1">
                      <p className="line-clamp-2 font-semibold text-cocoa-deep">{b.title}</p>
                      {b.subtitle && <p className="line-clamp-2 text-xs text-muted-foreground">{b.subtitle}</p>}
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge variant={b.is_active ? "success" : "outline"}>{b.is_active ? "Ativo" : "Inativo"}</Badge>
                        <Badge variant="secondary">Ordem {b.sort_order}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Editar banner" onClick={() => setEditing(b)}>
                        <Pencil />
                      </Button>
                      <ConfirmButton
                        title="Excluir banner?"
                        description={`“${b.title}” será removido do site.`}
                        confirmLabel="Excluir"
                        onConfirm={async () => {
                          const res = await deleteBanner(b.id);
                          if (!res.ok) {
                            toast.error(res.error);
                            return false;
                          }
                          toast.success(res.message);
                          router.refresh();
                        }}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Excluir banner" className="hover:text-destructive">
                            <Trash2 />
                          </Button>
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {g.placement === "hero" ? "Nenhum banner: o site mostra o texto padrão com a ilustração da marca." : "Nenhuma imagem promocional cadastrada."}
              </p>
            )}
          </section>
        );
      })}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing !== null && (
          <DialogContent title={typeof editing === "string" ? "Novo banner" : "Editar banner"} className="max-w-2xl">
            <BannerForm
              banner={typeof editing === "string" ? undefined : editing}
              placement={typeof editing === "string" ? editing : editing.placement}
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

function BannerForm({ banner, placement, onDone }: { banner?: Banner; placement: BannerPlacement; onDone: () => void }) {
  const [pending, start] = useTransition();
  const form = useForm<BannerInput>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      placement,
      title: banner?.title ?? "",
      subtitle: banner?.subtitle ?? "",
      primary_cta_label: banner?.primary_cta_label ?? (placement === "hero" ? "Explorar catálogo" : "Ver produtos"),
      primary_cta_href: banner?.primary_cta_href ?? "/catalogo",
      secondary_cta_label: banner?.secondary_cta_label ?? (placement === "hero" ? "Falar com uma consultora" : ""),
      secondary_cta_href: banner?.secondary_cta_href ?? (placement === "hero" ? "whatsapp" : ""),
      sort_order: String(banner?.sort_order ?? 0),
      is_active: banner?.is_active ?? true,
      image_path: banner?.image_path ?? "",
    },
  });
  const { errors } = form.formState;
  const isHero = useWatch({ control: form.control, name: "placement" }) === "hero";

  const onSubmit = form.handleSubmit((values) =>
    start(async () => {
      const res = await saveBanner(values, banner?.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      onDone();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field label="Posição" htmlFor="bn-placement">
        <NativeSelect id="bn-placement" {...form.register("placement")}>
          <option value="hero">Banner principal (topo da página inicial)</option>
          <option value="promo">Imagem promocional</option>
        </NativeSelect>
      </Field>
      <Field label="Título *" htmlFor="bn-title" error={errors.title?.message}>
        <Input id="bn-title" aria-invalid={!!errors.title} {...form.register("title")} />
      </Field>
      <Field label="Subtítulo" htmlFor="bn-sub" error={errors.subtitle?.message}>
        <Textarea id="bn-sub" rows={2} className="min-h-0" {...form.register("subtitle")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Texto do botão principal" htmlFor="bn-cta1" error={errors.primary_cta_label?.message}>
          <Input id="bn-cta1" {...form.register("primary_cta_label")} />
        </Field>
        <Field label="Link do botão principal" htmlFor="bn-href1" error={errors.primary_cta_href?.message} hint="/catalogo, https://… ou whatsapp">
          <Input id="bn-href1" {...form.register("primary_cta_href")} />
        </Field>
        {isHero && (
          <>
            <Field label="Texto do segundo botão" htmlFor="bn-cta2" error={errors.secondary_cta_label?.message}>
              <Input id="bn-cta2" {...form.register("secondary_cta_label")} />
            </Field>
            <Field label="Link do segundo botão" htmlFor="bn-href2" error={errors.secondary_cta_href?.message} hint="Use whatsapp para abrir a conversa">
              <Input id="bn-href2" {...form.register("secondary_cta_href")} />
            </Field>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Ordem" htmlFor="bn-order" error={errors.sort_order?.message}>
          <Input id="bn-order" inputMode="numeric" {...form.register("sort_order")} />
        </Field>
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <div className="grid content-start gap-3">
              <label htmlFor="bn-active" className="text-sm font-medium">
                Ativo
              </label>
              <Switch id="bn-active" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </div>
      <Controller
        control={form.control}
        name="image_path"
        render={({ field }) => (
          <ImageField
            label={isHero ? "Fotografia (vertical, 4:5)" : "Imagem promocional (horizontal, 2:1) *"}
            folder="banners"
            value={field.value}
            onChange={field.onChange}
            aspect={isHero ? "aspect-[4/5]" : "aspect-[2/1]"}
          />
        )}
      />
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Salvar banner
      </Button>
    </form>
  );
}
