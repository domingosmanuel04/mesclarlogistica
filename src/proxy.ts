import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Protected route access control
  const isAdminRoute = pathname.startsWith("/admin");
  const isProfessionalRoute =
    (pathname.startsWith("/profissional") || pathname.startsWith("/vendedor")) &&
    pathname !== "/profissional/candidatura" &&
    pathname !== "/vendedor/candidatura";
  const isAccountRoute =
    pathname === "/conta" || pathname.startsWith("/conta/");

  if (isAdminRoute || isProfessionalRoute || isAccountRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/entrar", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as string | undefined;

    if (isAdminRoute && role !== "ADMIN") {
      const forbiddenUrl = new URL("/profissional", request.url);
      forbiddenUrl.searchParams.set("error", "unauthorized_admin");
      return NextResponse.redirect(forbiddenUrl);
    }

    if (pathname === "/conta") {
      return NextResponse.redirect(new URL("/profissional", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|covers/|authors/|icons/|samples/|api/auth).*)",
  ],
};
