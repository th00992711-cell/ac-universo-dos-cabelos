"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

/** Botão que pede confirmação antes de uma ação destrutiva. */
export function ConfirmButton({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
  destructive = true,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<boolean | void>;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title} description={description}>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const keepOpen = (await onConfirm()) === false;
                if (!keepOpen) setOpen(false);
              })
            }
          >
            {pending && <Loader2 className="animate-spin" />} {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
