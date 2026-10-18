"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = term.trim();
    setOpen(false);
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Buscar produtos">
          <Search className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent title="Buscar no catálogo" description="Digite o nome ou o código do produto." className="top-24 translate-y-0 sm:top-32">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row" role="search">
          <label htmlFor="busca-global" className="sr-only">
            Buscar
          </label>
          <Input
            id="busca-global"
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ex.: liso 60 cm, mega hair…"
            maxLength={80}
          />
          <Button type="submit">
            <Search /> Buscar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
