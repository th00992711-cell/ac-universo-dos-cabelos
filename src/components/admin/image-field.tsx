"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/image-upload";
import { publicImageUrl, type StorageFolder } from "@/lib/storage";
import { cn } from "@/lib/utils";

/** Campo de uma única imagem (categoria, banner, logo). Envia ao escolher e guarda o caminho. */
export function ImageField({
  value,
  onChange,
  folder,
  label,
  aspect = "aspect-[4/3]",
  fit = "cover",
}: {
  value: string;
  onChange: (path: string) => void;
  folder: StorageFolder;
  label: string;
  aspect?: string;
  fit?: "cover" | "contain";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    const res = await uploadImage(file, folder);
    setBusy(false);
    if ("error" in res) {
      setPreview(null);
      toast.error(res.error);
      return;
    }
    onChange(res.path);
  }

  const src = preview ?? (value ? publicImageUrl(value) : null);

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className={cn("relative w-full max-w-sm overflow-hidden rounded-2xl border border-dashed border-gold/60 bg-champagne-soft/60", aspect)}>
        {src ? (
          <Image src={src} alt="" fill sizes="384px" unoptimized={Boolean(preview)} className={fit === "cover" ? "object-cover" : "object-contain p-4"} />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 text-sm text-muted-foreground hover:text-gold-ink">
            <ImagePlus className="size-6" /> Escolher imagem
          </button>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-gold-ink" />
          </span>
        )}
      </div>
      {src && (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => input.current?.click()} disabled={busy}>
            <ImagePlus /> Trocar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPreview(null);
              onChange("");
            }}
            disabled={busy}
          >
            <Trash2 /> Remover
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ou AVIF. A imagem é otimizada automaticamente antes do envio.</p>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
