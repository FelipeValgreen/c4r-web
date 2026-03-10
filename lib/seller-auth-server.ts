import "server-only";

import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export type SellerAuthUser = {
  id: string;
  email: string;
  fullName: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getBearerTokenFromRequest(request: NextRequest): string {
  const authHeader = normalizeText(request.headers.get("authorization"));
  if (/^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, "").trim();
  }

  return "";
}

export async function getSellerUserFromRequest(request: NextRequest): Promise<SellerAuthUser | null> {
  const token = getBearerTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }

  const email = normalizeText(data.user.email);
  if (!email) {
    return null;
  }

  const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    normalizeText(metadata.full_name) || normalizeText(metadata.name) || normalizeText(email.split("@")[0]);

  return {
    id: data.user.id,
    email,
    fullName,
  };
}
