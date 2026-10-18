import { cn, formatBRL } from "@/lib/utils";

export function Price({
  price,
  promoPrice,
  size = "md",
  className,
}: {
  price: number | null;
  promoPrice: number | null;
  size?: "md" | "lg";
  className?: string;
}) {
  if (price === null) {
    return <p className={cn("text-sm font-medium text-muted-foreground", className)}>Preço sob consulta</p>;
  }
  const big = size === "lg";
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2.5", className)}>
      {promoPrice !== null ? (
        <>
          <span className="sr-only">De</span>
          <s className={cn("text-muted-foreground", big ? "text-lg" : "text-sm")}>{formatBRL(price)}</s>
          <span className="sr-only">por</span>
          <span className={cn("font-semibold text-cocoa-deep", big ? "text-3xl" : "text-lg")}>{formatBRL(promoPrice)}</span>
        </>
      ) : (
        <span className={cn("font-semibold text-cocoa-deep", big ? "text-3xl" : "text-lg")}>{formatBRL(price)}</span>
      )}
    </p>
  );
}
