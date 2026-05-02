import { Suspense } from "react";
import { getPublishedProducts, getCategories } from "@/actions/products";
import { ProductGrid } from "@/components/store/product-grid";
import { ProductSort } from "@/components/store/product-sort";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, Package } from "lucide-react";

interface Props {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const result = await getPublishedProducts({
    page,
    limit: 12,
    categorySlug: params.category,
    search: params.search,
    sortBy: (params.sort as "price-asc" | "price-desc" | "newest" | "name") || "newest",
  });

  const categories = await getCategories();
  const activeCategory = categories.find((c) => c.slug === params.category);

  const pageTitle = params.search
    ? `Results for "${params.search}"`
    : activeCategory
      ? activeCategory.name
      : "All Products";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Breadcrumbs */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            {activeCategory || params.search ? (
              <>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  Products
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium truncate max-w-[200px]">
                  {pageTitle}
                </span>
              </>
            ) : (
              <span className="text-foreground font-medium">Products</span>
            )}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                Categories
              </h3>
              <nav className="space-y-1">
                <Link
                  href="/products"
                  className={cn(
                    "block px-3 py-2 rounded-md text-sm transition-colors",
                    !params.category
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      params.category === cat.slug
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{cat.name}</span>
                    <span className={cn(
                      "text-xs",
                      params.category === cat.slug
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground/60"
                    )}>
                      {cat._count.products}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.total} {result.total === 1 ? "product" : "products"} found
                </p>
              </div>
              <Suspense>
                <ProductSort />
              </Suspense>
            </div>

            {/* Mobile Category Filters */}
            <div className="lg:hidden mb-6 -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({
                      variant: !params.category ? "default" : "outline",
                      size: "sm",
                    }),
                    "flex-shrink-0 rounded-full"
                  )}
                >
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className={cn(
                      buttonVariants({
                        variant: params.category === cat.slug ? "default" : "outline",
                        size: "sm",
                      }),
                      "flex-shrink-0 rounded-full"
                    )}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Active filters */}
            {(params.search || params.category) && (
              <div className="flex items-center gap-2 mb-4 text-sm">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                {params.search && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    Search: {params.search}
                  </span>
                )}
                {activeCategory && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    {activeCategory.name}
                  </span>
                )}
                <Link
                  href="/products"
                  className="text-xs text-muted-foreground hover:text-foreground underline ml-1"
                >
                  Clear all
                </Link>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid products={result.products} />

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <Link
                    href={buildPageUrl(page - 1, params)}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Previous
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  {generatePageNumbers(page, result.totalPages).map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={buildPageUrl(p as number, params)}
                        className={cn(
                          buttonVariants({
                            variant: page === p ? "default" : "ghost",
                            size: "sm",
                          }),
                          "w-9 h-9 p-0"
                        )}
                      >
                        {p}
                      </Link>
                    )
                  )}
                </div>
                {page < result.totalPages && (
                  <Link
                    href={buildPageUrl(page + 1, params)}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPageUrl(
  page: number,
  params: { category?: string; search?: string; sort?: string }
) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  return `/products?${query.toString()}`;
}

function generatePageNumbers(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
