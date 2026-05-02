import { getPublishedProducts, getCategories } from "@/actions/products";
import { ProductGrid } from "@/components/store/product-grid";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Category Not Found" };
  return { title: category.name };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const result = await getPublishedProducts({
    page,
    limit: 12,
    categorySlug: slug,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
      </div>

      <ProductGrid products={result.products} />

      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/categories/${slug}?page=${page - 1}`} className={buttonVariants({ variant: "outline" })}>Previous</Link>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {result.currentPage} of {result.totalPages}
          </span>
          {page < result.totalPages && (
            <Link href={`/categories/${slug}?page=${page + 1}`} className={buttonVariants({ variant: "outline" })}>Next</Link>
          )}
        </div>
      )}
    </div>
  );
}
