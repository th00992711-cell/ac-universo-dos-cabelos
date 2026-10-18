"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MAX_PRODUCT_IMAGES } from "@/lib/constants";
import { validateImageFile } from "@/lib/image-upload";
import { cn } from "@/lib/utils";

export type ManagedImage = {
  key: string;
  /** Caminho no Storage (imagens já salvas). */
  path?: string;
  /** Arquivo escolhido e ainda não enviado. */
  file?: File;
  preview: string;
  alt: string;
};

/**
 * Fotos do produto: pré-visualização antes de salvar, foto principal (a primeira),
 * reordenação e exclusão. O envio acontece ao salvar o produto.
 */
export function ImageManager({ value, onChange }: { value: ManagedImage[]; onChange: (images: ManagedImage[]) => void }) {
  const input = useRef<HTMLInputElement>(null);

  function add(files: FileList | null) {
    if (!files?.length) return;
    const next = [...value];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PRODUCT_IMAGES) {
        toast.error(`Limite de ${MAX_PRODUCT_IMAGES} fotos por produto`);
        break;
      }
      const error = validateImageFile(file);
      if (error) {
        toast.error(error);
        continue;
      }
      next.push({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file), alt: "" });
    }
    onChange(next);
  }

  function move(index: number, delta: number) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function makePrimary(index: number) {
    const next = [...value];
    const [item] = next.splice(index, 1);
    onChange([item, ...next]);
  }

  return (
    <div className="grid gap-4">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {value.map((img, i) => (
          <li key={img.key} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[4/5] bg-champagne-soft">
              <Image src={img.preview} alt={img.alt || `Foto ${i + 1}`} fill sizes="240px" unoptimized={Boolean(img.file)} className="object-cover" />
              {i === 0 ? (
                <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-cocoa-deep px-2.5 py-1 text-[0.65rem] font-semibold text-white">
                  <Star className="size-3 fill-gold text-gold" /> Principal
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makePrimary(i)}
                  className="absolute top-2 left-2 cursor-pointer rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-semibold text-cocoa hover:bg-white"
                >
                  Tornar principal
                </button>
              )}
              {img.file && <span className="absolute right-2 bottom-2 rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-semibold text-cocoa-deep">Nova</span>}
            </div>
            <div className="flex items-center justify-between gap-1 p-1.5">
              <div className="flex">
                <IconButton label="Mover para a esquerda" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowLeft className="size-4" />
                </IconButton>
                <IconButton label="Mover para a direita" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                  <ArrowRight className="size-4" />
                </IconButton>
              </div>
              <IconButton label="Excluir foto" onClick={() => onChange(value.filter((v) => v.key !== img.key))} danger>
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </li>
        ))}
        {value.length < MAX_PRODUCT_IMAGES && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/50 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-gold-ink"
            >
              <ImagePlus className="size-6" />
              Adicionar fotos
            </button>
          </li>
        )}
      </ul>
      <p className="text-xs text-muted-foreground">
        Até {MAX_PRODUCT_IMAGES} fotos (JPG, PNG, WEBP ou AVIF). A primeira é a principal. As fotos são redimensionadas e otimizadas automaticamente
        ao salvar.
      </p>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-9 cursor-pointer items-center justify-center rounded-lg text-cocoa transition-colors hover:bg-secondary disabled:cursor-default disabled:opacity-30",
        danger && "hover:bg-red-50 hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}
