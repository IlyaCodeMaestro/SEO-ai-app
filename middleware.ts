import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("sessionId")?.value;

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboard = pathname.startsWith("/dashboard");

  if (!session && isDashboard) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/", "/login", "/register/:path*", "/dashboard/:path*"],
};
