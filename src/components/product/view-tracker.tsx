"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Conta uma visualização por produto por sessão do navegador (a função no banco respeita a chave liga/desliga). */
export function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const key = `ac-view-${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // navegação privada: conta mesmo assim
    }
    void createClient().rpc("track_product_view", { p_product_id: productId });
  }, [productId]);
  return null;
}
