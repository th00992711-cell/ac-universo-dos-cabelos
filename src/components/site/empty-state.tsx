import { Monogram } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gold/50 bg-card/60 px-6 py-16 text-center", className)}>
      <Monogram className="w-24 opacity-85" />
      <h3 className="text-3xl">{title}</h3>
      {description && <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
