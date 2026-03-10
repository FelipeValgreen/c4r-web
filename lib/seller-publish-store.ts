import "server-only";

import { getSupabaseAdminClient, isSupabaseAdminReady } from "@/lib/supabase/admin-client";
import type { SellerAuthUser } from "@/lib/seller-auth-server";
import type { MercadoPagoPaymentSnapshot } from "@/lib/mercadopago";

const SELLER_PROFILES_TABLE = (process.env.SELLER_PROFILES_TABLE ?? "seller_profiles").trim();
const SELLER_SUBSCRIPTIONS_TABLE = (process.env.SELLER_SUBSCRIPTIONS_TABLE ?? "seller_subscriptions").trim();
const SELLER_LISTINGS_TABLE = (process.env.SELLER_LISTINGS_TABLE ?? "seller_vehicle_listings").trim();
const SELLER_CHECKOUTS_TABLE = (process.env.SELLER_CHECKOUTS_TABLE ?? "seller_checkout_sessions").trim();

const SELLER_SUBSCRIPTION_DAYS = Math.max(1, Number(process.env.C4R_SELLER_SUBSCRIPTION_DAYS ?? "30") || 30);
const SELLER_SUBSCRIPTION_PLAN_CODE = (process.env.C4R_SELLER_SUBSCRIPTION_PLAN_CODE ?? "publicador_mensual").trim();

export type SellerListingStatus = "draft" | "pending_payment" | "published" | "archived";
export type SellerCheckoutStatus = "pending" | "approved" | "rejected" | "cancelled" | "expired";

export type SellerProfile = {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  createdAt: string;
  updatedAt: string;
};

export type SellerSubscription = {
  id: string;
  userId: string;
  planCode: string;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
  mercadopagoPaymentId: string | null;
  mercadopagoPreferenceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerListing = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  priceClp: number;
  bodyStyle: string;
  fuelType: string;
  transmission: string;
  location: string;
  description: string;
  coverImage: string;
  gallery: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: SellerListingStatus;
  paymentRequired: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerCheckoutSession = {
  id: string;
  userId: string;
  listingId: string;
  status: SellerCheckoutStatus;
  amountClp: number;
  currency: string;
  externalReference: string;
  mercadopagoPreferenceId: string | null;
  mercadopagoPaymentId: string | null;
  mercadopagoInitPoint: string | null;
  statusDetail: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerDashboardSnapshot = {
  profile: SellerProfile | null;
  activeSubscription: SellerSubscription | null;
  hasActiveSubscription: boolean;
  listings: SellerListing[];
};

export type PublishedSellerListing = {
  id: string;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  priceClp: number;
  bodyStyle: string;
  fuelType: string;
  transmission: string;
  location: string;
  description: string;
  coverImage: string;
  gallery: string[];
  contactName: string;
  createdAt: string;
  publishedAt: string | null;
};

type ListingDraftInput = {
  make: string;
  model: string;
  year: number;
  mileage: number;
  priceClp: number;
  bodyStyle: string;
  fuelType: string;
  transmission: string;
  location: string;
  description: string;
  coverImage: string;
  gallery: string[];
  contactName: string;
  contactPhone: string;
};

type CheckoutCreateInput = {
  userId: string;
  listingId: string;
  amountClp: number;
  externalReference: string;
  mercadopagoPreferenceId: string;
  mercadopagoInitPoint: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toIso(value: unknown): string {
  const normalized = normalizeText(value);
  return normalized || new Date().toISOString();
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value: string): string {
  return (
    normalizeText(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `publicacion-${Date.now().toString(36)}`
  );
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeText(entry))
    .filter(Boolean)
    .filter((entry, index, source) => source.indexOf(entry) === index);
}

function isPublishedStatus(status: string): status is SellerListingStatus {
  return status === "published" || status === "pending_payment" || status === "draft" || status === "archived";
}

function mapProfile(row: Record<string, unknown>): SellerProfile {
  return {
    userId: normalizeText(row.user_id),
    email: normalizeText(row.email),
    fullName: normalizeText(row.full_name),
    phone: normalizeText(row.phone),
    city: normalizeText(row.city),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapSubscription(row: Record<string, unknown>): SellerSubscription {
  return {
    id: normalizeText(row.id),
    userId: normalizeText(row.user_id),
    planCode: normalizeText(row.plan_code),
    status: normalizeText(row.status),
    startsAt: normalizeText(row.starts_at) || null,
    expiresAt: normalizeText(row.expires_at) || null,
    mercadopagoPaymentId: normalizeText(row.mercadopago_payment_id) || null,
    mercadopagoPreferenceId: normalizeText(row.mercadopago_preference_id) || null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapListing(row: Record<string, unknown>): SellerListing {
  const status = normalizeText(row.status);

  return {
    id: normalizeText(row.id),
    userId: normalizeText(row.user_id),
    slug: normalizeText(row.slug),
    title: normalizeText(row.title),
    make: normalizeText(row.make),
    model: normalizeText(row.model),
    year: toNumber(row.year),
    mileage: toNumber(row.mileage),
    priceClp: toNumber(row.price_clp),
    bodyStyle: normalizeText(row.body_style),
    fuelType: normalizeText(row.fuel_type),
    transmission: normalizeText(row.transmission),
    location: normalizeText(row.location),
    description: normalizeText(row.description),
    coverImage: normalizeText(row.cover_image),
    gallery: asStringArray(row.gallery),
    contactName: normalizeText(row.contact_name),
    contactEmail: normalizeText(row.contact_email),
    contactPhone: normalizeText(row.contact_phone),
    status: isPublishedStatus(status) ? status : "draft",
    paymentRequired: Boolean(row.payment_required),
    publishedAt: normalizeText(row.published_at) || null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapCheckout(row: Record<string, unknown>): SellerCheckoutSession {
  const normalizedStatus = normalizeText(row.status).toLowerCase();
  const status: SellerCheckoutStatus =
    normalizedStatus === "approved" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "expired"
      ? normalizedStatus
      : "pending";

  return {
    id: normalizeText(row.id),
    userId: normalizeText(row.user_id),
    listingId: normalizeText(row.listing_id),
    status,
    amountClp: toNumber(row.amount_clp),
    currency: normalizeText(row.currency) || "CLP",
    externalReference: normalizeText(row.external_reference),
    mercadopagoPreferenceId: normalizeText(row.mercadopago_preference_id) || null,
    mercadopagoPaymentId: normalizeText(row.mercadopago_payment_id) || null,
    mercadopagoInitPoint: normalizeText(row.mercadopago_init_point) || null,
    statusDetail: normalizeText(row.status_detail) || null,
    paidAt: normalizeText(row.paid_at) || null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function isActiveSubscription(subscription: SellerSubscription | null): boolean {
  if (!subscription || subscription.status.toLowerCase() !== "active") {
    return false;
  }

  if (!subscription.expiresAt) {
    return true;
  }

  return new Date(subscription.expiresAt).getTime() > Date.now();
}

function buildListingTitle(make: string, model: string, year: number): string {
  return `${normalizeText(make)} ${normalizeText(model)} ${year}`.trim();
}

function assertStoreReady() {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase admin no configurado para flujo de publicación.");
  }
  return client;
}

export function isSellerPublishStoreReady(): boolean {
  return isSupabaseAdminReady();
}

export function mapMercadoPagoStatusToCheckoutStatus(status: string): SellerCheckoutStatus {
  const normalized = normalizeText(status).toLowerCase();

  if (normalized === "approved") {
    return "approved";
  }

  if (normalized === "rejected") {
    return "rejected";
  }

  if (normalized === "cancelled" || normalized === "cancelled_by_user" || normalized === "refunded") {
    return "cancelled";
  }

  if (normalized === "expired") {
    return "expired";
  }

  return "pending";
}

export async function ensureSellerProfile(user: SellerAuthUser): Promise<SellerProfile> {
  const client = assertStoreReady();
  const payload = {
    user_id: user.id,
    email: user.email,
    full_name: user.fullName,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from(SELLER_PROFILES_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo guardar el perfil seller: ${error?.message ?? "error desconocido"}`);
  }

  return mapProfile(data as Record<string, unknown>);
}

async function getCurrentActiveSubscription(userId: string): Promise<SellerSubscription | null> {
  const client = assertStoreReady();
  const { data, error } = await client
    .from(SELLER_SUBSCRIPTIONS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`No se pudo consultar la suscripción seller: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    return null;
  }

  const mapped = mapSubscription(row as Record<string, unknown>);
  return isActiveSubscription(mapped) ? mapped : null;
}

export async function getSellerDashboardSnapshot(userId: string): Promise<SellerDashboardSnapshot> {
  const client = assertStoreReady();

  const [profileResponse, listingsResponse, subscription] = await Promise.all([
    client.from(SELLER_PROFILES_TABLE).select("*").eq("user_id", userId).maybeSingle(),
    client.from(SELLER_LISTINGS_TABLE).select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    getCurrentActiveSubscription(userId),
  ]);

  if (profileResponse.error) {
    throw new Error(`No se pudo consultar el perfil seller: ${profileResponse.error.message}`);
  }

  if (listingsResponse.error) {
    throw new Error(`No se pudo consultar las publicaciones seller: ${listingsResponse.error.message}`);
  }

  return {
    profile: profileResponse.data ? mapProfile(profileResponse.data as Record<string, unknown>) : null,
    activeSubscription: subscription,
    hasActiveSubscription: isActiveSubscription(subscription),
    listings: (listingsResponse.data ?? []).map((row) => mapListing(row as Record<string, unknown>)),
  };
}

export async function createSellerListingDraft(user: SellerAuthUser, input: ListingDraftInput): Promise<SellerListing> {
  const client = assertStoreReady();
  const nowIso = new Date().toISOString();
  const title = buildListingTitle(input.make, input.model, input.year);
  const baseSlug = slugify(`${input.make}-${input.model}-${input.year}-${Date.now().toString(36)}`);

  const payload = {
    user_id: user.id,
    slug: baseSlug,
    title,
    make: normalizeText(input.make),
    model: normalizeText(input.model),
    year: input.year,
    mileage: input.mileage,
    price_clp: input.priceClp,
    body_style: normalizeText(input.bodyStyle),
    fuel_type: normalizeText(input.fuelType),
    transmission: normalizeText(input.transmission),
    location: normalizeText(input.location),
    description: normalizeText(input.description),
    cover_image: normalizeText(input.coverImage),
    gallery: input.gallery,
    contact_name: normalizeText(input.contactName),
    contact_email: user.email,
    contact_phone: normalizeText(input.contactPhone),
    status: "draft",
    payment_required: true,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data, error } = await client.from(SELLER_LISTINGS_TABLE).insert(payload).select("*").single();

  if (error || !data) {
    throw new Error(`No se pudo crear la publicación: ${error?.message ?? "error desconocido"}`);
  }

  return mapListing(data as Record<string, unknown>);
}

export async function markListingPublished(listingId: string, userId: string): Promise<SellerListing> {
  const client = assertStoreReady();
  const nowIso = new Date().toISOString();
  const { data, error } = await client
    .from(SELLER_LISTINGS_TABLE)
    .update({
      status: "published",
      payment_required: false,
      published_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", listingId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo publicar el vehículo: ${error?.message ?? "error desconocido"}`);
  }

  return mapListing(data as Record<string, unknown>);
}

export async function markListingPendingPayment(listingId: string, userId: string): Promise<SellerListing> {
  const client = assertStoreReady();
  const { data, error } = await client
    .from(SELLER_LISTINGS_TABLE)
    .update({
      status: "pending_payment",
      payment_required: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo actualizar estado de pago de publicación: ${error?.message ?? "error desconocido"}`);
  }

  return mapListing(data as Record<string, unknown>);
}

export async function createCheckoutSession(input: CheckoutCreateInput): Promise<SellerCheckoutSession> {
  const client = assertStoreReady();
  const nowIso = new Date().toISOString();

  const { data, error } = await client
    .from(SELLER_CHECKOUTS_TABLE)
    .insert({
      user_id: input.userId,
      listing_id: input.listingId,
      status: "pending",
      amount_clp: input.amountClp,
      currency: "CLP",
      external_reference: input.externalReference,
      mercadopago_preference_id: input.mercadopagoPreferenceId,
      mercadopago_init_point: input.mercadopagoInitPoint,
      created_at: nowIso,
      updated_at: nowIso,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo crear checkout de Mercado Pago: ${error?.message ?? "error desconocido"}`);
  }

  return mapCheckout(data as Record<string, unknown>);
}

export async function getCheckoutForListing(
  listingId: string,
  userId: string,
): Promise<{ listing: SellerListing | null; checkout: SellerCheckoutSession | null }> {
  const client = assertStoreReady();

  const [listingResponse, checkoutResponse] = await Promise.all([
    client.from(SELLER_LISTINGS_TABLE).select("*").eq("id", listingId).eq("user_id", userId).maybeSingle(),
    client
      .from(SELLER_CHECKOUTS_TABLE)
      .select("*")
      .eq("listing_id", listingId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (listingResponse.error) {
    throw new Error(`No se pudo consultar la publicación: ${listingResponse.error.message}`);
  }

  if (checkoutResponse.error) {
    throw new Error(`No se pudo consultar el checkout de la publicación: ${checkoutResponse.error.message}`);
  }

  const listing = listingResponse.data ? mapListing(listingResponse.data as Record<string, unknown>) : null;
  const checkoutRow = Array.isArray(checkoutResponse.data) ? checkoutResponse.data[0] : null;
  const checkout = checkoutRow ? mapCheckout(checkoutRow as Record<string, unknown>) : null;

  return { listing, checkout };
}

export async function getCheckoutByExternalReference(externalReference: string): Promise<SellerCheckoutSession | null> {
  const client = assertStoreReady();
  const { data, error } = await client
    .from(SELLER_CHECKOUTS_TABLE)
    .select("*")
    .eq("external_reference", externalReference)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`No se pudo consultar checkout por referencia: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : null;
  return row ? mapCheckout(row as Record<string, unknown>) : null;
}

export async function activateSellerSubscription(userId: string, payment: MercadoPagoPaymentSnapshot): Promise<void> {
  const client = assertStoreReady();
  const now = new Date();
  const startsAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + SELLER_SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await client.from(SELLER_SUBSCRIPTIONS_TABLE).insert({
    user_id: userId,
    plan_code: SELLER_SUBSCRIPTION_PLAN_CODE,
    status: "active",
    starts_at: startsAt,
    expires_at: expiresAt,
    mercadopago_payment_id: payment.id,
    mercadopago_preference_id: payment.preferenceId || null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  if (error) {
    throw new Error(`No se pudo activar suscripción del seller: ${error.message}`);
  }
}

export async function applyMercadoPagoResult(payment: MercadoPagoPaymentSnapshot): Promise<{
  checkout: SellerCheckoutSession | null;
  listing: SellerListing | null;
}> {
  if (!payment.externalReference) {
    return { checkout: null, listing: null };
  }

  const client = assertStoreReady();
  const checkout = await getCheckoutByExternalReference(payment.externalReference);
  if (!checkout) {
    return { checkout: null, listing: null };
  }

  const status = mapMercadoPagoStatusToCheckoutStatus(payment.status);
  const nowIso = new Date().toISOString();

  const checkoutUpdate = {
    status,
    status_detail: normalizeText(payment.statusDetail),
    mercadopago_payment_id: payment.id,
    paid_at: status === "approved" ? nowIso : null,
    updated_at: nowIso,
  };

  const { data: checkoutData, error: checkoutError } = await client
    .from(SELLER_CHECKOUTS_TABLE)
    .update(checkoutUpdate)
    .eq("id", checkout.id)
    .select("*")
    .single();

  if (checkoutError || !checkoutData) {
    throw new Error(`No se pudo actualizar checkout MP: ${checkoutError?.message ?? "error desconocido"}`);
  }

  const mappedCheckout = mapCheckout(checkoutData as Record<string, unknown>);

  if (status === "approved") {
    const listing = await markListingPublished(checkout.listingId, checkout.userId);
    await activateSellerSubscription(checkout.userId, payment);
    return {
      checkout: mappedCheckout,
      listing,
    };
  }

  if (status === "rejected" || status === "cancelled" || status === "expired") {
    const { data: listingData, error: listingError } = await client
      .from(SELLER_LISTINGS_TABLE)
      .update({
        status: "draft",
        payment_required: true,
        updated_at: nowIso,
      })
      .eq("id", checkout.listingId)
      .eq("user_id", checkout.userId)
      .select("*")
      .single();

    if (listingError || !listingData) {
      throw new Error(`No se pudo actualizar publicación tras pago fallido: ${listingError?.message ?? "error desconocido"}`);
    }

    return {
      checkout: mappedCheckout,
      listing: mapListing(listingData as Record<string, unknown>),
    };
  }

  const { data: pendingListingData, error: pendingListingError } = await client
    .from(SELLER_LISTINGS_TABLE)
    .update({
      status: "pending_payment",
      payment_required: true,
      updated_at: nowIso,
    })
    .eq("id", checkout.listingId)
    .eq("user_id", checkout.userId)
    .select("*")
    .single();

  if (pendingListingError || !pendingListingData) {
    throw new Error(
      `No se pudo actualizar publicación en estado pendiente: ${pendingListingError?.message ?? "error desconocido"}`,
    );
  }

  return {
    checkout: mappedCheckout,
    listing: mapListing(pendingListingData as Record<string, unknown>),
  };
}

export async function listPublishedSellerListings(limit = 100): Promise<PublishedSellerListing[]> {
  if (!isSellerPublishStoreReady()) {
    return [];
  }

  const client = assertStoreReady();
  const { data, error } = await client
    .from(SELLER_LISTINGS_TABLE)
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 500)));

  if (error) {
    return [];
  }

  return (data ?? []).map((row) => {
    const listing = mapListing(row as Record<string, unknown>);
    return {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      mileage: listing.mileage,
      priceClp: listing.priceClp,
      bodyStyle: listing.bodyStyle,
      fuelType: listing.fuelType,
      transmission: listing.transmission,
      location: listing.location,
      description: listing.description,
      coverImage: listing.coverImage,
      gallery: listing.gallery,
      contactName: listing.contactName,
      createdAt: listing.createdAt,
      publishedAt: listing.publishedAt,
    };
  });
}
