import { z } from "zod";

export const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  tagline: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
