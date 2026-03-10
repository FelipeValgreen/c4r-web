import { NextRequest, NextResponse } from "next/server";
import { DEALER_SESSION_COOKIE, normalizeDealerNextPath } from "@/lib/dealer-auth";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isDealerPath = pathname.startsWith("/dealers");
  const isDealerLoginPath = pathname === "/dealer-login";

  if (!isDealerPath && !isDealerLoginPath) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(DEALER_SESSION_COOKIE)?.value ?? "";
  const hasSessionCookie = sessionToken.trim().length > 0;

  if (isDealerLoginPath) {
    // Mantener /dealer-login siempre disponible evita loops por discrepancias
    // de runtime; la validacion fuerte se hace dentro de las rutas /dealers.
    return NextResponse.next();
  }

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/dealer-login", request.url);
  loginUrl.searchParams.set("next", normalizeDealerNextPath(`${pathname}${search}`));

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dealers/:path*", "/dealer-login"],
};
