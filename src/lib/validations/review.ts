import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  productId: z.string(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
