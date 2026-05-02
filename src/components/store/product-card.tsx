"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/hooks/use-currency";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    images: { url: string; alt?: string | null }[];
    category: { name: string };
    averageRating?: number;
    requiresPrescription: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const mainImage = product.images[0]?.url;
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  function handleAddToCart() {
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage || "",
      stock: product.stock,
      slug: product.slug,
    });
    toast.success("Added to cart");
    openCart();
  }

  return (
    <Card className="group overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.images[0]?.alt || product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2" variant="destructive">
              Sale
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
          {product.requiresPrescription && (
            <Badge className="absolute top-2 right-2" variant="outline">
              Rx
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium mt-1 line-clamp-2 hover:underline">{product.name}</h3>
        </Link>
        {product.averageRating !== undefined && product.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">{product.averageRating.toFixed(1)}</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold">{format(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {format(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <Button
          className="w-full mt-3"
          size="sm"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
