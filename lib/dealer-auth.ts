export const DEALER_SESSION_COOKIE = "c4r_dealer_session";
export const DEFAULT_DEALER_SESSION_ID = "DLR-C4R-DEMO";

const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

export type DealerSessionRole = "admin" | "dealer";

export type DealerSession = {
  valid: boolean;
  username: string;
  dealerId: string;
  role: DealerSessionRole;
  expiresAt: number;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function getAuthConfig() {
  return {
    username: normalizeText(process.env.DEALERS_PORTAL_USER) || "admin@c4r.cl",
    password: normalizeText(process.env.DEALERS_PORTAL_PASSWORD) || "C4RDealers2026!",
    secret: normalizeText(process.env.DEALERS_PORTAL_SECRET) || "c4r-dealers-session-secret",
  };
}

function toBase64Url(value: Uint8Array): string {
  const binary = Array.from(value, (byte) => String.fromCharCode(byte)).join("");
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : typeof Buffer !== "undefined"
        ? Buffer.from(value).toString("base64")
        : "";

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  try {
    if (typeof atob === "function") {
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }

    return null;
  } catch {
    return null;
  }
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

function safeCompare(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

function normalizeSessionUsername(username: string): string {
  return normalizeText(username).toLowerCase();
}

function normalizeSessionDealerId(dealerId: string): string {
  const normalized = normalizeText(dealerId);
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(normalized)) {
    return DEFAULT_DEALER_SESSION_ID;
  }
  return normalized;
}

function normalizeSessionRole(role: string): DealerSessionRole {
  return role === "admin" ? "admin" : "dealer";
}

export async function isDealerCredentialsValid(username: string, password: string): Promise<boolean> {
  const config = getAuthConfig();
  const normalizedUser = normalizeSessionUsername(username);
  const normalizedExpectedUser = normalizeSessionUsername(config.username);

  return safeCompare(normalizedUser, normalizedExpectedUser) && safeCompare(normalizeText(password), config.password);
}

type CreateDealerSessionTokenInput = {
  username: string;
  dealerId?: string;
  role?: DealerSessionRole;
};

export async function createDealerSessionToken(
  input: CreateDealerSessionTokenInput,
): Promise<{ token: string; expiresAt: number }> {
  const config = getAuthConfig();
  const sessionUser = normalizeSessionUsername(input.username);
  const sessionDealerId = normalizeSessionDealerId(input.dealerId ?? DEFAULT_DEALER_SESSION_ID);
  const sessionRole = normalizeSessionRole(input.role ?? "dealer");
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = `${sessionUser}|${sessionDealerId}|${sessionRole}|${expiresAt}`;
  const signature = await signPayload(payload, config.secret);
  const token = toBase64Url(encoder.encode(`${payload}|${signature}`));

  return { token, expiresAt };
}

export async function verifyDealerSessionToken(token: string): Promise<DealerSession | null> {
  const config = getAuthConfig();
  const raw = fromBase64Url(normalizeText(token));

  if (!raw) {
    return null;
  }

  const parts = raw.split("|");
  if (parts.length !== 3 && parts.length !== 5) {
    return null;
  }

  const username = normalizeSessionUsername(parts[0] ?? "");
  const dealerId = parts.length === 5 ? normalizeSessionDealerId(parts[1] ?? "") : DEFAULT_DEALER_SESSION_ID;
  const role = parts.length === 5 ? normalizeSessionRole(parts[2] ?? "") : "dealer";
  const expiresAt = Number(parts.length === 5 ? parts[3] ?? "0" : parts[1] ?? "0");
  const signature = normalizeText(parts.length === 5 ? parts[4] : parts[2]);

  if (!username || !dealerId || !Number.isFinite(expiresAt) || expiresAt <= Date.now() || !signature) {
    return null;
  }

  const payload =
    parts.length === 5 ? `${username}|${dealerId}|${role}|${expiresAt}` : `${username}|${expiresAt}`;
  const expectedSignature = await signPayload(payload, config.secret);

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  return {
    valid: true,
    username,
    dealerId,
    role,
    expiresAt,
  };
}

export function getDealerSessionMaxAgeSeconds(): number {
  return SESSION_DURATION_SECONDS;
}

export function normalizeDealerNextPath(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized.startsWith("/")) {
    return "/dealers";
  }

  if (!normalized.startsWith("/dealers")) {
    return "/dealers";
  }

  return normalized;
}
