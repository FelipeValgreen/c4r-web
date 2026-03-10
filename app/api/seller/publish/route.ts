import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "@/lib/api-guard";
import { createPublicationPreference, getPublicationFeeClp, isMercadoPagoReady } from "@/lib/mercadopago";
import { getSellerUserFromRequest } from "@/lib/seller-auth-server";
import {
  createCheckoutSession,
  createSellerListingDraft,
  ensureSellerProfile,
  getSellerDashboardSnapshot,
  isSellerPublishStoreReady,
  markListingPendingPayment,
  markListingPublished,
} from "@/lib/seller-publish-store";

type PublishRequest = {
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  priceClp?: number;
  bodyStyle?: string;
  fuelType?: string;
  transmission?: string;
  location?: string;
  description?: string;
  coverImage?: string;
  gallery?: string[];
  contactName?: string;
  contactPhone?: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeInt(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.floor(parsed);
}

function sanitizeGallery(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .filter((item, index, source) => source.indexOf(item) === index)
    .slice(0, 20);
}

function resolveCoverImage(coverImage: string, gallery: string[]): string {
  if (coverImage) {
    return coverImage;
  }

  if (gallery.length > 0) {
    return gallery[0] ?? "/car-placeholder.svg";
  }

  return "/car-placeholder.svg";
}

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api:seller:publish", {
    limit: 8,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse("Demasiadas solicitudes de publicación. Intenta nuevamente en un minuto.", rateLimit.retryAfterSeconds);
  }

  if (!isSellerPublishStoreReady()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Flujo de publicación no configurado. Define variables Supabase (URL, anon key y service role key).",
      },
      { status: 503 },
    );
  }

  const user = await getSellerUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
  }

  let body: PublishRequest;

  try {
    body = (await request.json()) as PublishRequest;
  } catch {
    return NextResponse.json({ success: false, error: "Payload inválido." }, { status: 400 });
  }

  const make = normalizeText(body.make);
  const model = normalizeText(body.model);
  const year = normalizeInt(body.year);
  const mileage = Math.max(0, normalizeInt(body.mileage));
  const priceClp = Math.max(1, normalizeInt(body.priceClp));
  const bodyStyle = normalizeText(body.bodyStyle) || "Automovil";
  const fuelType = normalizeText(body.fuelType) || "Bencina";
  const transmission = normalizeText(body.transmission) || "Manual";
  const location = normalizeText(body.location);
  const description = normalizeText(body.description);
  const contactName = normalizeText(body.contactName) || user.fullName;
  const contactPhone = normalizeText(body.contactPhone);
  const gallery = sanitizeGallery(body.gallery);
  const coverImage = resolveCoverImage(normalizeText(body.coverImage), gallery);

  if (!make || !model || !year || !location || !description || !contactName || !contactPhone) {
    return NextResponse.json(
      {
        success: false,
        error: "Completa marca, modelo, año, ubicación, descripción, nombre de contacto y teléfono.",
      },
      { status: 400 },
    );
  }

  if (year < 1950 || year > new Date().getFullYear() + 1) {
    return NextResponse.json({ success: false, error: "Año del vehículo inválido." }, { status: 400 });
  }

  try {
    await ensureSellerProfile(user);
    const snapshot = await getSellerDashboardSnapshot(user.id);

    const listingDraft = await createSellerListingDraft(user, {
      make,
      model,
      year,
      mileage,
      priceClp,
      bodyStyle,
      fuelType,
      transmission,
      location,
      description,
      coverImage,
      gallery,
      contactName,
      contactPhone,
    });

    if (snapshot.hasActiveSubscription) {
      const publishedListing = await markListingPublished(listingDraft.id, user.id);
      return NextResponse.json({
        success: true,
        status: "published",
        message: "Publicación creada y publicada. Tu suscripción activa cubrió el costo.",
        listing: publishedListing,
      });
    }

    if (!isMercadoPagoReady()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No se puede procesar el pago porque Mercado Pago no está configurado. Define MERCADOPAGO_ACCESS_TOKEN.",
          listing: listingDraft,
        },
        { status: 503 },
      );
    }

    const externalReference = `c4r-publish-${listingDraft.id}-${Date.now().toString(36)}`;
    const publicationFee = getPublicationFeeClp();
    const preference = await createPublicationPreference({
      title: `Publicación C4R - ${listingDraft.title}`,
      amountClp: publicationFee,
      payerEmail: user.email,
      externalReference,
      listingId: listingDraft.id,
    });

    const pendingListing = await markListingPendingPayment(listingDraft.id, user.id);

    const checkout = await createCheckoutSession({
      userId: user.id,
      listingId: listingDraft.id,
      amountClp: publicationFee,
      externalReference,
      mercadopagoPreferenceId: preference.preferenceId,
      mercadopagoInitPoint: preference.initPoint,
    });

    return NextResponse.json({
      success: true,
      status: "payment_required",
      message: "Tu auto quedó guardado. Completa el pago para publicarlo en el marketplace.",
      listing: pendingListing,
      checkout,
      checkoutUrl: preference.initPoint,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear la publicación.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
