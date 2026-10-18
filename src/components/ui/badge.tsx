import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/40 bg-primary/12 text-gold-ink",
        solid: "border-transparent bg-foreground text-background",
        secondary: "border-border bg-secondary text-secondary-foreground",
        success: "border-emerald-700/20 bg-emerald-50 text-emerald-800",
        warning: "border-amber-700/20 bg-amber-50 text-amber-800",
        destructive: "border-red-700/20 bg-red-50 text-red-800",
        outline: "border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
