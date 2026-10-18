"use client";

import { useTransition } from "react";
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
import { BENEFIT_ICONS } from "@/components/site/benefits";
import { saveSettings } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/types";
import { productWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { BENEFIT_ICON_KEYS, settingsSchema, type SettingsFormValues, type SettingsInput } from "@/lib/validations/settings";
import { ImageField } from "./image-field";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<SettingsFormValues, unknown, SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      business_name: settings.business_name,
      tagline: settings.tagline ?? "",
      logo_path: settings.logo_path ?? "",
      whatsapp_number: settings.whatsapp_number ?? "",
      whatsapp_default_message: settings.whatsapp_default_message ?? "",
      whatsapp_product_message: settings.whatsapp_product_message ?? "",
      instagram_handle: settings.instagram_handle ?? "",
      email: settings.email ?? "",
      phone: settings.phone ?? "",
      address: settings.address ?? "",
      business_hours: settings.business_hours ?? "",
      facebook_url: settings.facebook_url ?? "",
      tiktok_url: settings.tiktok_url ?? "",
      youtube_url: settings.youtube_url ?? "",
      about_title: settings.about_title ?? "",
      about_text: settings.about_text ?? "",
      benefits_title: settings.benefits_title ?? "",
      benefits: (settings.benefits ?? []).map((b) => ({
        icon: (BENEFIT_ICON_KEYS as readonly string[]).includes(b.icon) ? (b.icon as (typeof BENEFIT_ICON_KEYS)[number]) : "sparkles",
        title: b.title,
        description: b.description ?? "",
      })),
      footer_text: settings.footer_text ?? "",
      privacy_policy: settings.privacy_policy ?? "",
      seo_description: settings.seo_description ?? "",
      metrics_enabled: settings.metrics_enabled,
    },
  });
  const { register, control, formState } = form;
  const errors = formState.errors;
  const benefits = useFieldArray({ control, name: "benefits" });

  const number = (useWatch({ control, name: "whatsapp_number" }) ?? "").replace(/\D/g, "");
  const productTemplate = useWatch({ control, name: "whatsapp_product_message" });
  const testLink = whatsappLink(number, productWhatsappMessage(productTemplate, { name: "Cabelo liso 60 cm", sku: "LISO-60" }));

  const onSubmit = form.handleSubmit(
    (values) =>
      start(async () => {
        const res = await saveSettings(values);
        if (!res.ok) return void toast.error(res.error);
        toast.success(res.message);
        router.refresh();
      }),
    () => toast.error("Confira os campos destacados"),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <Card>
        <h2 className="text-2xl">Marca</h2>
        <div className="grid gap-6 md:grid-cols-[1fr_18rem]">
          <div className="grid content-start gap-5">
            <Field label="Nome comercial *" htmlFor="business_name" error={errors.business_name?.message}>
              <Input id="business_name" {...register("business_name")} />
            </Field>
            <Field label="Frase de apresentação" htmlFor="tagline" error={errors.tagline?.message} hint="Aparece na página Sobre nós.">
              <Input id="tagline" {...register("tagline")} />
            </Field>
          </div>
          <Controller
            control={control}
            name="logo_path"
            render={({ field }) => (
              <ImageField label="Logo (PNG com fundo transparente)" folder="branding" value={field.value ?? ""} onChange={field.onChange} aspect="aspect-[5/2]" fit="contain" />
            )}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl">WhatsApp</h2>
        <Field label="Número do WhatsApp" htmlFor="whatsapp_number" error={errors.whatsapp_number?.message} hint="Somente números, com 55 + DDD. Ex.: 5511999998888">
          <Input id="whatsapp_number" inputMode="numeric" placeholder="5511999998888" {...register("whatsapp_number")} />
        </Field>
        <Field label="Mensagem padrão (botões gerais)" htmlFor="whatsapp_default_message" error={errors.whatsapp_default_message?.message}>
          <Textarea id="whatsapp_default_message" rows={2} className="min-h-0" {...register("whatsapp_default_message")} />
        </Field>
        <Field
          label="Mensagem da página de produto"
          htmlFor="whatsapp_product_message"
          error={errors.whatsapp_product_message?.message}
          hint="Use {produto} e {sku}: eles são trocados pelo nome e pelo código do produto."
        >
          <Textarea id="whatsapp_product_message" rows={2} className="min-h-0" {...register("whatsapp_product_message")} />
        </Field>
        {testLink && (
          <a href={testLink} target="_blank" rel="noopener noreferrer" className="w-fit text-sm text-gold-ink underline underline-offset-4">
            Testar a mensagem de produto no WhatsApp
          </a>
        )}
      </Card>

      <Card>
        <h2 className="text-2xl">Contato e redes sociais</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Instagram (usuário)" htmlFor="instagram_handle" error={errors.instagram_handle?.message}>
            <Input id="instagram_handle" placeholder="ac.universodoscabelos" {...register("instagram_handle")} />
          </Field>
          <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} />
          </Field>
          <Field label="Telefone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" {...register("phone")} />
          </Field>
          <Field label="Facebook (link)" htmlFor="facebook_url" error={errors.facebook_url?.message}>
            <Input id="facebook_url" placeholder="https://" {...register("facebook_url")} />
          </Field>
          <Field label="TikTok (link)" htmlFor="tiktok_url" error={errors.tiktok_url?.message}>
            <Input id="tiktok_url" placeholder="https://" {...register("tiktok_url")} />
          </Field>
          <Field label="YouTube (link)" htmlFor="youtube_url" error={errors.youtube_url?.message}>
            <Input id="youtube_url" placeholder="https://" {...register("youtube_url")} />
          </Field>
          <Field label="Endereço comercial (se houver)" htmlFor="address" error={errors.address?.message}>
            <Textarea id="address" rows={2} className="min-h-0" {...register("address")} />
          </Field>
          <Field label="Horários de atendimento" htmlFor="business_hours" error={errors.business_hours?.message}>
            <Textarea id="business_hours" rows={2} className="min-h-0" placeholder="Seg. a sex., 9h às 18h" {...register("business_hours")} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl">Textos institucionais</h2>
        <Field label="Título da página Sobre nós" htmlFor="about_title" error={errors.about_title?.message}>
          <Input id="about_title" {...register("about_title")} />
        </Field>
        <Field label="Texto da página Sobre nós" htmlFor="about_text" error={errors.about_text?.message} hint="Quebras de linha são mantidas.">
          <Textarea id="about_text" rows={8} {...register("about_text")} />
        </Field>
        <Field label="Título da seção de diferenciais" htmlFor="benefits_title" error={errors.benefits_title?.message}>
          <Input id="benefits_title" {...register("benefits_title")} />
        </Field>
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Diferenciais da marca</p>
            <Button type="button" variant="secondary" size="sm" disabled={benefits.fields.length >= 6} onClick={() => benefits.append({ icon: "sparkles", title: "", description: "" })}>
              <Plus /> Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Publique apenas o que a marca realmente oferece. Nada é exibido além do que estiver aqui.</p>
          {benefits.fields.map((f, i) => (
            <div key={f.id} className="grid gap-2 rounded-2xl border border-border p-3 sm:grid-cols-[9rem_1fr_auto]">
              <NativeSelect aria-label="Ícone" {...register(`benefits.${i}.icon`)}>
                {BENEFIT_ICON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {BENEFIT_ICONS[k]?.label ?? k}
                  </option>
                ))}
              </NativeSelect>
              <div className="grid gap-2">
                <Input aria-label="Título do diferencial" placeholder="Título" aria-invalid={!!errors.benefits?.[i]?.title} {...register(`benefits.${i}.title`)} />
                {errors.benefits?.[i]?.title && <p className="text-xs text-destructive">{errors.benefits[i]?.title?.message}</p>}
                <Textarea aria-label="Descrição do diferencial" rows={2} className="min-h-0" placeholder="Descrição" {...register(`benefits.${i}.description`)} />
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Remover diferencial" onClick={() => benefits.remove(i)}>
                <X />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl">Rodapé, privacidade e SEO</h2>
        <Field label="Texto do rodapé" htmlFor="footer_text" error={errors.footer_text?.message}>
          <Textarea id="footer_text" rows={2} className="min-h-0" {...register("footer_text")} />
        </Field>
        <Field label="Descrição para o Google (página inicial)" htmlFor="seo_description" error={errors.seo_description?.message} hint="Até 300 caracteres. Ideal: entre 120 e 160.">
          <Textarea id="seo_description" rows={2} className="min-h-0" {...register("seo_description")} />
        </Field>
        <Field
          label="Política de privacidade"
          htmlFor="privacy_policy"
          error={errors.privacy_policy?.message}
          hint="Em branco: o site mostra um texto-base que descreve o funcionamento do catálogo."
        >
          <Textarea id="privacy_policy" rows={8} {...register("privacy_policy")} />
        </Field>
        <Controller
          control={control}
          name="metrics_enabled"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
              <label htmlFor="metrics_enabled" className="grid gap-0.5">
                <span className="text-sm font-medium">Contar visualizações de produtos</span>
                <span className="text-xs text-muted-foreground">Contagem anônima, exibida no painel.</span>
              </label>
              <Switch id="metrics_enabled" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" size="lg" disabled={pending} className="shadow-lift">
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Salvar configurações
        </Button>
      </div>
    </form>
  );
}
