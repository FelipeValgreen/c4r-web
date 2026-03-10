import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "@/lib/api-guard";
import {
  applyMercadoPagoResult,
  getCheckoutForListing,
  getSellerDashboardSnapshot,
  isSellerPublishStoreReady,
} from "@/lib/seller-publish-store";
import { findMercadoPagoPaymentByExternalReference, isMercadoPagoReady } from "@/lib/mercadopago";
import { getSellerUserFromRequest } from "@/lib/seller-auth-server";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:seller:payment-status", {
    limit: 25,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse("Demasiadas solicitudes. Intenta nuevamente en un minuto.", rateLimit.retryAfterSeconds);
  }

  if (!isSellerPublishStoreReady()) {
    return NextResponse.json({ success: false, error: "Store seller no configurado." }, { status: 503 });
  }

  const user = await getSellerUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
  }

  const listingId = normalizeText(request.nextUrl.searchParams.get("listingId"));
  if (!listingId) {
    return NextResponse.json({ success: false, error: "listingId es obligatorio." }, { status: 400 });
  }

  try {
    let { listing, checkout } = await getCheckoutForListing(listingId, user.id);
    if (!listing) {
      return NextResponse.json({ success: false, error: "Publicación no encontrada." }, { status: 404 });
    }

    if (checkout && checkout.status === "pending" && checkout.externalReference && isMercadoPagoReady()) {
      const payment = await findMercadoPagoPaymentByExternalReference(checkout.externalReference);
      if (payment) {
        const updated = await applyMercadoPagoResult(payment);
        listing = updated.listing ?? listing;
        checkout = updated.checkout ?? checkout;
      }
    }

    const snapshot = await getSellerDashboardSnapshot(user.id);

    return NextResponse.json({
      success: true,
      listing,
      checkout,
      hasActiveSubscription: snapshot.hasActiveSubscription,
      activeSubscription: snapshot.activeSubscription,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo consultar estado del pago.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
