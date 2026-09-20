import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, computeAdminToken } from "@/lib/adminAuth";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same behavior, new name
// and default Node.js runtime). This gate protects every /admin page except
// the login page itself.
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_PASSWORD;
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!expected || !cookie || cookie !== computeAdminToken(expected)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
