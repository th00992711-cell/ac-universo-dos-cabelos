import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NAV_LINKS } from "@/lib/constants";
import type { Category, SiteSettings } from "@/lib/types";
import { generalWhatsappLink, instagramUrl } from "@/lib/whatsapp";
import { InstagramIcon, WhatsAppIcon } from "./icons";

export function SiteFooter({ settings, categories }: { settings: SiteSettings; categories: Category[] }) {
  const whatsapp = generalWhatsappLink(settings);
  const instagram = instagramUrl(settings.instagram_handle);
  const socials = [
    { href: settings.facebook_url, label: "Facebook" },
    { href: settings.tiktok_url, label: "TikTok" },
    { href: settings.youtube_url, label: "YouTube" },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href));

  return (
    <footer className="mt-auto border-t border-border bg-champagne-soft/60">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="grid content-start gap-5">
          <Logo logoUrl={settings.logo_url} name={settings.business_name} />
          {settings.footer_text && <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{settings.footer_text}</p>}
          <div className="flex gap-2">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex size-10 items-center justify-center rounded-full border border-gold/50 text-gold-ink transition-colors hover:bg-gold hover:text-cocoa-deep">
                <InstagramIcon className="size-5" />
              </a>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex size-10 items-center justify-center rounded-full border border-gold/50 text-gold-ink transition-colors hover:bg-gold hover:text-cocoa-deep">
                <WhatsAppIcon className="size-5" />
              </a>
            )}
          </div>
        </div>

        <FooterColumn title="Navegação">
          {NAV_LINKS.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
          <FooterLink href="/politica-de-privacidade">Política de privacidade</FooterLink>
        </FooterColumn>

        <FooterColumn title="Categorias">
          {categories.slice(0, 7).map((c) => (
            <FooterLink key={c.id} href={`/categorias/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
          {!categories.length && <FooterLink href="/catalogo">Ver catálogo</FooterLink>}
        </FooterColumn>

        <FooterColumn title="Atendimento">
          {settings.instagram_handle && instagram && (
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-cocoa hover:text-gold-ink">
              <InstagramIcon className="size-4 text-gold-ink" /> @{settings.instagram_handle.replace(/^@/, "")}
            </a>
          )}
          {whatsapp && settings.whatsapp_number && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-cocoa hover:text-gold-ink">
              <WhatsAppIcon className="size-4 text-gold-ink" /> WhatsApp
            </a>
          )}
          {settings.phone && (
            <p className="flex items-center gap-2.5 text-sm">
              <Phone className="size-4 text-gold-ink" /> {settings.phone}
            </p>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 text-sm break-all hover:text-gold-ink">
              <Mail className="size-4 shrink-0 text-gold-ink" /> {settings.email}
            </a>
          )}
          {settings.address && (
            <p className="flex items-start gap-2.5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-ink" /> <span className="whitespace-pre-line">{settings.address}</span>
            </p>
          )}
          {settings.business_hours && (
            <p className="flex items-start gap-2.5 text-sm">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-ink" /> <span className="whitespace-pre-line">{settings.business_hours}</span>
            </p>
          )}
          {socials.length > 0 && (
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-gold-ink hover:underline">
                  {s.label}
                </a>
              ))}
            </p>
          )}
        </FooterColumn>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.business_name}. Todos os direitos reservados.
          </p>
          <Link href="/politica-de-privacidade" className="hover:text-gold-ink">
            Política de privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid content-start gap-3">
      <h2 className="eyebrow mb-1">{title}</h2>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="w-fit text-sm text-cocoa transition-colors hover:text-gold-ink">
      {children}
    </Link>
  );
}
