import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { DEALER_SESSION_COOKIE } from "@/lib/dealer-auth";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(DEALER_SESSION_COOKIE);

  return NextResponse.redirect(new URL("/dealer-login?logout=1", request.url));
}
