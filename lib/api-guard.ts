import { NextRequest, NextResponse } from "next/server";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __c4rRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const rateLimitStore = globalThis.__c4rRateLimitStore ?? new Map<string, RateLimitEntry>();
globalThis.__c4rRateLimitStore = rateLimitStore;

function readTokenFromRequest(request: NextRequest): string {
  const headerToken = request.headers.get("x-c4r-admin-token")?.trim();
  if (headerToken) {
    return headerToken;
  }

  const authHeader = request.headers.get("authorization")?.trim() ?? "";
  if (/^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, "").trim();
  }

  return "";
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor) {
    return forwardedFor;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "ip:unknown";
}

export function applyRateLimit(request: NextRequest, bucket: string, options: RateLimitOptions): RateLimitResult {
  const ip = getClientIp(request);
  const now = Date.now();
  const key = `${bucket}:${ip}`;
  const previous = rateLimitStore.get(key);

  if (!previous || previous.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(options.limit - 1, 0),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (previous.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((previous.resetAt - now) / 1000)),
    };
  }

  previous.count += 1;
  rateLimitStore.set(key, previous);

  return {
    allowed: true,
    remaining: Math.max(options.limit - previous.count, 0),
    retryAfterSeconds: Math.max(1, Math.ceil((previous.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(message: string, retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export function requireAdminAccess(request: NextRequest): NextResponse | null {
  const expectedToken = process.env.C4R_ADMIN_TOKEN?.trim() ?? "";
  if (!expectedToken) {
    return NextResponse.json(
      { error: "Endpoint administrativo deshabilitado. Configura C4R_ADMIN_TOKEN." },
      { status: 403 },
    );
  }

  const providedToken = readTokenFromRequest(request);
  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return null;
}
