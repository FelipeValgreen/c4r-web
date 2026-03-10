import { type NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "@/lib/api-guard";
import { createLeadFromWebIntent } from "@/lib/dealers-store";
import { getMarketplaceVehicleByIdOrSlug } from "@/lib/marketplace-catalog";

type ReserveRequest = {
  vehicleId?: string;
  vehicleSlug?: string;
  dealerId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  visitDate?: string;
  comments?: string;
};

function sanitizeText(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateReference(prefix: "RSV"): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:vehicles:reserve", {
    limit: 8,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse("Demasiadas solicitudes de reserva. Intenta nuevamente en un minuto.", rateLimit.retryAfterSeconds);
  }

  let body: ReserveRequest;

  try {
    body = (await request.json()) as ReserveRequest;
  } catch {
    return NextResponse.json({ success: false, message: "Solicitud invalida." }, { status: 400 });
  }

  const fullName = sanitizeText(body.fullName);
  const email = sanitizeText(body.email).toLowerCase();
  const phone = sanitizeText(body.phone);
  const visitDate = sanitizeText(body.visitDate);
  const comments = sanitizeText(body.comments);

  if (!fullName || !email || !phone || !visitDate) {
    return NextResponse.json(
      { success: false, message: "Completa nombre, email, telefono y fecha de visita." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ success: false, message: "El correo ingresado no es valido." }, { status: 400 });
  }

  const vehicle = await getMarketplaceVehicleByIdOrSlug(body.vehicleId, body.vehicleSlug);

  if (!vehicle) {
    return NextResponse.json({ success: false, message: "No encontramos el vehiculo solicitado." }, { status: 404 });
  }

  const reference = generateReference("RSV");
  const dealerLead = await createLeadFromWebIntent({
    vehicleId: vehicle.id,
    vehicleTitle: vehicle.title,
    fullName,
    email,
    phone,
    source: "reserva",
    dealerId: sanitizeText(body.dealerId) || vehicle.ownerDealerId || undefined,
  });

  return NextResponse.json(
    {
      success: true,
      reference,
      dealerLeadId: dealerLead.id,
      message: `Reserva enviada para ${vehicle.title}.`,
      nextStep: "Te contactaremos por WhatsApp y correo en menos de 2 horas habiles para confirmar la visita.",
      data: {
        vehicleId: vehicle.id,
        vehicleSlug: vehicle.slug,
        fullName,
        email,
        phone,
        visitDate,
        comments,
      },
    },
    { status: 201 },
  );
}
