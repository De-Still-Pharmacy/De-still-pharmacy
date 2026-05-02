import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  costPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  categoryId: z.string().min(1, "Category is required"),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  requiresPrescription: z.boolean().default(false),
  dosageInfo: z.string().optional().nullable(),
  sideEffects: z.string().optional().nullable(),
  activeIngredients: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  weight: z.coerce.number().positive().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
