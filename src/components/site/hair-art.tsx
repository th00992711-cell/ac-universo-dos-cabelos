import { Monogram } from "@/components/brand/logo";

/** Ilustração usada enquanto não há fotografia cadastrada no banner. */
export function HairArt() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(120%_80%_at_70%_10%,#fffaf0_0%,#f3ead6_45%,#e8d7b0_100%)]">
      <svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="strand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B58A36" stopOpacity="0.05" />
            <stop offset="0.5" stopColor="#C9A24D" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8A6829" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {Array.from({ length: 22 }, (_, i) => {
          const x = 40 + i * 15;
          const sway = 26 + (i % 5) * 7;
          return (
            <path
              key={i}
              d={`M${x} -10 C ${x + sway} 120, ${x - sway} 240, ${x + sway * 0.6} 360 S ${x - sway * 0.4} 470, ${x + 10} 540`}
              fill="none"
              stroke="url(#strand)"
              strokeWidth={i % 3 === 0 ? 1.6 : 0.9}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Monogram className="size-28 drop-shadow-[0_10px_30px_rgba(181,138,54,0.35)] sm:size-36" />
      </div>
    </div>
  );
}
