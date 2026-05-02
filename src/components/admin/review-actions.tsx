"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ReviewActionsProps {
  reviewId: string;
  isApproved: boolean;
}

export function ReviewActions({ reviewId, isApproved }: ReviewActionsProps) {
  const router = useRouter();

  async function handleApprove() {
    const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "PATCH" });
    if (res.ok) {
      toast.success("Review approved");
      router.refresh();
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Review deleted");
      router.refresh();
    }
  }

  return (
    <div className="flex gap-1">
      {!isApproved && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleApprove}>
          <Check className="h-4 w-4 text-green-600" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
