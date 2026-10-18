"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({ href, label, className }: { href: string; label: string; className?: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative py-2 text-[0.8rem] font-semibold tracking-[0.14em] uppercase text-cocoa transition-colors hover:text-gold-ink",
        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100",
        active && "text-gold-ink after:scale-x-100",
        className,
      )}
    >
      {label}
    </Link>
  );
}
