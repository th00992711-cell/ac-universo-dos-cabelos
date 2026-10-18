import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "AC Universo dos Cabelos | Cabelos selecionados com atendimento personalizado",
    template: "%s | AC Universo dos Cabelos",
  },
  description:
    "Catálogo de cabelos da AC Universo dos Cabelos: lisos, ondulados, cacheados, crespos, mega hair e acessórios. Atendimento personalizado pelo WhatsApp.",
  applicationName: "AC Universo dos Cabelos",
  openGraph: { siteName: "AC Universo dos Cabelos", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
