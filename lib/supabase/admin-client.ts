import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

declare global {
  var __c4rSupabaseAdminClient: SupabaseClient | undefined;
}

export function isSupabaseAdminReady(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_SERVICE_ROLE_KEY.length > 0;
}

export function isSupabaseBrowserAuthReady(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminReady()) {
    return null;
  }

  if (globalThis.__c4rSupabaseAdminClient) {
    return globalThis.__c4rSupabaseAdminClient;
  }

  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  globalThis.__c4rSupabaseAdminClient = client;
  return client;
}

export function getSupabasePublicConfig() {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  };
}
