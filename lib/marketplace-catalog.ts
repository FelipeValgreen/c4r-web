import "server-only";

import type { C4RVehicle } from "@/lib/chileautos-vehicles";
import { c4rVehicles } from "@/lib/chileautos-vehicles";
import type { DealerStoreVehicle } from "@/lib/dealers-store";
import { getDealerNetworkSnapshot } from "@/lib/dealers-store";
import { listPublishedSellerListings, type PublishedSellerListing } from "@/lib/seller-publish-store";

export type MarketplaceVehicle = C4RVehicle & {
  ownerDealerId: string | null;
  listingSource: "catalog" | "dealer" | "seller";
  inventoryStatus: "disponible" | "reservado" | "vendido" | null;
};

const IMAGE_PLACEHOLDER = "/car-placeholder.svg";
const BLOCKED_IMAGE_KEYWORDS = ["noimage", "placeholder", "sin-foto", "notfound"];
const ALLOWED_EXTERNAL_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "chileautos.pxcrush.net",
  "latam-editorial.pxcrush.net",
  "www.fullmotor.cl",
  "www.rtautomotriz.com",
  "rtautomotriz.com",
  "res.cloudinary.com",
  "images.ctfassets.net",
  "cdn.pixabay.com",
  "i.imgur.com",
  "imgur.com",
  "lh3.googleusercontent.com",
]);

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\uFFFD/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategory(value: string): string {
  const normalized = normalizeText(value);
  return normalized || "Automovil";
}

function slugify(value: string): string {
  const base = normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return base || "vehiculo";
}

function normalizeImage(url: string): string {
  const cleaned = normalizeText(url);
  if (!cleaned) {
    return IMAGE_PLACEHOLDER;
  }

  if (cleaned.startsWith("/")) {
    return cleaned;
  }

  if (!/^https?:\/\//i.test(cleaned)) {
    return IMAGE_PLACEHOLDER;
  }

  try {
    const parsed = new URL(cleaned);
    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_EXTERNAL_IMAGE_HOSTS.has(host)) {
      return IMAGE_PLACEHOLDER;
    }
  } catch {
    return IMAGE_PLACEHOLDER;
  }

  const lowered = cleaned.toLowerCase();
  if (BLOCKED_IMAGE_KEYWORDS.some((keyword) => lowered.includes(keyword))) {
    return IMAGE_PLACEHOLDER;
  }

  return cleaned;
}

function imageFingerprint(url: string): string {
  const normalized = normalizeImage(url);

  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().toLowerCase();
  } catch {
    return normalized.toLowerCase();
  }
}

function normalizeGallery(vehicle: C4RVehicle): string[] {
  const withCover = [vehicle.coverImage, ...vehicle.gallery]
    .map((image) => normalizeImage(image))
    .filter((image, index, source) => source.indexOf(image) === index);

  if (withCover.length > 0) {
    return withCover.slice(0, 20);
  }

  return [IMAGE_PLACEHOLDER];
}

function qualityScore(vehicle: MarketplaceVehicle): number {
  let score = 0;

  if (vehicle.coverImage !== IMAGE_PLACEHOLDER) {
    score += 5;
  }

  score += Math.min(vehicle.gallery.length, 20);
  score += vehicle.description.length > 140 ? 3 : vehicle.description.length > 80 ? 2 : 0;
  score += vehicle.listingSource === "catalog" ? 0 : 2;
  score += vehicle.priceBreakdown.length > 0 ? 1 : 0;

  return score;
}

function pickPreferredVehicle(left: MarketplaceVehicle, right: MarketplaceVehicle): MarketplaceVehicle {
  const leftScore = qualityScore(left);
  const rightScore = qualityScore(right);

  if (leftScore !== rightScore) {
    return leftScore > rightScore ? left : right;
  }

  if (left.priceClp !== right.priceClp) {
    return left.priceClp < right.priceClp ? left : right;
  }

  return left.id.localeCompare(right.id, "es") <= 0 ? left : right;
}

function ensureUniqueSlugs(vehicles: MarketplaceVehicle[]): MarketplaceVehicle[] {
  const slugCounts = new Map<string, number>();

  return vehicles.map((vehicle) => {
    const baseSlug = slugify(vehicle.slug || `${vehicle.make}-${vehicle.model}-${vehicle.year}-${vehicle.id}`);
    const nextCount = (slugCounts.get(baseSlug) ?? 0) + 1;
    slugCounts.set(baseSlug, nextCount);

    if (nextCount === 1) {
      return { ...vehicle, slug: baseSlug };
    }

    return { ...vehicle, slug: `${baseSlug}-${nextCount}` };
  });
}

function dedupeVehicles(vehicles: MarketplaceVehicle[]): MarketplaceVehicle[] {
  const byId = new Map<string, MarketplaceVehicle>();

  for (const vehicle of vehicles) {
    const key = normalizeText(vehicle.id).toLowerCase();
    const current = byId.get(key);

    if (!current) {
      byId.set(key, vehicle);
      continue;
    }

    byId.set(key, pickPreferredVehicle(current, vehicle));
  }

  const byVisual = new Map<string, MarketplaceVehicle>();

  for (const vehicle of byId.values()) {
    const visualKey = [
      normalizeText(vehicle.make).toLowerCase(),
      normalizeText(vehicle.model).toLowerCase(),
      String(vehicle.year),
      String(vehicle.priceClp),
      imageFingerprint(vehicle.coverImage),
    ].join("|");

    const current = byVisual.get(visualKey);
    if (!current) {
      byVisual.set(visualKey, vehicle);
      continue;
    }

    byVisual.set(visualKey, pickPreferredVehicle(current, vehicle));
  }

  return ensureUniqueSlugs(Array.from(byVisual.values()));
}

function normalizeCatalogVehicle(vehicle: C4RVehicle): MarketplaceVehicle {
  const gallery = normalizeGallery(vehicle);
  const coverImage = gallery[0] ?? IMAGE_PLACEHOLDER;

  return {
    ...vehicle,
    slug: slugify(vehicle.slug || `${vehicle.make}-${vehicle.model}-${vehicle.year}-${vehicle.id}`),
    title: normalizeText(vehicle.title) || `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
    make: normalizeText(vehicle.make) || "Auto",
    model: normalizeText(vehicle.model) || "Modelo",
    bodyStyle: normalizeCategory(vehicle.bodyStyle),
    fuelType: normalizeText(vehicle.fuelType) || "Bencina",
    transmission: normalizeText(vehicle.transmission) || "Por confirmar",
    drive: normalizeText(vehicle.drive) || "Por confirmar",
    dealer: normalizeText(vehicle.dealer) || "Dealer C4R",
    location: normalizeText(vehicle.location) || "Santiago",
    description: normalizeText(vehicle.description) || "Vehiculo verificado por C4R.",
    highlights: vehicle.highlights
      .map((entry) => normalizeText(entry))
      .filter(Boolean)
      .slice(0, 12),
    coverImage,
    gallery,
    ownerDealerId: null,
    listingSource: "catalog",
    inventoryStatus: null,
  };
}

function parseDealerLocation(address: string): string {
  const normalized = normalizeText(address);
  if (!normalized) {
    return "Santiago";
  }

  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return parts[parts.length - 1] ?? "Santiago";
  }

  return parts[0] ?? "Santiago";
}

function inferBodyStyle(vehicle: DealerStoreVehicle): string {
  const declared = normalizeCategory(vehicle.bodyStyle ?? "");
  if (declared && declared !== "Automovil") {
    return declared;
  }

  const searchable = `${vehicle.brand} ${vehicle.model}`.toLowerCase();
  if (searchable.includes("suv")) return "SUV";
  if (searchable.includes("pickup") || searchable.includes("pick up")) return "Pick-up";
  if (searchable.includes("hatch")) return "Hatchback";
  if (searchable.includes("sedan")) return "Sedan";

  return "Automovil";
}

function mapDealerVehicle(
  vehicle: DealerStoreVehicle,
  dealerNameById: Map<string, string>,
  dealerLocationById: Map<string, string>,
): MarketplaceVehicle {
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
  const primaryImage = normalizeImage(vehicle.image);
  const gallery = [
    primaryImage,
    ...(Array.isArray(vehicle.gallery) ? vehicle.gallery : []).map((entry) => normalizeImage(entry)),
  ]
    .filter((entry, index, source) => source.indexOf(entry) === index)
    .slice(0, 20);

  const coverImage = gallery[0] ?? IMAGE_PLACEHOLDER;
  const km = Number.isFinite(vehicle.km) ? Math.max(vehicle.km, 0) : 0;
  const condition: "Nuevo" | "Usado" = vehicle.year >= new Date().getFullYear() && km <= 150 ? "Nuevo" : "Usado";
  const fuelType = normalizeText(vehicle.fuelType ?? "") || "Bencina";
  const transmission = normalizeText(vehicle.transmission ?? "") || "Por confirmar";

  return {
    id: vehicle.id,
    slug: slugify(`${vehicle.brand}-${vehicle.model}-${vehicle.year}-${vehicle.id}`),
    sourceUrl: `/dealers/solicitud/${vehicle.id}`,
    make: normalizeText(vehicle.brand),
    model: normalizeText(vehicle.model),
    year: vehicle.year,
    badge: null,
    title,
    bodyStyle: inferBodyStyle(vehicle),
    fuelType,
    transmission,
    drive: "Por confirmar",
    engine: null,
    engineCc: null,
    fuelCombined: null,
    doors: null,
    condition,
    km,
    priceClp: Math.max(1, Number(vehicle.price) || 1),
    reservationFeeClp: Math.max(200000, Math.round((vehicle.price * 0.02) / 10000) * 10000),
    estimatedMonthlyClp: Math.max(120000, Math.round((vehicle.price * 0.018) / 10000) * 10000),
    versionsAvailable: 1,
    dealer: dealerNameById.get(vehicle.dealerId) ?? "Dealer C4R",
    location: normalizeText(vehicle.location ?? "") || dealerLocationById.get(vehicle.dealerId) || "Santiago",
    coverImage,
    gallery: gallery.length > 0 ? gallery : [IMAGE_PLACEHOLDER],
    description: normalizeText(vehicle.description ?? "") || "Unidad publicada por dealer en C4R.",
    highlights: [
      `Estado comercial: ${vehicle.status}`,
      `Stock dealer ${dealerNameById.get(vehicle.dealerId) ?? "C4R"}`,
      "Publicacion omnicanal habilitada",
    ],
    priceBreakdown: [
      {
        type: "Publicacion dealer",
        amount: Math.max(1, Number(vehicle.price) || 1),
      },
    ],
    source: "Dealer C4R",
    ownerDealerId: vehicle.dealerId,
    listingSource: "dealer",
    inventoryStatus: vehicle.status,
  };
}

function mapPublishedSellerListing(listing: PublishedSellerListing): MarketplaceVehicle {
  const normalizedGallery = [listing.coverImage, ...listing.gallery]
    .map((image) => normalizeImage(image))
    .filter((image, index, source) => source.indexOf(image) === index);

  const coverImage = normalizedGallery[0] ?? IMAGE_PLACEHOLDER;
  const km = Math.max(0, Number(listing.mileage) || 0);
  const currentYear = new Date().getFullYear();
  const condition: "Nuevo" | "Usado" = listing.year >= currentYear && km <= 150 ? "Nuevo" : "Usado";
  const sellerName = normalizeText(listing.contactName) || "Particular C4R";
  const listingSlug = slugify(listing.slug || `${listing.make}-${listing.model}-${listing.year}-${listing.id}`);

  return {
    id: `SLR-${listing.id}`,
    slug: listingSlug,
    sourceUrl: `/app/explorar/${listingSlug}`,
    make: normalizeText(listing.make),
    model: normalizeText(listing.model),
    year: listing.year,
    badge: "Particular verificado C4R",
    title: normalizeText(listing.title) || `${listing.make} ${listing.model} ${listing.year}`,
    bodyStyle: normalizeCategory(listing.bodyStyle),
    fuelType: normalizeText(listing.fuelType) || "Bencina",
    transmission: normalizeText(listing.transmission) || "Por confirmar",
    drive: "Por confirmar",
    engine: null,
    engineCc: null,
    fuelCombined: null,
    doors: null,
    condition,
    km,
    priceClp: Math.max(1, Number(listing.priceClp) || 1),
    reservationFeeClp: Math.max(120000, Math.round((listing.priceClp * 0.02) / 10000) * 10000),
    estimatedMonthlyClp: Math.max(120000, Math.round((listing.priceClp * 0.018) / 10000) * 10000),
    versionsAvailable: 1,
    dealer: sellerName,
    location: normalizeText(listing.location) || "Santiago",
    coverImage,
    gallery: normalizedGallery.length > 0 ? normalizedGallery : [IMAGE_PLACEHOLDER],
    description: normalizeText(listing.description) || "Publicación particular en C4R.",
    highlights: [
      "Publicación de particular validada en C4R",
      "Contacto directo con vendedor",
      "Pago protegido disponible",
    ],
    priceBreakdown: [
      {
        type: "Publicación particular",
        amount: Math.max(1, Number(listing.priceClp) || 1),
      },
    ],
    source: "Particular C4R",
    ownerDealerId: null,
    listingSource: "seller",
    inventoryStatus: "disponible",
  };
}

export async function getMarketplaceVehicles(): Promise<MarketplaceVehicle[]> {
  const [networkSnapshot, publishedSellerListings] = await Promise.all([
    getDealerNetworkSnapshot(),
    listPublishedSellerListings(300),
  ]);

  const dealerNameById = new Map(
    networkSnapshot.registrations.map((registration) => [registration.id, normalizeText(registration.companyName)]),
  );
  const dealerLocationById = new Map(
    networkSnapshot.registrations.map((registration) => [registration.id, parseDealerLocation(registration.address)]),
  );

  const catalogVehicles = c4rVehicles.map((vehicle) => normalizeCatalogVehicle(vehicle));

  const dealerVehicles = networkSnapshot.vehicles
    .filter((vehicle) => vehicle.status !== "vendido")
    .filter((vehicle) => (vehicle.channels?.c4r ?? true) === true)
    .map((vehicle) => mapDealerVehicle(vehicle, dealerNameById, dealerLocationById));

  const sellerVehicles = publishedSellerListings.map((listing) => mapPublishedSellerListing(listing));

  const allVehicles = dedupeVehicles([...sellerVehicles, ...dealerVehicles, ...catalogVehicles]).sort((left, right) => {
    if (right.year !== left.year) {
      return right.year - left.year;
    }

    if (left.priceClp !== right.priceClp) {
      return left.priceClp - right.priceClp;
    }

    return left.title.localeCompare(right.title, "es");
  });

  return allVehicles;
}

export async function getMarketplaceVehicleBySlug(slug: string): Promise<MarketplaceVehicle | null> {
  const normalizedSlug = normalizeText(slug);
  if (!normalizedSlug) {
    return null;
  }

  const vehicles = await getMarketplaceVehicles();
  return vehicles.find((vehicle) => vehicle.slug === normalizedSlug) ?? null;
}

export async function getMarketplaceVehicleByIdOrSlug(
  vehicleId?: string,
  vehicleSlug?: string,
): Promise<MarketplaceVehicle | null> {
  const normalizedId = normalizeText(vehicleId);
  const normalizedSlug = normalizeText(vehicleSlug);
  const vehicles = await getMarketplaceVehicles();

  if (normalizedId) {
    const byId = vehicles.find((vehicle) => vehicle.id === normalizedId);
    if (byId) {
      return byId;
    }
  }

  if (normalizedSlug) {
    const bySlug = vehicles.find((vehicle) => vehicle.slug === normalizedSlug);
    if (bySlug) {
      return bySlug;
    }
  }

  return null;
}
