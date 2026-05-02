import { HeroSection } from "@/components/store/hero-section";
import { ProductGrid } from "@/components/store/product-grid";
import { getPublishedProducts, getCategories } from "@/actions/products";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Pill } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredResult, categoriesData] = await Promise.all([
    getPublishedProducts({ limit: 8, featured: true }),
    getCategories(),
  ]);

  let productsToShow = featuredResult.products;
  if (productsToShow.length === 0) {
    const allProducts = await getPublishedProducts({ limit: 8 });
    productsToShow = allProducts.products;
  }

  return (
    <div>
      <HeroSection />

      {/* Categories Section */}
      {categoriesData.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Shop by Category</h2>
              <Link href="/products" className={buttonVariants({ variant: "ghost" })}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categoriesData.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative block overflow-hidden rounded-xl h-36 sm:h-44"
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/80 to-primary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="font-semibold text-white text-sm sm:text-base">{cat.name}</h3>
                    <p className="text-xs text-white/70 mt-0.5">
                      {cat._count.products} {cat._count.products === 1 ? "product" : "products"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {featuredResult.products.length > 0 ? "Featured Products" : "Our Products"}
            </h2>
            <Link href="/products" className={buttonVariants({ variant: "ghost" })}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={productsToShow} />
        </div>
      </section>
    </div>
  );
}
