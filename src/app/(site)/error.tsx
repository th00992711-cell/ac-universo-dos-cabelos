"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page py-20">
      <EmptyState
        title="Algo não saiu como esperado"
        description="Não conseguimos carregar esta página agora. Tente novamente em instantes."
        action={<Button onClick={reset}>Tentar novamente</Button>}
      />
    </div>
  );
}
