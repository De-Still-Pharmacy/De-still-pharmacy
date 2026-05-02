"use client";

import { Switch } from "@/components/ui/switch";
import { toggleProductPublish } from "@/actions/admin-products";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TogglePublishButtonProps {
  productId: string;
  isPublished: boolean;
}

export function TogglePublishButton({ productId, isPublished }: TogglePublishButtonProps) {
  const router = useRouter();

  async function handleToggle() {
    const result = await toggleProductPublish(productId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isPublished ? "Product unpublished" : "Product published");
      router.refresh();
    }
  }

  return <Switch checked={isPublished} onCheckedChange={handleToggle} />;
}
