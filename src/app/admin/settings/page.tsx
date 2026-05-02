import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { siteName: "De-Still Pharmacy" },
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <SettingsForm settings={{
        id: settings.id,
        siteName: settings.siteName,
        tagline: settings.tagline,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        bankName: settings.bankName,
        bankAccountNumber: settings.bankAccountNumber,
        bankAccountName: settings.bankAccountName,
        logoUrl: settings.logoUrl,
      }} />
    </div>
  );
}
