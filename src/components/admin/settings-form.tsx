"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SettingsFormProps {
  settings: {
    id: string;
    siteName: string;
    tagline?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankAccountName?: string | null;
    logoUrl?: string | null;
  };
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: settings.id,
        siteName: form.get("siteName"),
        tagline: form.get("tagline"),
        phone: form.get("phone"),
        email: form.get("email"),
        address: form.get("address"),
        bankName: form.get("bankName"),
        bankAccountNumber: form.get("bankAccountNumber"),
        bankAccountName: form.get("bankAccountName"),
      }),
    });

    const data = await res.json();
    if (data.error) {
      toast.error(data.error);
    } else {
      toast.success("Settings updated");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput id="siteName" name="siteName" label="Site Name" defaultValue={settings.siteName} required />
          <FloatingInput id="tagline" name="tagline" label="Tagline" defaultValue={settings.tagline || ""} />
          <FloatingInput id="phone" name="phone" label="Phone" defaultValue={settings.phone || ""} />
          <FloatingInput id="email" name="email" type="email" label="Email" defaultValue={settings.email || ""} />
          <div className="sm:col-span-2">
            <FloatingInput id="address" name="address" label="Address" defaultValue={settings.address || ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput id="bankName" name="bankName" label="Bank Name" defaultValue={settings.bankName || ""} />
          <FloatingInput id="bankAccountNumber" name="bankAccountNumber" label="Account Number" defaultValue={settings.bankAccountNumber || ""} />
          <FloatingInput id="bankAccountName" name="bankAccountName" label="Account Name" defaultValue={settings.bankAccountName || ""} />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </form>
  );
}
