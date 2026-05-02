"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SelectItem } from "@/components/ui/select";
import { FloatingSelect } from "@/components/ui/floating-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct, updateProduct } from "@/actions/admin-products";
import { Loader2, Upload, X, ImagePlus, Video, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: {
    id: string;
    name: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    sku?: string | null;
    stock: number;
    lowStockThreshold: number;
    categoryId: string;
    isPublished: boolean;
    isFeatured: boolean;
    requiresPrescription: boolean;
    dosageInfo?: string | null;
    sideEffects?: string | null;
    activeIngredients?: string | null;
    manufacturer?: string | null;
    expiryDate?: string | null;
    weight?: number | null;
    videoUrl?: string | null;
    images: { url: string }[];
  };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [requiresPrescription, setRequiresPrescription] = useState(initialData?.requiresPrescription ?? false);
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images.map((i) => i.url) || []);
  const [videoUrl, setVideoUrl] = useState<string>(initialData?.videoUrl || "");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File, type: "image" | "video") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("folder", type === "video" ? "de-still-pharmacy/videos" : "de-still-pharmacy/products");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Upload failed");
    }
    return res.json();
  }, []);

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingImages(true);

    try {
      const uploads = Array.from(files).map((file) => uploadFile(file, "image"));
      const results = await Promise.all(uploads);
      setImageUrls((prev) => [...prev, ...results.map((r: { secure_url: string }) => r.secure_url)]);
      toast.success(`${results.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleVideoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingVideo(true);

    try {
      const result = await uploadFile(files[0], "video");
      setVideoUrl(result.secure_url);
      toast.success("Video uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setUploadingVideo(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= imageUrls.length) return;
    const updated = [...imageUrls];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setImageUrls(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      shortDescription: form.get("shortDescription") as string,
      price: Number(form.get("price")),
      compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : null,
      costPrice: form.get("costPrice") ? Number(form.get("costPrice")) : null,
      sku: form.get("sku") as string,
      stock: Number(form.get("stock")),
      lowStockThreshold: Number(form.get("lowStockThreshold") || 5),
      categoryId: form.get("categoryId") as string,
      isPublished,
      isFeatured,
      requiresPrescription,
      dosageInfo: form.get("dosageInfo") as string,
      sideEffects: form.get("sideEffects") as string,
      activeIngredients: form.get("activeIngredients") as string,
      manufacturer: form.get("manufacturer") as string,
      expiryDate: form.get("expiryDate") as string,
      weight: form.get("weight") ? Number(form.get("weight")) : null,
      videoUrl: videoUrl || null,
    };

    const result = initialData
      ? await updateProduct(initialData.id, data, imageUrls)
      : await createProduct(data, imageUrls);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success(initialData ? "Product updated" : "Product created");
      router.push("/admin/products");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FloatingInput id="name" name="name" label="Product Name" required defaultValue={initialData?.name} />
              <FloatingInput id="shortDescription" name="shortDescription" label="Short Description" defaultValue={initialData?.shortDescription || ""} />
              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea id="description" name="description" required rows={5} defaultValue={initialData?.description} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <FloatingInput id="price" name="price" type="number" step="0.01" label="Price (NGN)" required defaultValue={initialData?.price} />
              <FloatingInput id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" label="Compare Price" defaultValue={initialData?.compareAtPrice || ""} />
              <FloatingInput id="costPrice" name="costPrice" type="number" step="0.01" label="Cost Price" defaultValue={initialData?.costPrice || ""} />
              <FloatingInput id="sku" name="sku" label="SKU" defaultValue={initialData?.sku || ""} />
              <FloatingInput id="stock" name="stock" type="number" label="Stock" required defaultValue={initialData?.stock ?? 0} />
              <FloatingInput id="lowStockThreshold" name="lowStockThreshold" type="number" label="Low Stock Alert" defaultValue={initialData?.lowStockThreshold ?? 5} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pharmacy Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FloatingInput id="manufacturer" name="manufacturer" label="Manufacturer" defaultValue={initialData?.manufacturer || ""} />
              <FloatingInput id="activeIngredients" name="activeIngredients" label="Active Ingredients" defaultValue={initialData?.activeIngredients || ""} />
              <div>
                <Label htmlFor="dosageInfo">Dosage Info</Label>
                <Textarea id="dosageInfo" name="dosageInfo" rows={3} defaultValue={initialData?.dosageInfo || ""} />
              </div>
              <div>
                <Label htmlFor="sideEffects">Side Effects</Label>
                <Textarea id="sideEffects" name="sideEffects" rows={3} defaultValue={initialData?.sideEffects || ""} />
              </div>
              <FloatingInput id="expiryDate" name="expiryDate" type="date" label="Expiry Date" defaultValue={initialData?.expiryDate || ""} />
              <FloatingInput id="weight" name="weight" type="number" step="0.01" label="Weight (kg)" defaultValue={initialData?.weight || ""} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Published</Label>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Requires Prescription</Label>
                <Switch checked={requiresPrescription} onCheckedChange={setRequiresPrescription} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Category</CardTitle></CardHeader>
            <CardContent>
              <FloatingSelect name="categoryId" label="Category" defaultValue={initialData?.categoryId} required>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </FloatingSelect>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image previews */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border bg-muted aspect-square">
                      <Image
                        src={url}
                        alt={`Product image ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          Main
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        {i > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveImage(i, i - 1)}
                            title="Move left"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeImage(i)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                  ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                `}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {uploadingImages ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Click or drag images here</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB each</p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={uploadingImages}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Video */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Product Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {videoUrl && (
                <div className="relative rounded-lg overflow-hidden border bg-muted">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full aspect-video object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setVideoUrl("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {!videoUrl && (
                <div
                  className="relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer border-muted-foreground/25 hover:border-primary/50"
                  onClick={() => document.getElementById("video-upload")?.click()}
                >
                  {uploadingVideo ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading video...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Video className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload video</p>
                      <p className="text-xs text-muted-foreground">MP4, WebM, MOV up to 50MB</p>
                    </div>
                  )}
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => handleVideoUpload(e.target.files)}
                    disabled={uploadingVideo}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
