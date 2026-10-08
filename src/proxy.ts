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
    const secret =
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "mesclar-logistica-secret-key-prod-2026-minimum-32-bytes";

    const isSecure =
      request.url.startsWith("https://") ||
      request.headers.get("x-forwarded-proto") === "https" ||
      request.headers.get("x-forwarded-ssl") === "on";

    let token = await getToken({
      req: request,
      secret,
      secureCookie: isSecure,
    });

    if (!token) {
      token = await getToken({
        req: request,
        secret,
        secureCookie: !isSecure,
      });
    }

    if (!token) {
      token = await getToken({
        req: request,
        secret,
        cookieName: "authjs.session-token",
        salt: "authjs.session-token",
      });
    }

    if (!token) {
      token = await getToken({
        req: request,
        secret,
        cookieName: "__Secure-authjs.session-token",
        salt: "__Secure-authjs.session-token",
      });
    }

    if (!token) {
      token = await getToken({
        req: request,
        secret,
        cookieName: "next-auth.session-token",
        salt: "next-auth.session-token",
      });
    }

    if (!token) {
      token = await getToken({
        req: request,
        secret,
        cookieName: "__Secure-next-auth.session-token",
        salt: "__Secure-next-auth.session-token",
      });
    }

    // Direct cookie check fallback in case JWT parsing fails or cookie prefix is overridden by proxy
    const hasSessionCookie =
      request.cookies.has("authjs.session-token") ||
      request.cookies.has("__Secure-authjs.session-token") ||
      request.cookies.has("next-auth.session-token") ||
      request.cookies.has("__Secure-next-auth.session-token");

    if (!token && !hasSessionCookie) {
      const loginUrl = new URL("/entrar", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (token?.role as string | undefined) || "SELLER";

    if (isAdminRoute && role !== "ADMIN" && token) {
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
