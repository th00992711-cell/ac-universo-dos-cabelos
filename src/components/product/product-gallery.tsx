"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Galeria com zoom ao passar o mouse (desktop) e tela cheia com zoom por toque/clique. */
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");

  if (!images.length) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-3xl border border-border bg-champagne-soft text-gold">
        <ImageOff className="size-10" aria-label="Produto sem foto" />
      </div>
    );
  }

  const current = images[index] ?? images[0];
  const go = (delta: number) => {
    setZoomed(false);
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  function track(e: React.MouseEvent<HTMLElement>, set: (v: string) => void) {
    const rect = e.currentTarget.getBoundingClientRect();
    set(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <div className="grid min-w-0 gap-3 sm:gap-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={(e) => track(e, setOrigin)}
        className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-champagne-soft focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Ampliar foto ${index + 1} de ${images.length}`}
      >
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          preload
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn("object-cover transition-transform duration-300 ease-out", hovering && "pointer-fine:scale-[1.8]")}
          style={{ transformOrigin: origin }}
        />
        <span className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-cocoa shadow-soft backdrop-blur">
          <ZoomIn className="size-3.5" /> Ampliar
        </span>
      </button>

      {images.length > 1 && (
        <ul className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Fotos do produto">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block size-20 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors sm:size-24",
                  i === index ? "border-gold" : "border-transparent opacity-75 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <DialogPrimitive.Root
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          setZoomed(false);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-cocoa-deep/95 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex items-center justify-center outline-none"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(1);
              if (e.key === "ArrowLeft") go(-1);
            }}
          >
            <DialogPrimitive.Title className="sr-only">{name}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Foto {index + 1} de {images.length}. Toque na imagem para aproximar.
            </DialogPrimitive.Description>
            <button
              type="button"
              className={cn("relative h-[86dvh] w-[94vw] overflow-hidden", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
              onClick={(e) => {
                track(e, setZoomOrigin);
                setZoomed((z) => !z);
              }}
              onMouseMove={(e) => zoomed && track(e, setZoomOrigin)}
              aria-label={zoomed ? "Afastar" : "Aproximar"}
            >
              <Image
                src={current.url}
                alt={current.alt || name}
                fill
                sizes="100vw"
                className={cn("object-contain transition-transform duration-300", zoomed && "scale-[2.4]")}
                style={{ transformOrigin: zoomOrigin }}
              />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute top-1/2 left-3 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25" aria-label="Foto anterior">
                  <ChevronLeft className="size-6" />
                </button>
                <button type="button" onClick={() => go(1)} className="absolute top-1/2 right-3 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25" aria-label="Próxima foto">
                  <ChevronRight className="size-6" />
                </button>
                <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur">
                  {index + 1} / {images.length}
                </p>
              </>
            )}
            <DialogPrimitive.Close className="absolute top-4 right-4 flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25" aria-label="Fechar">
              <X className="size-6" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
