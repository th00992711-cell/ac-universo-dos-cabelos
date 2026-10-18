import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Arquivos oficiais da marca, recortados da logo original com fundo transparente:
 * - emblem: o selo redondo completo (louros, "AC", nome e @ do Instagram);
 * - mark: o monograma "AC" com os louros e as estrelas, para espaços horizontais;
 * - monogram: apenas o "AC", para tamanhos pequenos.
 */
export const BRAND = {
  emblem: { src: "/brand/ac-emblema.png", width: 800, height: 797 },
  mark: { src: "/brand/ac-marca.png", width: 640, height: 419 },
  monogram: { src: "/brand/ac-monograma.png", width: 400, height: 332 },
} as const;

/**
 * Logo da marca. Por padrão usa os arquivos oficiais; se outra logo for enviada
 * no painel (Configurações > Logo), ela tem prioridade.
 * - "horizontal" (cabeçalho e painel): marca + nome em uma linha.
 * - "emblem" (rodapé, login): o selo redondo completo.
 */
export function Logo({
  logoUrl,
  name = "AC Universo dos Cabelos",
  className,
  compact = false,
  priority = false,
  variant = "horizontal",
}: {
  logoUrl?: string | null;
  name?: string;
  className?: string;
  compact?: boolean;
  priority?: boolean;
  variant?: "horizontal" | "emblem";
}) {
  if (logoUrl) {
    return (
      <span className={cn("relative block h-12 w-40", compact && "h-10 w-32", variant === "emblem" && "h-28 w-56", className)}>
        <Image src={logoUrl} alt={name} fill sizes="224px" className="object-contain object-left" preload={priority} />
      </span>
    );
  }

  if (variant === "emblem") {
    return (
      <Image
        src={BRAND.emblem.src}
        width={BRAND.emblem.width}
        height={BRAND.emblem.height}
        alt={name}
        sizes="176px"
        className={cn("size-36 object-contain", className)}
        preload={priority}
      />
    );
  }

  return (
    <span className={cn("flex items-center", compact ? "gap-2" : "gap-2.5 sm:gap-3", className)} aria-label={name} role="img">
      <Image
        src={BRAND.mark.src}
        width={BRAND.mark.width}
        height={BRAND.mark.height}
        alt=""
        sizes="96px"
        className={cn("w-auto object-contain", compact ? "h-9" : "h-10 sm:h-12 lg:h-14")}
        preload={priority}
      />
      <span className="flex flex-col leading-none" aria-hidden>
        <span
          className={cn(
            "font-display font-semibold whitespace-nowrap text-gold-metal uppercase",
            compact ? "text-[0.74rem] tracking-[0.06em]" : "text-[0.8rem] tracking-[0.08em] sm:text-[1.08rem] sm:tracking-[0.12em]",
          )}
        >
          Universo dos Cabelos
        </span>
        <span className={cn("mt-1.5 flex items-center gap-1.5", compact && "hidden")}>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/70" />
          <Sparkle className="size-2 text-gold" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
        </span>
      </span>
    </span>
  );
}

/** Monograma "AC" com louros: estados vazios e ilustrações. */
export function Monogram({ className }: { className?: string }) {
  return <Image src={BRAND.mark.src} width={BRAND.mark.width} height={BRAND.mark.height} alt="" aria-hidden sizes="160px" className={cn("h-auto object-contain", className)} />;
}

/** Estrela de quatro pontas, como a da logo. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="currentColor">
      <path d="M8 0c.5 4.2 1.8 6.9 8 8-6.2 1.1-7.5 3.8-8 8-.5-4.2-1.8-6.9-8-8 6.2-1.1 7.5-3.8 8-8Z" />
    </svg>
  );
}
