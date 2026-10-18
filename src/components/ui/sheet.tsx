"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

function SheetContent({
  className,
  children,
  title,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { title: string; side?: "left" | "right" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <SheetPrimitive.Content
        className={cn(
          "fixed inset-y-0 z-50 flex h-full w-[86%] max-w-sm flex-col gap-4 overflow-y-auto bg-background p-6 shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "right"
            ? "right-0 border-l border-border data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
            : "left-0 border-r border-border data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
          className,
        )}
        {...props}
      >
        <SheetPrimitive.Title className="font-display text-2xl font-semibold">{title}</SheetPrimitive.Title>
        <SheetPrimitive.Description className="sr-only">{title}</SheetPrimitive.Description>
        {children}
        <SheetPrimitive.Close className="absolute top-5 right-5 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <X className="size-5" />
          <span className="sr-only">Fechar</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
