import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { getCategories } from "@/lib/services/catalog";
import { getSiteSettings } from "@/lib/services/settings";
import { generalWhatsappLink } from "@/lib/whatsapp";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-cocoa-deep px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader settings={settings} />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} categories={categories} />
      <WhatsAppFloat href={generalWhatsappLink(settings)} />
    </>
  );
}
