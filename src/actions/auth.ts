"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";

export async function register(formData: FormData) {
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();

  const rawData = {
    name: `${firstName} ${lastName}`,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    phone: formData.get("phone") as string | undefined,
  };

  const validated = registerSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, email, password, phone } = validated.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      phone: phone || null,
    },
  });

  return { success: true };
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  // Look up user role to determine redirect destination
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  // Admin/Super Admin/Publisher → dashboard, everyone else → callbackUrl (default "/")
  let redirectTo = callbackUrl;
  if (!callbackUrl || callbackUrl === "/") {
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "PUBLISHER") {
      redirectTo = "/admin/dashboard";
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }

  return { success: true, redirectTo };
}
