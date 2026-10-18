import { WhatsAppIcon } from "./icons";

export function WhatsAppFloat({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_14px_30px_-10px_rgb(31_157_85/0.7)] ring-4 ring-white/70 transition-transform duration-300 hover:scale-105 focus-visible:ring-gold sm:right-6 sm:bottom-6 max-lg:[body:has([data-sticky-cta])_&]:hidden"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
