"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryItem {
  type: "image" | "video";
  url: string;
  alt?: string;
}

interface ProductGalleryProps {
  images: { url: string; alt?: string | null }[];
  videoUrl?: string | null;
  productName: string;
}

export function ProductGallery({ images, videoUrl, productName }: ProductGalleryProps) {
  const items: GalleryItem[] = [
    ...images.map((img) => ({ type: "image" as const, url: img.url, alt: img.alt || productName })),
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl, alt: "Product video" }] : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] || items[0];

  function goTo(index: number) {
    if (index >= 0 && index < items.length) {
      setActiveIndex(index);
    }
  }

  if (items.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main display */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
        {activeItem.type === "image" ? (
          <Image
            src={activeItem.url}
            alt={activeItem.alt || productName}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <video
            src={activeItem.url}
            controls
            className="w-full h-full object-cover"
            poster=""
          />
        )}

        {/* Navigation arrows */}
        {items.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={() => goTo(activeIndex === 0 ? items.length - 1 : activeIndex - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={() => goTo(activeIndex === items.length - 1 ? 0 : activeIndex + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Counter */}
        {items.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {items.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all",
                activeIndex === i
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt={item.alt || ""}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
