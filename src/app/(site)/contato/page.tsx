import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstagramIcon, WhatsAppIcon } from "@/components/site/icons";
import { PageHero } from "@/components/site/page-hero";
import { getSiteSettings } from "@/lib/services/settings";
import { generalWhatsappLink, instagramUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a AC Universo dos Cabelos pelo WhatsApp ou Instagram e receba atendimento personalizado.",
  alternates: { canonical: "/contato" },
};

export default async function ContactPage() {
  const s = await getSiteSettings();
  const whatsapp = generalWhatsappLink(s);
  const instagram = instagramUrl(s.instagram_handle);
  const items = [
    { icon: Phone, label: "Telefone", value: s.phone },
    { icon: Mail, label: "E-mail", value: s.email, href: s.email ? `mailto:${s.email}` : undefined },
    { icon: MapPin, label: "Endereço", value: s.address },
    { icon: Clock, label: "Horário de atendimento", value: s.business_hours },
  ].filter((i) => i.value);

  return (
    <>
      <PageHero eyebrow="Contato" title="Vamos conversar?" description="Nossa equipe está pronta para ajudar você a escolher o cabelo ideal." />
      <div className="container-page grid gap-8 py-14 sm:py-20 lg:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-3xl bg-cocoa-deep p-8 text-white sm:p-12">
          <p className="eyebrow !text-champagne">Atendimento personalizado</p>
          <h2 className="text-4xl !text-white">Fale com uma consultora</h2>
          <p className="text-champagne/90">Tire dúvidas sobre texturas, comprimentos, cores, disponibilidade e prazos.</p>
          <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
            {whatsapp && (
              <Button asChild size="lg">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-5" /> WhatsApp
                </a>
              </Button>
            )}
            {instagram && (
              <Button asChild size="lg" variant="outline" className="border-champagne/60 text-white hover:bg-white/10">
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  <InstagramIcon className="size-5" /> Instagram
                </a>
              </Button>
            )}
          </div>
        </div>
        <ul className="grid content-start gap-4">
          {items.map((i) => (
            <li key={i.label} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-champagne-soft text-gold-ink">
                <i.icon className="size-5" strokeWidth={1.5} />
              </span>
              <div>
                <p className="eyebrow">{i.label}</p>
                {i.href ? (
                  <a href={i.href} className="mt-1 block break-all text-cocoa-deep hover:text-gold-ink">
                    {i.value}
                  </a>
                ) : (
                  <p className="mt-1 whitespace-pre-line text-cocoa-deep">{i.value}</p>
                )}
              </div>
            </li>
          ))}
          {!items.length && (
            <li className="rounded-2xl border border-dashed border-gold/50 p-6 text-sm text-muted-foreground">
              Atendimento pelo WhatsApp e Instagram.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
