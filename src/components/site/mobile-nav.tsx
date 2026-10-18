"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { InstagramIcon, WhatsAppIcon } from "./icons";

export function MobileNav({ whatsappHref, instagramHref }: { whatsappHref: string | null; instagramHref: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent title="Menu" side="right">
        <div className="gold-rule" />
        <nav className="flex flex-col" aria-label="Menu principal">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-border py-4 font-display text-2xl text-cocoa-deep transition-colors hover:text-gold-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-3">
          {whatsappHref && (
            <Button asChild variant="whatsapp" size="lg">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-5" /> Falar no WhatsApp
              </a>
            </Button>
          )}
          {instagramHref && (
            <Button asChild variant="outline" size="lg">
              <a href={instagramHref} target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="size-5" /> Instagram
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
