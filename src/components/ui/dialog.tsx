"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
  title,
  description,
  hideTitle = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { title: string; description?: string; hideTitle?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        <div className={cn("grid gap-1 pr-8", hideTitle && "sr-only")}>
          <DialogPrimitive.Title className="font-display text-2xl font-semibold">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", !description && "sr-only")}>
            {description ?? title}
          </DialogPrimitive.Description>
        </div>
        {children}
        <DialogPrimitive.Close className="absolute top-5 right-5 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <X className="size-5" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Dialog, DialogTrigger, DialogClose, DialogContent };
