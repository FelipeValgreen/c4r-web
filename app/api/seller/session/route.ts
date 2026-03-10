import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "@/lib/api-guard";
import { getSellerUserFromRequest } from "@/lib/seller-auth-server";
import {
  ensureSellerProfile,
  getSellerDashboardSnapshot,
  isSellerPublishStoreReady,
} from "@/lib/seller-publish-store";
import { isMercadoPagoReady, getPublicationFeeClp } from "@/lib/mercadopago";

export async function GET(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:seller:session", {
    limit: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse("Demasiadas solicitudes. Intenta nuevamente en un minuto.", rateLimit.retryAfterSeconds);
  }

  if (!isSellerPublishStoreReady()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Flujo de publicación no configurado. Define SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 503 },
    );
  }

  const user = await getSellerUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
  }

  try {
    const profile = await ensureSellerProfile(user);
    const snapshot = await getSellerDashboardSnapshot(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      profile,
      hasActiveSubscription: snapshot.hasActiveSubscription,
      activeSubscription: snapshot.activeSubscription,
      listings: snapshot.listings,
      mercadopagoEnabled: isMercadoPagoReady(),
      publicationFeeClp: getPublicationFeeClp(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la sesión del seller.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
