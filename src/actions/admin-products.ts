"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN", "PUBLISHER"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAdminProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  published?: boolean;
}) {
  await requireAdmin();
  const { page = 1, limit = 20, search, published } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (published !== undefined) {
    where.isPublished = published;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        images: { take: 1, orderBy: { position: "asc" } },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      stock: p.stock,
      isPublished: p.isPublished,
      category: p.category.name,
      image: p.images[0]?.url || null,
      totalSales: p._count.orderItems,
      createdAt: p.createdAt,
    })),
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function createProduct(data: Record<string, unknown>, imageUrls: string[]) {
  await requireAdmin();

  const validated = productSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const slug = slugify(validated.data.name);
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug;

  const product = await prisma.product.create({
    data: {
      name: validated.data.name,
      slug: finalSlug,
      description: validated.data.description,
      shortDescription: validated.data.shortDescription || null,
      price: (validated.data.price),
      compareAtPrice: validated.data.compareAtPrice ? (validated.data.compareAtPrice) : null,
      costPrice: validated.data.costPrice ? (validated.data.costPrice) : null,
      sku: validated.data.sku || null,
      stock: validated.data.stock,
      lowStockThreshold: validated.data.lowStockThreshold,
      categoryId: validated.data.categoryId,
      isPublished: validated.data.isPublished,
      isFeatured: validated.data.isFeatured,
      requiresPrescription: validated.data.requiresPrescription,
      dosageInfo: validated.data.dosageInfo || null,
      sideEffects: validated.data.sideEffects || null,
      activeIngredients: validated.data.activeIngredients || null,
      manufacturer: validated.data.manufacturer || null,
      expiryDate: validated.data.expiryDate ? new Date(validated.data.expiryDate) : null,
      weight: validated.data.weight ? (validated.data.weight) : null,
      videoUrl: validated.data.videoUrl || null,
      images: {
        create: imageUrls.map((url, i) => ({ url, position: i })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { product };
}

export async function updateProduct(id: string, data: Record<string, unknown>, imageUrls: string[]) {
  await requireAdmin();

  const validated = productSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Delete existing images and recreate
  await prisma.productImage.deleteMany({ where: { productId: id } });

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: validated.data.name,
      description: validated.data.description,
      shortDescription: validated.data.shortDescription || null,
      price: (validated.data.price),
      compareAtPrice: validated.data.compareAtPrice ? (validated.data.compareAtPrice) : null,
      costPrice: validated.data.costPrice ? (validated.data.costPrice) : null,
      sku: validated.data.sku || null,
      stock: validated.data.stock,
      lowStockThreshold: validated.data.lowStockThreshold,
      categoryId: validated.data.categoryId,
      isPublished: validated.data.isPublished,
      isFeatured: validated.data.isFeatured,
      requiresPrescription: validated.data.requiresPrescription,
      dosageInfo: validated.data.dosageInfo || null,
      sideEffects: validated.data.sideEffects || null,
      activeIngredients: validated.data.activeIngredients || null,
      manufacturer: validated.data.manufacturer || null,
      expiryDate: validated.data.expiryDate ? new Date(validated.data.expiryDate) : null,
      weight: validated.data.weight ? (validated.data.weight) : null,
      videoUrl: validated.data.videoUrl || null,
      images: {
        create: imageUrls.map((url, i) => ({ url, position: i })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/products");
  revalidatePath("/");

  return { product };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}

export async function toggleProductPublish(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { error: "Product not found" };

  await prisma.product.update({
    where: { id },
    data: { isPublished: !product.isPublished },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}
