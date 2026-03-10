import { type NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "@/lib/api-guard";
import { createLeadFromWebIntent } from "@/lib/dealers-store";
import { getMarketplaceVehicleByIdOrSlug } from "@/lib/marketplace-catalog";

type BuyRequest = {
  vehicleId?: string;
  vehicleSlug?: string;
  dealerId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  paymentMethod?: string;
  financingPreApproved?: boolean;
  tradeIn?: boolean;
};

const allowedPaymentMethods = new Set(["contado", "credito", "leasing"]);

function sanitizeText(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateReference(prefix: "BUY"): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:vehicles:buy", {
    limit: 8,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse("Demasiadas solicitudes de compra. Intenta nuevamente en un minuto.", rateLimit.retryAfterSeconds);
  }

  let body: BuyRequest;

  try {
    body = (await request.json()) as BuyRequest;
  } catch {
    return NextResponse.json({ success: false, message: "Solicitud invalida." }, { status: 400 });
  }

  const fullName = sanitizeText(body.fullName);
  const email = sanitizeText(body.email).toLowerCase();
  const phone = sanitizeText(body.phone);
  const paymentMethod = sanitizeText(body.paymentMethod).toLowerCase();
  const financingPreApproved = Boolean(body.financingPreApproved);
  const tradeIn = Boolean(body.tradeIn);

  if (!fullName || !email || !phone || !paymentMethod) {
    return NextResponse.json(
      { success: false, message: "Completa nombre, email, telefono y metodo de pago." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ success: false, message: "El correo ingresado no es valido." }, { status: 400 });
  }

  if (!allowedPaymentMethods.has(paymentMethod)) {
    return NextResponse.json({ success: false, message: "Metodo de pago no soportado." }, { status: 400 });
  }

  const vehicle = await getMarketplaceVehicleByIdOrSlug(body.vehicleId, body.vehicleSlug);

  if (!vehicle) {
    return NextResponse.json({ success: false, message: "No encontramos el vehiculo solicitado." }, { status: 404 });
  }

  const reference = generateReference("BUY");
  const dealerLead = await createLeadFromWebIntent({
    vehicleId: vehicle.id,
    vehicleTitle: vehicle.title,
    fullName,
    email,
    phone,
    source: "compra",
    dealerId: sanitizeText(body.dealerId) || vehicle.ownerDealerId || undefined,
  });

  return NextResponse.json(
    {
      success: true,
      reference,
      dealerLeadId: dealerLead.id,
      message: `Solicitud de compra enviada para ${vehicle.title}.`,
      nextStep: "Un asesor C4R te contactara para validar forma de pago, firma y fecha estimada de entrega.",
      data: {
        vehicleId: vehicle.id,
        vehicleSlug: vehicle.slug,
        fullName,
        email,
        phone,
        paymentMethod,
        financingPreApproved,
        tradeIn,
      },
    },
    { status: 201 },
  );
}
