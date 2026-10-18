import type { Metadata } from "next";
import { AdminSidebar, AdminTopbar } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel AC" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const name = admin.fullName || admin.email;
  return (
    <div className="flex min-h-dvh bg-background">
      <AdminSidebar name={name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={name} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
