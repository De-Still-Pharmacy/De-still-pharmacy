"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCategory, updateCategory } from "@/actions/admin-categories";
import { Loader2, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
  };
  onSuccess?: () => void;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "de-still-pharmacy/categories");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        setImageUrl(data.secure_url);
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      image: imageUrl || undefined,
    };

    const result = initialData
      ? await updateCategory(initialData.id, data)
      : await createCategory(data);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success(initialData ? "Category updated" : "Category created");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/categories");
        router.refresh();
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FloatingInput
        id="name"
        name="name"
        label="Category Name"
        required
        defaultValue={initialData?.name}
      />

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialData?.description || ""}
          placeholder="Brief description of the category"
        />
      </div>

      <div className="space-y-2">
        <Label>Category Image</Label>
        {imageUrl ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
            <Image
              src={imageUrl}
              alt="Category image"
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => setImageUrl("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Click to upload image</span>
                <span className="text-xs">PNG, JPG, WebP up to 5MB</span>
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading || isUploading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
