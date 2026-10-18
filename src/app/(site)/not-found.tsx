import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <EmptyState
        title="Página não encontrada"
        description="O endereço pode ter mudado ou o produto não está mais disponível."
        action={
          <Button asChild>
            <Link href="/catalogo">Ver catálogo</Link>
          </Button>
        }
      />
    </div>
  );
}
