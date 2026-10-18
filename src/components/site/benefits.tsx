import { Crown, Gem, Heart, MessageCircle, Scissors, Sparkles, Star, Truck, type LucideIcon } from "lucide-react";
import type { Benefit } from "@/lib/types";

export const BENEFIT_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  sparkles: { icon: Sparkles, label: "Brilho" },
  gem: { icon: Gem, label: "Joia" },
  heart: { icon: Heart, label: "Coração" },
  crown: { icon: Crown, label: "Coroa" },
  star: { icon: Star, label: "Estrela" },
  scissors: { icon: Scissors, label: "Tesoura" },
  truck: { icon: Truck, label: "Entrega" },
  message: { icon: MessageCircle, label: "Conversa" },
};

export function Benefits({ items }: { items: Benefit[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {items.map((b, i) => {
        const Icon = BENEFIT_ICONS[b.icon]?.icon ?? Sparkles;
        return (
          <li key={`${b.title}-${i}`} className="flex flex-col gap-4 bg-card p-8 sm:p-10">
            <span className="flex size-14 items-center justify-center rounded-full border border-gold/50 bg-champagne-soft text-gold-ink">
              <Icon className="size-6" strokeWidth={1.4} />
            </span>
            <h3 className="text-2xl">{b.title}</h3>
            {b.description && <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>}
          </li>
        );
      })}
    </ul>
  );
}
