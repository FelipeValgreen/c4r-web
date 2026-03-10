import fs from "node:fs/promises";

const BASE_URL = "https://www.chileautos.cl";
const OUTPUT_FILE = new URL("../lib/chileautos-vehicles.ts", import.meta.url);

const seedPaths = [
  "/catalogo",
  "/catalogo/chevrolet",
  "/catalogo/peugeot",
  "/catalogo/opel",
  "/catalogo/jac",
  "/catalogo/hyundai",
  "/catalogo/kia",
  "/catalogo/toyota",
  "/catalogo/nissan",
  "/catalogo/suzuki",
  "/catalogo/changan",
  "/catalogo/renault",
  "/catalogo/volkswagen",
  "/catalogo/audi",
];

const fallbackCities = [
  "Santiago",
  "Valparaíso",
  "Concepción",
  "La Serena",
  "Temuco",
  "Antofagasta",
  "Viña del Mar",
  "Rancagua",
  "Talca",
  "Puerto Montt",
  "Iquique",
  "Calama",
  "Copiapó",
  "Arica",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }

      await sleep(500 * (attempt + 1));
    }
  }

  throw new Error(`Failed to fetch ${url}`);
}

function decodeHtml(input) {
  return input
    .replace(/&#(\d+);/g, (_match, value) => String.fromCharCode(Number(value)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, value) => String.fromCharCode(parseInt(value, 16)))
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&Aacute;/g, "Á")
    .replace(/&Eacute;/g, "É")
    .replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&uuml;/g, "ü")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&iexcl;/g, "¡")
    .replace(/&iquest;/g, "¿")
    .replace(/&reg;/g, "®")
    .replace(/&deg;/g, "°")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“");
}

function stripHtml(input) {
  return decodeHtml(String(input ?? "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parsePrice(version) {
  const values = [];

  if (typeof version?.listingPrice?.min === "number" && version.listingPrice.min > 0) {
    values.push(version.listingPrice.min);
  }

  if (Array.isArray(version?.priceList)) {
    for (const item of version.priceList) {
      if (typeof item?.amount === "number" && item.amount > 0) {
        values.push(item.amount);
      }
    }
  }

  return values.length > 0 ? Math.min(...values) : null;
}

function cleanImageUrl(url) {
  if (typeof url !== "string") {
    return null;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("http")) {
    return url;
  }

  return null;
}

function resolveVersionUrl(detailUrl, versionId) {
  if (typeof detailUrl !== "string" || typeof versionId !== "string") {
    return detailUrl;
  }

  const detailMatch = detailUrl.match(/^(.*\/)CL-JATO-ITM-\d+$/);
  if (!detailMatch) {
    return detailUrl;
  }

  return `${detailMatch[1]}${versionId}`;
}

function extractCardData(html) {
  const cardRegex =
    /<a[^>]*href="([^\"]*\/catalogo\/[^\"]*CL-JATO-ITM-[0-9]+)"[^>]*>[\s\S]*?<img[^>]*src="([^\"]+)"/g;
  const cards = [];
  let match;

  while ((match = cardRegex.exec(html))) {
    const href = decodeHtml(match[1]);
    const image = decodeHtml(match[2]);

    cards.push({
      detailUrl: href.startsWith("http") ? href : `${BASE_URL}${href}`,
      cardImage: cleanImageUrl(image),
    });
  }

  return cards;
}

function getNgState(html) {
  const match = html.match(/<script id="ng-state" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function getDetailVersions(ngState) {
  if (!ngState || typeof ngState !== "object") {
    return [];
  }

  for (const value of Object.values(ngState)) {
    if (
      value &&
      typeof value === "object" &&
      typeof value.u === "string" &&
      value.u.includes("/catalogo/api/detail/versions/") &&
      Array.isArray(value.b?.searchResults)
    ) {
      return value.b.searchResults;
    }
  }

  return [];
}

function pickCoverAndGallery(version, cardImage) {
  const photos = Array.isArray(version?.photos) ? version.photos : [];
  const normalized = photos
    .map((photo) => {
      const url = cleanImageUrl(photo?.url);
      if (!url) {
        return null;
      }

      const sectionTag = Array.isArray(photo?.tags)
        ? photo.tags.find((tag) => String(tag?.name).toLowerCase() === "section")
        : null;

      return {
        url,
        section: String(sectionTag?.value ?? "").toLowerCase(),
      };
    })
    .filter(Boolean);

  const firstBySection = (section) => normalized.find((photo) => photo.section === section)?.url ?? null;

  const preferredCover =
    firstBySection("hero-desktop") ?? firstBySection("hero-mobile") ?? normalized[0]?.url ?? cardImage ?? null;

  const gallery = [preferredCover, ...normalized.map((photo) => photo.url), cardImage]
    .filter(Boolean)
    .filter((url, index, source) => source.indexOf(url) === index)
    .slice(0, 10);

  return {
    coverImage: preferredCover ?? gallery[0] ?? null,
    gallery,
  };
}

function inferCondition(version) {
  const listingType = String(version?.listingType ?? "").toLowerCase();
  if (listingType.includes("showroom")) {
    return "Nuevo";
  }

  return "Usado";
}

function estimateReservationFee(price) {
  const percentage = Math.round((price * 0.02) / 10000) * 10000;
  return Math.max(200000, percentage);
}

function estimateMonthly(price) {
  return Math.max(120000, Math.round((price * 0.018) / 10000) * 10000);
}

function resolveDealer(version) {
  if (Array.isArray(version?.sellers) && version.sellers.length > 0) {
    const firstSeller = version.sellers[0];
    const sellerName = stripHtml(firstSeller?.name ?? "");
    if (sellerName) {
      return sellerName;
    }
  }

  return "Concesionario oficial Chileautos";
}

function resolveLocation(version, fallbackIndex) {
  if (Array.isArray(version?.sellers) && version.sellers.length > 0) {
    const firstSeller = version.sellers[0];
    const candidates = [firstSeller?.city, firstSeller?.region, firstSeller?.location, firstSeller?.suburb]
      .map((value) => stripHtml(value ?? ""))
      .filter(Boolean);

    if (candidates.length > 0) {
      return candidates[0];
    }
  }

  return fallbackCities[fallbackIndex % fallbackCities.length];
}

function buildHighlights(version) {
  const attributes = Array.isArray(version?.attributes) ? version.attributes : [];

  return attributes
    .filter((attribute) => attribute?.show !== false)
    .map((attribute) => stripHtml(attribute?.displayName ?? attribute?.name ?? ""))
    .filter(Boolean)
    .filter((value, index, source) => source.indexOf(value) === index)
    .slice(0, 10);
}

function buildPriceBreakdown(version) {
  const priceList = Array.isArray(version?.priceList) ? version.priceList : [];

  return priceList
    .map((entry) => ({
      type: stripHtml(entry?.type ?? "Precio"),
      amount: Number(entry?.amount ?? 0),
    }))
    .filter((entry) => Number.isFinite(entry.amount) && entry.amount > 0);
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = [];
  const queue = [...items];

  async function worker() {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) {
        return;
      }

      const result = await mapper(next);
      results.push(result);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

function createTsFileContent(vehicles) {
  const json = JSON.stringify(vehicles, null, 2);

  return `export type VehiclePriceItem = {
  type: string;
  amount: number;
};

export type C4RVehicle = {
  id: string;
  slug: string;
  sourceUrl: string;
  make: string;
  model: string;
  year: number;
  badge: string | null;
  title: string;
  bodyStyle: string;
  fuelType: string;
  transmission: string;
  drive: string;
  engine: string | null;
  engineCc: number | null;
  fuelCombined: number | null;
  doors: number | null;
  condition: "Nuevo" | "Usado";
  km: number | null;
  priceClp: number;
  reservationFeeClp: number;
  estimatedMonthlyClp: number;
  versionsAvailable: number;
  dealer: string;
  location: string;
  coverImage: string;
  gallery: string[];
  description: string;
  highlights: string[];
  priceBreakdown: VehiclePriceItem[];
  source: string;
};

export const c4rVehicles: C4RVehicle[] = ${json};

export function getVehicleBySlug(slug: string): C4RVehicle | null {
  return c4rVehicles.find((vehicle) => vehicle.slug === slug) ?? null;
}

export function formatCurrencyClp(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKm(value: number | null): string {
  if (value === null) {
    return "Kilometraje por confirmar";
  }

  return \`${"${new Intl.NumberFormat(\"es-CL\").format(value)} km"}\`;
}

export const vehicleCategories = Array.from(new Set(c4rVehicles.map((vehicle) => vehicle.bodyStyle))).sort();
`;
}

async function main() {
  const urlToCardImage = new Map();

  for (const seedPath of seedPaths) {
    const pageUrl = `${BASE_URL}${seedPath}`;
    const html = await fetchText(pageUrl);
    const cards = extractCardData(html);

    for (const card of cards) {
      const normalizedUrl = encodeURI(card.detailUrl);
      if (!urlToCardImage.has(normalizedUrl)) {
        urlToCardImage.set(normalizedUrl, card.cardImage);
      }
    }
  }

  const detailUrls = Array.from(urlToCardImage.keys());
  console.log(`Modelos detectados: ${detailUrls.length}`);

  const detailResults = await mapWithConcurrency(detailUrls, 8, async (detailUrl) => {
    try {
      const html = await fetchText(detailUrl);
      const ngState = getNgState(html);
      const versions = getDetailVersions(ngState);

      return {
        detailUrl,
        versions,
        cardImage: urlToCardImage.get(detailUrl) ?? null,
      };
    } catch {
      return {
        detailUrl,
        versions: [],
        cardImage: urlToCardImage.get(detailUrl) ?? null,
      };
    }
  });

  const vehiclesById = new Map();
  let fallbackIndex = 0;

  for (const detail of detailResults) {
    const versionsAvailable = detail.versions.length;

    for (const version of detail.versions) {
      const id = stripHtml(version?.id ?? "");
      if (!id) {
        continue;
      }

      const priceClp = parsePrice(version);
      if (!priceClp) {
        continue;
      }

      const make = stripHtml(version?.make ?? "");
      const model = stripHtml(version?.model ?? "");
      const year = Number(version?.year ?? 0);
      if (!make || !model || !year) {
        continue;
      }

      const badgeRaw = stripHtml(version?.badge ?? "");
      const badge = badgeRaw && badgeRaw !== "-" ? badgeRaw : null;

      const { coverImage, gallery } = pickCoverAndGallery(version, detail.cardImage);
      if (!coverImage || gallery.length === 0) {
        continue;
      }

      const condition = inferCondition(version);
      const km = condition === "Nuevo" ? 0 : null;
      const dealer = resolveDealer(version);
      const location = resolveLocation(version, fallbackIndex);
      fallbackIndex += 1;

      const title = [make, model, String(year), badge].filter(Boolean).join(" ");
      const description = stripHtml(version?.description ?? "");
      const highlights = buildHighlights(version);
      const priceBreakdown = buildPriceBreakdown(version);

      const slugBase = [make, model, String(year), badge, id.slice(-6)].filter(Boolean).join("-");
      const slug = slugify(slugBase);

      const vehicle = {
        id,
        slug,
        sourceUrl: resolveVersionUrl(detail.detailUrl, id),
        make,
        model,
        year,
        badge,
        title,
        bodyStyle: stripHtml(version?.bodyStyleCategory ?? "Sin categoria"),
        fuelType: stripHtml(version?.fuelType ?? "Por confirmar"),
        transmission: stripHtml(version?.transmission ?? "Por confirmar"),
        drive: stripHtml(version?.drive ?? "Por confirmar"),
        engine: version?.engineDesc ? `${stripHtml(version.engineDesc)}L` : null,
        engineCc: typeof version?.engineSize === "number" ? version.engineSize : null,
        fuelCombined: typeof version?.fuelCombined === "number" ? version.fuelCombined : null,
        doors: typeof version?.doorNum === "number" ? version.doorNum : null,
        condition,
        km,
        priceClp,
        reservationFeeClp: estimateReservationFee(priceClp),
        estimatedMonthlyClp: estimateMonthly(priceClp),
        versionsAvailable,
        dealer,
        location,
        coverImage,
        gallery,
        description,
        highlights,
        priceBreakdown,
        source: "Chileautos catalogo 0km",
      };

      const current = vehiclesById.get(id);
      if (!current || current.gallery.length < vehicle.gallery.length) {
        vehiclesById.set(id, vehicle);
      }
    }
  }

  const vehicles = Array.from(vehiclesById.values()).sort((left, right) => {
    if (left.year !== right.year) {
      return right.year - left.year;
    }

    if (left.priceClp !== right.priceClp) {
      return left.priceClp - right.priceClp;
    }

    return left.title.localeCompare(right.title, "es");
  });

  const tsFile = createTsFileContent(vehicles);
  await fs.writeFile(OUTPUT_FILE, tsFile, "utf8");

  const categories = new Map();
  for (const vehicle of vehicles) {
    categories.set(vehicle.bodyStyle, (categories.get(vehicle.bodyStyle) ?? 0) + 1);
  }

  console.log(`Vehiculos generados: ${vehicles.length}`);
  console.log("Categorias:");
  for (const [category, count] of [...categories.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`- ${category}: ${count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
