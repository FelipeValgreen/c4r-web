import { NextRequest, NextResponse } from "next/server";
import { DEALER_SESSION_COOKIE, normalizeDealerNextPath, verifyDealerSessionToken } from "@/lib/dealer-auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isDealerPath = pathname.startsWith("/dealers");
  const isDealerLoginPath = pathname === "/dealer-login";

  if (!isDealerPath && !isDealerLoginPath) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(DEALER_SESSION_COOKIE)?.value ?? "";
  const session = sessionToken ? await verifyDealerSessionToken(sessionToken) : null;

  if (isDealerLoginPath) {
    if (session?.valid) {
      return NextResponse.redirect(new URL("/dealers", request.url));
    }

    return NextResponse.next();
  }

  if (session?.valid) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/dealer-login", request.url);
  loginUrl.searchParams.set("next", normalizeDealerNextPath(`${pathname}${search}`));

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dealers/:path*", "/dealer-login"],
};
