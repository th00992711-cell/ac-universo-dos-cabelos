import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo da marca. Enquanto o arquivo oficial não é enviado pelo painel
 * (Configurações > Logo), mostramos um monograma "AC" no mesmo estilo.
 */
export function Logo({
  logoUrl,
  name = "AC Universo dos Cabelos",
  className,
  compact = false,
  priority = false,
}: {
  logoUrl?: string | null;
  name?: string;
  className?: string;
  compact?: boolean;
  priority?: boolean;
}) {
  if (logoUrl) {
    return (
      <span className={cn("relative block h-12 w-40", compact && "h-10 w-32", className)}>
        <Image src={logoUrl} alt={name} fill sizes="160px" className="object-contain object-left" loading={priority ? "eager" : undefined} />
      </span>
    );
  }

  return (
    <span className={cn("flex items-center gap-3", className)} aria-label={name}>
      <Monogram className={compact ? "size-10" : "size-12"} />
      <span className="flex flex-col leading-none" aria-hidden>
        <span className="font-display text-[1.35rem] font-semibold tracking-[0.08em] text-cocoa-deep">AC</span>
        <span className={cn("mt-0.5 text-[0.6rem] font-semibold whitespace-nowrap text-gold-ink uppercase", compact ? "tracking-[0.18em]" : "tracking-[0.28em]")}>
          Universo dos Cabelos
        </span>
      </span>
    </span>
  );
}

export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="ac-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8D7B0" />
          <stop offset="0.45" stopColor="#C9A24D" />
          <stop offset="1" stopColor="#B58A36" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="url(#ac-gold)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="27" fill="none" stroke="url(#ac-gold)" strokeWidth="0.6" opacity="0.7" />
      <path
        d="M14 46c6-2 9-8 12-15s6-14 9-14c4 0 3 9 9 17 3 4 6 6 8 7"
        fill="none"
        stroke="url(#ac-gold)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fontFamily="var(--font-cormorant), Georgia, serif"
        fontSize="22"
        fontWeight="600"
        letterSpacing="1"
        fill="url(#ac-gold)"
      >
        AC
      </text>
    </svg>
  );
}
