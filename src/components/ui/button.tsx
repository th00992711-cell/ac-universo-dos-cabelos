import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-wide transition-[background-color,color,border-color,box-shadow,transform] duration-300 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_30px_-14px_var(--color-gold-deep)] hover:bg-gold-deep hover:shadow-[0_14px_34px_-14px_var(--color-gold-deep)]",
        dark: "bg-foreground text-background hover:bg-foreground/90",
        outline: "border border-primary/70 bg-transparent text-foreground hover:border-primary hover:bg-primary/10",
        secondary: "border border-border bg-card text-foreground hover:border-primary/60",
        ghost: "text-foreground hover:bg-secondary",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        link: "rounded-none px-0 text-gold-ink underline-offset-4 hover:underline",
        whatsapp: "bg-whatsapp text-white shadow-[0_10px_30px_-14px_var(--color-whatsapp)] hover:brightness-95",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-[0.95rem]",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
