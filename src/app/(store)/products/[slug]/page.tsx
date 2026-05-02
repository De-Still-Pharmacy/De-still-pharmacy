import { getProductBySlug } from "@/actions/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "@/components/store/star-rating";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductGallery } from "@/components/store/product-gallery";
import { PriceDisplay } from "@/components/store/price-display";
import { Metadata } from "next";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
  ChevronRight,
  Pill,
  AlertTriangle,
  FlaskConical,
  Factory,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <ProductGallery
            images={product.images}
            videoUrl={product.videoUrl}
            productName={product.name}
          />

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Link href={`/products?category=${product.category.slug}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors cursor-pointer">
                  {product.category.name}
                </Badge>
              </Link>
              {product.requiresPrescription && (
                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                  <Pill className="mr-1 h-3 w-3" />
                  Prescription Required
                </Badge>
              )}
              {discount > 0 && (
                <Badge variant="destructive">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={product.averageRating} size="md" />
                <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-5">
              <PriceDisplay
                amount={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
              />
            </div>

            {/* Stock status */}
            <div className="mt-3">
              {product.stock > 10 ? (
                <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  In Stock
                </p>
              ) : product.stock > 0 ? (
                <p className="text-sm font-medium text-amber-600 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                  Only {product.stock} left in stock
                </p>
              ) : (
                <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
                  Out of Stock
                </p>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="mt-4 text-muted-foreground leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Divider */}
            <div className="my-6 border-t" />

            {/* Add to Cart */}
            <AddToCartButton product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images[0]?.url || "",
              stock: product.stock,
              slug: product.slug,
            }} />

            {/* Trust signals */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-muted/50">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-xs font-medium">Genuine Products</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-muted/50">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-muted/50">
                <RotateCcw className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-medium">Easy Returns</span>
              </div>
            </div>

            {/* Quick info */}
            <div className="mt-6 space-y-2.5">
              {product.manufacturer && (
                <div className="flex items-center gap-3 text-sm">
                  <Factory className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Manufacturer:</span>
                  <span className="font-medium">{product.manufacturer}</span>
                </div>
              )}
              {product.activeIngredients && (
                <div className="flex items-center gap-3 text-sm">
                  <FlaskConical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Active Ingredients:</span>
                  <span className="font-medium">{product.activeIngredients}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-3 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 sm:mt-16">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Description
              </TabsTrigger>
              {product.dosageInfo && (
                <TabsTrigger
                  value="dosage"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  <Pill className="mr-2 h-4 w-4" />
                  Dosage
                </TabsTrigger>
              )}
              {product.sideEffects && (
                <TabsTrigger
                  value="sideEffects"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Side Effects
                </TabsTrigger>
              )}
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Reviews ({product.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="max-w-3xl">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </TabsContent>

            {product.dosageInfo && (
              <TabsContent value="dosage" className="mt-6">
                <div className="max-w-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Dosage Information
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap">{product.dosageInfo}</p>
                </div>
              </TabsContent>
            )}

            {product.sideEffects && (
              <TabsContent value="sideEffects" className="mt-6">
                <div className="max-w-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-6">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Possible Side Effects
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 leading-relaxed whitespace-pre-wrap">{product.sideEffects}</p>
                </div>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-6">
              {product.reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product.</p>
                </div>
              ) : (
                <div className="max-w-3xl space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border rounded-xl p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                          {review.user.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{review.user.name || "Anonymous"}</p>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>
                      {review.title && <p className="font-semibold mt-3">{review.title}</p>}
                      {review.comment && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
