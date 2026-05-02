"use server";

import { prisma } from "@/lib/prisma";

export async function getBankDetails() {
  const settings = await prisma.siteSettings.findFirst({
    select: {
      bankName: true,
      bankAccountNumber: true,
      bankAccountName: true,
    },
  });

  return {
    bankName: settings?.bankName ?? null,
    bankAccountNumber: settings?.bankAccountNumber ?? null,
    bankAccountName: settings?.bankAccountName ?? null,
  };
}
