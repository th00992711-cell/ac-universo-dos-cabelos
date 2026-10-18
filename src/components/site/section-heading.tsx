import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  align?: "center" | "left";
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-3", align === "center" && "items-center")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="text-4xl leading-[1.05] sm:text-5xl">{title}</h2>
        {align === "center" && <span className="gold-rule mt-1 w-24" aria-hidden />}
        {description && <p className="text-[0.98rem] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
