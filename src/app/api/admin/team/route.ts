import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    const validRoles = ["VIEWER", "PUBLISHER", "ADMIN", "SUPER_ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await prisma.user.update({
        where: { email },
        data: { role },
      });
    } else {
      await prisma.user.create({
        data: { email, role, name: email.split("@")[0] },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Team error:", error);
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
  }
}
