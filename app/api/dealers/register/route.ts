import { type NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse, requireAdminAccess } from "@/lib/api-guard";
import { registerDealer, getDealerSnapshot } from "@/lib/dealers-store";

export const dynamic = "force-dynamic";

type DealerRegistrationInput = {
  companyName?: string;
  companyRut?: string;
  email?: string;
  phone?: string;
  address?: string;
  portalUsername?: string;
  portalPassword?: string;
};

function normalizeText(value?: string): string {
  return (value ?? "").trim();
}

function normalizeRut(value: string): string {
  return value.replace(/[^0-9Kk.-]/g, "").toUpperCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidRut(value: string): boolean {
  return /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9K]$/.test(value);
}

function isValidPhone(value: string): boolean {
  const normalized = value.replace(/[^0-9]/g, "");
  return normalized.length >= 8 && normalized.length <= 12;
}

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:dealers:register", {
    limit: 5,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse(
      "Demasiadas solicitudes de registro dealer. Intenta nuevamente en un minuto.",
      rateLimit.retryAfterSeconds,
    );
  }

  try {
    const body = (await request.json()) as DealerRegistrationInput;

    const companyName = normalizeText(body.companyName);
    const companyRut = normalizeRut(normalizeText(body.companyRut));
    const email = normalizeText(body.email).toLowerCase();
    const phone = normalizeText(body.phone);
    const address = normalizeText(body.address);
    const portalUsername = normalizeText(body.portalUsername).toLowerCase();
    const portalPassword = normalizeText(body.portalPassword);

    if (!companyName || companyName.length < 3) {
      return NextResponse.json({ error: "Nombre de empresa invalido." }, { status: 400 });
    }

    if (!isValidRut(companyRut)) {
      return NextResponse.json({ error: "RUT invalido. Usa formato 12.345.678-9." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalido." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Telefono invalido." }, { status: 400 });
    }

    if (!address || address.length < 6) {
      return NextResponse.json({ error: "Direccion invalida." }, { status: 400 });
    }

    if (!isValidEmail(portalUsername)) {
      return NextResponse.json({ error: "Usuario de acceso invalido." }, { status: 400 });
    }

    if (!portalPassword || portalPassword.length < 8) {
      return NextResponse.json({ error: "Contrasena invalida. Usa al menos 8 caracteres." }, { status: 400 });
    }

    const registration = await registerDealer({
      companyName,
      companyRut,
      email,
      phone,
      address,
      portalUsername,
      portalPassword,
    });

    return NextResponse.json(
      {
        message: "Dealer creado y habilitado correctamente.",
        registrationId: registration.id,
        portalUsername: registration.portalUsername,
        createdAt: registration.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor.";
    const status = message.includes("Ya existe") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminAccess(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const snapshot = await getDealerSnapshot();
    return NextResponse.json({
      count: snapshot.registrations.length,
      registrations: snapshot.registrations.slice(0, 50),
    });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
