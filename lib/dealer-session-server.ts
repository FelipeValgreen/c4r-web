import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEALER_SESSION_COOKIE, verifyDealerSessionToken, type DealerSession } from "@/lib/dealer-auth";

export async function getCurrentDealerSession(): Promise<DealerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_SESSION_COOKIE)?.value ?? "";

  if (!token) {
    return null;
  }

  const session = await verifyDealerSessionToken(token);
  if (!session?.valid) {
    return null;
  }

  return session;
}

export async function requireDealerSession(): Promise<DealerSession> {
  const session = await getCurrentDealerSession();
  if (!session?.valid) {
    redirect("/dealer-login");
  }
  return session;
}

export async function isCurrentDealerAdmin(): Promise<boolean> {
  const session = await getCurrentDealerSession();
  return session?.role === "admin";
}
