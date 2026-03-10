import { type NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse, requireAdminAccess } from "@/lib/api-guard";

type ContactReason =
  | "soporte"
  | "compra"
  | "venta"
  | "dealers"
  | "financiamiento"
  | "otro";

type ContactInput = {
  name?: string;
  email?: string;
  phone?: string;
  reason?: ContactReason;
  message?: string;
  consent?: boolean;
};

type ContactSubmission = {
  ticketId: string;
  name: string;
  email: string;
  phone: string;
  reason: ContactReason;
  message: string;
  consent: boolean;
  createdAt: string;
};

const submissions: ContactSubmission[] = [];

function normalizeText(value?: string): string {
  return (value ?? "").trim();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidReason(value: string): value is ContactReason {
  return ["soporte", "compra", "venta", "dealers", "financiamiento", "otro"].includes(value);
}

function isValidPhone(value: string): boolean {
  if (!value) {
    return true;
  }

  const digits = value.replace(/[^0-9]/g, "");
  return digits.length >= 8 && digits.length <= 12;
}

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:contact", {
    limit: 6,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse("Demasiados intentos de contacto. Intenta nuevamente en un minuto.", rateLimit.retryAfterSeconds);
  }

  try {
    const body = (await request.json()) as ContactInput;

    const name = normalizeText(body.name);
    const email = normalizeText(body.email).toLowerCase();
    const phone = normalizeText(body.phone);
    const reason = normalizeText(body.reason);
    const message = normalizeText(body.message);
    const consent = Boolean(body.consent);

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Nombre invalido." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalido." }, { status: 400 });
    }

    if (!isValidReason(reason)) {
      return NextResponse.json({ error: "Motivo invalido." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Telefono invalido." }, { status: 400 });
    }

    if (!message || message.length < 20) {
      return NextResponse.json({ error: "El mensaje debe tener al menos 20 caracteres." }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ error: "Debes aceptar ser contactado por C4R." }, { status: 400 });
    }

    const submission: ContactSubmission = {
      ticketId: `C4R-${Date.now().toString().slice(-7)}`,
      name,
      email,
      phone,
      reason,
      message,
      consent,
      createdAt: new Date().toISOString(),
    };

    submissions.unshift(submission);

    return NextResponse.json(
      {
        message: "Mensaje enviado correctamente. Te responderemos dentro de 24 horas habiles.",
        ticketId: submission.ticketId,
        createdAt: submission.createdAt,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminAccess(request);
  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json({
    count: submissions.length,
    submissions: submissions.slice(0, 20),
  });
}
