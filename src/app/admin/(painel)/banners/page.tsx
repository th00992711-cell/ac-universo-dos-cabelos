import type { Metadata } from "next";
import { BannerManager } from "@/components/admin/banner-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listBanners } from "@/lib/services/admin";

export const metadata: Metadata = { title: "Banners" };

export default async function BannersPage() {
  const banners = await listBanners();
  return (
    <div className="grid gap-6">
      <PageHeader title="Banners" description="Textos e fotografias da página inicial." />
      <BannerManager banners={banners} />
    </div>
  );
}
