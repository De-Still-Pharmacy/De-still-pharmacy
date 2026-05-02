"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { SelectItem } from "@/components/ui/select";
import { FloatingSelect } from "@/components/ui/floating-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export function TeamMemberForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        role: form.get("role"),
      }),
    });

    const data = await res.json();
    if (data.error) {
      toast.error(data.error);
    } else {
      toast.success("Team member added");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Add Team Member</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <FloatingInput name="email" id="team-email" type="email" label="Email address" required />
          </div>
          <FloatingSelect name="role" label="Role" defaultValue="ADMIN" className="w-40">
            <SelectItem value="VIEWER">Viewer</SelectItem>
            <SelectItem value="PUBLISHER">Publisher</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
          </FloatingSelect>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
