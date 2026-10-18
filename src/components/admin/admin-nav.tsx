"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ExternalLink, FolderTree, Images, LayoutDashboard, LogOut, Menu, Package, Settings, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes },
  { href: "/admin/banners", label: "Banners", icon: Images },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/conta", label: "Minha conta", icon: UserRound },
];

function Links({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1" aria-label="Painel administrativo">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-cocoa-deep text-white" : "text-cocoa hover:bg-secondary",
            )}
          >
            <l.icon className={cn("size-4", active ? "text-gold" : "text-gold-ink")} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer({ name }: { name: string }) {
  return (
    <div className="mt-auto grid gap-2 border-t border-border pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-2 px-3.5 py-2 text-sm text-cocoa hover:text-gold-ink">
        <ExternalLink className="size-4" /> Ver o site
      </Link>
      <form action={signOut}>
        <button type="submit" className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-sm text-cocoa hover:text-destructive">
          <LogOut className="size-4" /> Sair
        </button>
      </form>
      <p className="truncate px-3.5 text-xs text-muted-foreground">{name}</p>
    </div>
  );
}

export function AdminSidebar({ name }: { name: string }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 border-r border-border bg-card px-4 py-6 lg:flex">
      <Link href="/admin" className="px-2">
        <Logo compact />
      </Link>
      <Links />
      <Footer name={name} />
    </aside>
  );
}

export function AdminTopbar({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:hidden">
      <Link href="/admin">
        <Logo compact />
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menu do painel">
            <Menu className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent title="Painel" side="left" className="flex flex-col">
          <Links onNavigate={() => setOpen(false)} />
          <Footer name={name} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
