"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { SelectItem } from "@/components/ui/select";
import { FloatingSelect } from "@/components/ui/floating-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TeamActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        role: form.get("role"),
        name: form.get("name"),
      }),
    });

    if (res.ok) {
      toast.success("Team member added");
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to add team member");
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Add Member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <FloatingInput id="name" name="name" label="Name" required />
          <FloatingInput id="email" name="email" type="email" label="Email" required />
          <FloatingSelect name="role" label="Role" defaultValue="ADMIN">
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="VIEWER">Viewer</SelectItem>
          </FloatingSelect>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
