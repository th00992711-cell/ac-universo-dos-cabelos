import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import type { SiteSettings } from "@/lib/types";
import { generalWhatsappLink, instagramUrl } from "@/lib/whatsapp";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { SearchDialog } from "./search-dialog";

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const whatsapp = generalWhatsappLink(settings);
  const instagram = instagramUrl(settings.instagram_handle);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${settings.business_name}, página inicial`}>
          <Logo logoUrl={settings.logo_url} name={settings.business_name} priority />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Menu principal">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <SearchDialog />
          {instagram && (
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da AC Universo dos Cabelos">
                <InstagramIcon className="size-5" />
              </a>
            </Button>
          )}
          {whatsapp && (
            <Button asChild size="sm" className="hidden h-10 px-5 md:inline-flex">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
            </Button>
          )}
          <MobileNav whatsappHref={whatsapp} instagramHref={instagram} />
        </div>
      </div>
    </header>
  );
}
