"use server";

import { prisma } from "@/lib/prisma";

interface GetProductsParams {
  page?: number;
  limit?: number;
  categorySlug?: string;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "name";
  featured?: boolean;
}

export async function getPublishedProducts(params: GetProductsParams = {}) {
  const { page = 1, limit = 12, categorySlug, search, sortBy = "newest", featured } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    isPublished: true,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (featured) {
    where.isFeatured = true;
  }

  const orderBy: Record<string, string> = {};
  switch (sortBy) {
    case "price-asc":
      orderBy.price = "asc";
      break;
    case "price-desc":
      orderBy.price = "desc";
      break;
    case "name":
      orderBy.name = "asc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { select: { name: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const formatted = products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      stock: p.stock,
      images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
      category: p.category,
      averageRating: avgRating,
      requiresPrescription: p.requiresPrescription,
    };
  });

  return {
    products: formatted,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
    averageRating: avgRating,
    reviewCount: product.reviews.length,
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  });
}
