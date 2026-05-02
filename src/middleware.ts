import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=/admin", req.url)
      );
    }
    const role = token.role as string;
    if (!["ADMIN", "SUPER_ADMIN", "VIEWER", "PUBLISHER"].includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect /orders (user must be logged in)
  if (pathname.startsWith("/orders") && !token) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/orders", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*"],
};
