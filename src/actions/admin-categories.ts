"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN", "PUBLISHER"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  image?: string;
}) {
  await requireAdmin();

  const slug = slugify(data.name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { error: "A category with this name already exists" };
  }

  await prisma.category.create({
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      image: data.image || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    description?: string;
    image?: string;
  }
) {
  await requireAdmin();

  const slug = slugify(data.name);

  const existing = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) {
    return { error: "A category with this name already exists" };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      image: data.image || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    return { error: "Category not found" };
  }

  if (category._count.products > 0) {
    return { error: `Cannot delete: ${category._count.products} products are in this category` };
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}
