import fs from "node:fs/promises";

const CHILEAUTOS_BASE_URL = "https://www.chileautos.cl";
const FULLMOTOR_BASE_URL = "https://www.fullmotor.cl";
const FULLMOTOR_AUTOMOBILE_TYPE = "1";
const FULLMOTOR_PAGE_LIMIT = 120;
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
  "Valparaiso",
  "Concepcion",
  "La Serena",
  "Temuco",
  "Antofagasta",
  "Vina del Mar",
  "Rancagua",
  "Talca",
  "Puerto Montt",
  "Iquique",
  "Calama",
  "Copiapo",
  "Arica",
];

const searchableLocations = [
  "Santiago",
  "Vitacura",
  "Las Condes",
  "Providencia",
  "Lo Barnechea",
  "Maipu",
  "Nunoa",
  "La Florida",
  "Puente Alto",
  "Vina del Mar",
  "Valparaiso",
  "Concepcion",
  "Talcahuano",
  "Chillan",
  "La Serena",
  "Coquimbo",
  "Antofagasta",
  "Iquique",
  "Calama",
  "Temuco",
  "Puerto Montt",
  "Rancagua",
  "Talca",
  "Arica",
  "Copiapo",
];

const heroBodyStyleFallback = "Automovil";

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
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
  return String(input ?? "")
    .replace(/&#(\d+);/g, (_match, value) => String.fromCharCode(Number(value)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, value) => String.fromCharCode(parseInt(value, 16)))
    .replace(/&aacute;/g, "a")
    .replace(/&eacute;/g, "e")
    .replace(/&iacute;/g, "i")
    .replace(/&oacute;/g, "o")
    .replace(/&uacute;/g, "u")
    .replace(/&Aacute;/g, "A")
    .replace(/&Eacute;/g, "E")
    .replace(/&Iacute;/g, "I")
    .replace(/&Oacute;/g, "O")
    .replace(/&Uacute;/g, "U")
    .replace(/&ntilde;/g, "n")
    .replace(/&Ntilde;/g, "N")
    .replace(/&uuml;/g, "u")
    .replace(/&Uuml;/g, "U")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&iexcl;/g, "!")
    .replace(/&iquest;/g, "?")
    .replace(/&reg;/g, "R")
    .replace(/&deg;/g, " grados")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');
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

function normalizeKey(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toTitleCase(input) {
  const base = stripHtml(input)
    .toLowerCase()
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase());

  return base
    .replace(/\b(4x4|4x2|awd|4wd|fwd|rwd|dsg|cvt|mt|at)\b/gi, (value) => value.toUpperCase())
    .replace(/\b(tfsi|tsi|gti|hdi|tdi|v6|v8|v10|ev|phev)\b/gi, (value) => value.toUpperCase());
}

function normalizeAbsoluteUrl(url, baseUrl) {
  const value = decodeHtml(url).trim();
  if (!value) {
    return null;
  }

  const normalized = value.startsWith("//") ? `https:${value}` : value;

  try {
    const parsed = normalized.startsWith("http") ? new URL(normalized) : new URL(normalized, baseUrl);
    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizeImageFingerprint(url) {
  const normalized = normalizeAbsoluteUrl(url, CHILEAUTOS_BASE_URL);
  if (!normalized) {
    return "";
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

function parseInteger(value) {
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  if (!digits) {
    return null;
  }

  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
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
  const normalized = normalizeAbsoluteUrl(url, CHILEAUTOS_BASE_URL);
  return normalized;
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
      detailUrl: href.startsWith("http") ? href : `${CHILEAUTOS_BASE_URL}${href}`,
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
    .slice(0, 14);

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
    .slice(0, 12);
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

function vehicleQualityScore(vehicle) {
  let score = 0;
  score += Math.min(vehicle.highlights.length, 12);
  score += Math.min(vehicle.gallery.length, 14);
  score += vehicle.description.length > 120 ? 4 : vehicle.description.length > 60 ? 2 : 0;
  score += vehicle.fuelCombined !== null ? 2 : 0;
  score += vehicle.engineCc !== null ? 1 : 0;
  score += vehicle.priceBreakdown.length > 0 ? 1 : 0;
  return score;
}

function pickPreferredVehicle(left, right) {
  if (left.priceClp !== right.priceClp) {
    return left.priceClp < right.priceClp ? left : right;
  }

  const leftScore = vehicleQualityScore(left);
  const rightScore = vehicleQualityScore(right);
  if (leftScore !== rightScore) {
    return leftScore > rightScore ? left : right;
  }

  const leftAutomatic = normalizeKey(left.transmission).includes("auto");
  const rightAutomatic = normalizeKey(right.transmission).includes("auto");
  if (leftAutomatic !== rightAutomatic) {
    return leftAutomatic ? left : right;
  }

  return left.id.localeCompare(right.id, "es") <= 0 ? left : right;
}

function dedupeVehicleCollection(vehicles) {
  const dedupedById = new Map();

  for (const vehicle of vehicles) {
    const key = normalizeKey(vehicle.id);
    const current = dedupedById.get(key);
    if (!current) {
      dedupedById.set(key, vehicle);
      continue;
    }

    dedupedById.set(key, pickPreferredVehicle(current, vehicle));
  }

  const dedupedByVisualKey = new Map();

  for (const vehicle of dedupedById.values()) {
    const isInvalidCover = /noimage|placeholder/i.test(String(vehicle.coverImage ?? ""));
    if (isInvalidCover) {
      continue;
    }

    const visualFingerprint = normalizeImageFingerprint(vehicle.coverImage);
    const key = [
      normalizeKey(vehicle.make),
      normalizeKey(vehicle.model),
      String(vehicle.year),
      String(vehicle.priceClp),
      visualFingerprint,
    ].join("|");

    const current = dedupedByVisualKey.get(key);
    if (!current) {
      dedupedByVisualKey.set(key, vehicle);
      continue;
    }

    dedupedByVisualKey.set(key, pickPreferredVehicle(current, vehicle));
  }

  const dedupedBySlug = new Map();

  for (const vehicle of dedupedByVisualKey.values()) {
    const slugKey = normalizeKey(vehicle.slug);
    const current = dedupedBySlug.get(slugKey);
    if (!current) {
      dedupedBySlug.set(slugKey, vehicle);
      continue;
    }

    dedupedBySlug.set(slugKey, pickPreferredVehicle(current, vehicle));
  }

  return Array.from(dedupedBySlug.values());
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

function extractMetaContent(html, itemprop) {
  const regex = new RegExp(`itemprop=["']${escapeRegex(itemprop)}["'][^>]*content=["']([^"']+)["']`, "i");
  const match = html.match(regex);
  return match ? stripHtml(match[1]) : "";
}

function getBodyStyleFallback() {
  return heroBodyStyleFallback;
}

function removeMakeFromModel(makeModel, make) {
  const normalizedMakeModel = normalizeKey(makeModel);
  const normalizedMake = normalizeKey(make);

  if (!normalizedMakeModel || !normalizedMake) {
    return makeModel;
  }

  const prefixRegex = new RegExp(`^${escapeRegex(make)}\\s+`, "i");
  if (prefixRegex.test(makeModel)) {
    return makeModel.replace(prefixRegex, "").trim();
  }

  return makeModel;
}

function detectTransmission(text) {
  const normalized = normalizeKey(text);

  if (/\b(automatico|automatica|auto|at|cvt|dsg|stronic|tiptronic)\b/.test(normalized)) {
    return "automatico";
  }

  if (/\b(manual|mecanica|mecanico|mt|mec)\b/.test(normalized)) {
    return "manual";
  }

  return "Por confirmar";
}

function detectFuelType(text) {
  const normalized = normalizeKey(text);

  if (/\b(diesel|dsl|tdi|hdi)\b/.test(normalized)) {
    return "Diesel";
  }

  if (/\b(hibrido|hybrid|hev|phev)\b/.test(normalized)) {
    return "Hibrido";
  }

  if (/\b(electrico|electrica|ev)\b/.test(normalized)) {
    return "Electrico";
  }

  return "Bencina";
}

function detectDrive(text) {
  const normalized = normalizeKey(text);

  if (/\b(4x4|4wd|awd)\b/.test(normalized)) {
    return "4x4";
  }

  if (/\b(4x2|fwd|rwd)\b/.test(normalized)) {
    return "4x2";
  }

  return "Por confirmar";
}

function parseEngineInfo(text) {
  const normalized = stripHtml(text);

  const ccMatch = normalized.match(/\b(\d{3,4})\s*cc\b/i);
  if (ccMatch) {
    const engineCc = Number(ccMatch[1]);
    if (Number.isFinite(engineCc)) {
      const liters = (engineCc / 1000).toFixed(1).replace(/\.0$/, "");
      return { engine: `${liters}L`, engineCc };
    }
  }

  const literMatch = normalized.match(/\b([0-9](?:[\.,][0-9])?)\s*(?:l|lt|turbo|tsi|tfsi|v6|v8|hdi|tdi)\b/i);
  if (literMatch) {
    const litersValue = Number(literMatch[1].replace(",", "."));
    if (Number.isFinite(litersValue) && litersValue > 0 && litersValue <= 9) {
      const engineCc = Math.round(litersValue * 1000);
      return { engine: `${literMatch[1].replace(",", ".")}L`, engineCc };
    }
  }

  return { engine: null, engineCc: null };
}

function parseLocationFromText(text) {
  const normalized = normalizeKey(text);

  for (const location of searchableLocations) {
    if (normalized.includes(normalizeKey(location))) {
      return location;
    }
  }

  return null;
}

function parseFullmotorTotalPages(html) {
  const nextMatch = html.match(/class="jp-next"[^>]*href="stock\/(\d+)"/i);
  if (nextMatch) {
    const parsed = Number(nextMatch[1]);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(parsed, FULLMOTOR_PAGE_LIMIT);
    }
  }

  const pageMatches = Array.from(html.matchAll(/href="stock\/(\d+)"/gi)).map((match) => Number(match[1]));
  const maxPage = Math.max(1, ...pageMatches.filter((value) => Number.isFinite(value)));
  return Math.min(maxPage, FULLMOTOR_PAGE_LIMIT);
}

function extractFullmotorCards(html) {
  const cards = [];
  const cardRegex = /<a[^>]*href="(ficha\/\d+\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;

  let match;
  while ((match = cardRegex.exec(html))) {
    const block = match[2];
    if (!block.includes("celdaauto") || !block.includes('itemprop="price"')) {
      continue;
    }

    const sourcePath = decodeHtml(match[1]).trim();
    const idMatch = sourcePath.match(/ficha\/(\d+)\//);
    if (!idMatch) {
      continue;
    }

    const id = `FM-${idMatch[1]}`;
    const sourceUrl = normalizeAbsoluteUrl(sourcePath, FULLMOTOR_BASE_URL);
    if (!sourceUrl) {
      continue;
    }

    const rawName = extractMetaContent(block, "name");
    const rawBrand = extractMetaContent(block, "brand");
    const rawPrice = extractMetaContent(block, "price");
    const priceClp = parseInteger(rawPrice);
    if (!priceClp || priceClp <= 0) {
      continue;
    }

    const coverImage = normalizeAbsoluteUrl(extractMetaContent(block, "image"), FULLMOTOR_BASE_URL);
    if (!coverImage) {
      continue;
    }

    const makeModel = toTitleCase((block.match(/<b>([\s\S]*?)<\/b>/i) ?? [])[1] ?? rawName);
    const badgePrimary = toTitleCase(stripHtml((block.match(/<\/b>([\s\S]*?)<br/i) ?? [])[1] ?? ""));
    const badgeSecondary = toTitleCase(stripHtml((block.match(/id=["']segundalinea["'][^>]*>([\s\S]*?)<\/label>/i) ?? [])[1] ?? ""));
    const badge = [badgePrimary, badgeSecondary].filter(Boolean).join(" ").trim() || null;

    const make = toTitleCase(rawBrand || makeModel.split(" ")[0] || "Auto");
    const model = removeMakeFromModel(makeModel, make) || makeModel;

    const kmsText = stripHtml((block.match(/<span class="kms">([\s\S]*?)<\/span>/i) ?? [])[1] ?? "");
    const yearText = stripHtml((block.match(/<span class="agno">([\s\S]*?)<\/span>/i) ?? [])[1] ?? "");
    const km = parseInteger(kmsText);
    const year = parseInteger(yearText);
    if (!year) {
      continue;
    }

    const searchableText = [rawName, makeModel, badge, block].map((value) => stripHtml(value)).join(" ");

    if (/\bvendid[oa]\b/i.test(searchableText)) {
      continue;
    }

    const transmission =
      /class="automatico"/i.test(block) || /\bautomatico\b/i.test(searchableText)
        ? "automatico"
        : detectTransmission(searchableText);

    let fuelType = detectFuelType(searchableText);
    if (/class="diesel"/i.test(block)) {
      fuelType = "Diesel";
    }

    const drive = detectDrive(searchableText);
    const { engine, engineCc } = parseEngineInfo([badgePrimary, badgeSecondary, rawName].join(" "));

    const title = [make, model, String(year), badge].filter(Boolean).join(" ");
    const slug = slugify(`${make}-${model}-${year}-${id}`);

    const currentYear = new Date().getFullYear();
    const condition = year >= currentYear && (km === null || km <= 150) ? "Nuevo" : "Usado";

    cards.push({
      id,
      slug,
      sourcePath,
      sourceUrl,
      make,
      model,
      year,
      badge,
      title,
      bodyStyle: getBodyStyleFallback(),
      fuelType,
      transmission,
      drive,
      engine,
      engineCc,
      fuelCombined: null,
      doors: null,
      condition,
      km,
      priceClp,
      reservationFeeClp: estimateReservationFee(priceClp),
      estimatedMonthlyClp: estimateMonthly(priceClp),
      versionsAvailable: 1,
      dealer: "FullMotor",
      location: null,
      coverImage,
      gallery: [coverImage],
      description: badgeSecondary || "Vehiculo publicado en FullMotor.",
      highlights: [],
      priceBreakdown: [{ type: "Publicacion", amount: priceClp }],
      source: "FullMotor stock",
      sourceName: rawName,
    });
  }

  return cards;
}

function parseFullmotorDetail(html) {
  const gallery = [];
  const galleryRegex = /<a[^>]*href="([^"]+)"[^>]*class="glightbox"[^>]*data-gallery="auto-zoom"/gi;
  let galleryMatch;

  while ((galleryMatch = galleryRegex.exec(html))) {
    const image = normalizeAbsoluteUrl(galleryMatch[1], FULLMOTOR_BASE_URL);
    if (!image) {
      continue;
    }

    if (!gallery.includes(image)) {
      gallery.push(image);
    }
  }

  const fallbackMainImage = normalizeAbsoluteUrl(extractMetaContent(html, "image"), FULLMOTOR_BASE_URL);
  if (fallbackMainImage && !gallery.includes(fallbackMainImage)) {
    gallery.unshift(fallbackMainImage);
  }

  const descriptionBlock = (html.match(/<h4 class="subtitulo">DESCRIP[^<]*<\/h4>[\s\S]*?<p>([\s\S]*?)<\/p>/i) ?? [])[1] ?? "";
  const sellerRaw = (descriptionBlock.match(/class=['"]vendedor['"][^>]*>\s*VENDE:\s*([^<]+)/i) ?? [])[1] ?? "";
  const seller = toTitleCase(stripHtml(sellerRaw));

  const descriptionWithoutSeller = descriptionBlock.replace(/<font[^>]*class=['"]vendedor['"][\s\S]*?<\/font>/gi, " ");
  const description = stripHtml(descriptionWithoutSeller);

  const r4Raw = stripHtml((html.match(/<h4\s+class=['"]r4['"][^>]*>([\s\S]*?)<\/h4>/i) ?? [])[1] ?? "");
  const transmission = detectTransmission(r4Raw);
  const km = parseInteger((r4Raw.match(/([0-9\.\,]+)\s*km/i) ?? [])[1] ?? "");

  const priceFromTags = parseInteger((html.match(/<div class="tags price r1">[\s\S]*?\$\s*([^<\s]+(?:\.[^<\s]+)*)/i) ?? [])[1] ?? "");
  const locationFromSection = stripHtml(
    (html.match(/<section class="ubicacion-sucursal">[\s\S]*?<h4 class="subtitulo">([\s\S]*?)<\/h4>/i) ?? [])[1] ?? "",
  );

  const locationFromPopup = stripHtml((html.match(/<td[^>]*>\s*([^<]*?\-\s*Chile)\s*<\/td>/i) ?? [])[1] ?? "");
  const location = parseLocationFromText(`${locationFromSection} ${locationFromPopup} ${description}`);

  return {
    gallery: gallery.slice(0, 20),
    description,
    seller,
    transmission,
    km,
    priceFromTags,
    location,
  };
}

function buildFullmotorHighlights(vehicle) {
  const highlights = [];

  if (vehicle.transmission && vehicle.transmission !== "Por confirmar") {
    highlights.push(`Transmision ${vehicle.transmission}`);
  }

  if (vehicle.fuelType && vehicle.fuelType !== "Por confirmar") {
    highlights.push(`Combustible ${vehicle.fuelType}`);
  }

  if (vehicle.drive && vehicle.drive !== "Por confirmar") {
    highlights.push(`Traccion ${vehicle.drive}`);
  }

  if (vehicle.km !== null) {
    highlights.push(`${new Intl.NumberFormat("es-CL").format(vehicle.km)} km informados`);
  }

  highlights.push("Galeria de fotos reales del vehiculo");

  return highlights.filter(Boolean).slice(0, 8);
}

async function collectChileautosVehicles() {
  const urlToCardImage = new Map();

  for (const seedPath of seedPaths) {
    const pageUrl = `${CHILEAUTOS_BASE_URL}${seedPath}`;
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
  console.log(`Chileautos modelos detectados: ${detailUrls.length}`);

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
  detailResults.sort((left, right) => left.detailUrl.localeCompare(right.detailUrl, "en"));

  const vehiclesById = new Map();
  let fallbackIndex = 0;

  for (const detail of detailResults) {
    const versionsAvailable = detail.versions.length;
    const sortedVersions = [...detail.versions].sort((left, right) =>
      String(left?.id ?? "").localeCompare(String(right?.id ?? ""), "en"),
    );

    for (const version of sortedVersions) {
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

  return Array.from(vehiclesById.values());
}

async function collectFullmotorVehicles() {
  const stockFirstPageUrl = `${FULLMOTOR_BASE_URL}/stock?tipo=${FULLMOTOR_AUTOMOBILE_TYPE}`;
  const firstHtml = await fetchText(stockFirstPageUrl);
  const totalPages = parseFullmotorTotalPages(firstHtml);
  const pageNumbers = Array.from({ length: totalPages }, (_item, index) => index + 1);

  console.log(`FullMotor paginas detectadas: ${totalPages}`);

  const pageResults = await mapWithConcurrency(pageNumbers, 6, async (pageNumber) => {
    const pageUrl =
      pageNumber === 1
        ? `${FULLMOTOR_BASE_URL}/stock?tipo=${FULLMOTOR_AUTOMOBILE_TYPE}`
        : `${FULLMOTOR_BASE_URL}/stock/${pageNumber}?tipo=${FULLMOTOR_AUTOMOBILE_TYPE}`;

    try {
      const html = pageNumber === 1 ? firstHtml : await fetchText(pageUrl);
      return extractFullmotorCards(html);
    } catch {
      return [];
    }
  });

  const cardsById = new Map();
  for (const cards of pageResults) {
    for (const card of cards) {
      const current = cardsById.get(card.id);
      if (!current || current.gallery.length < card.gallery.length) {
        cardsById.set(card.id, card);
      }
    }
  }

  const cards = Array.from(cardsById.values());
  console.log(`FullMotor fichas base detectadas: ${cards.length}`);

  const detailed = await mapWithConcurrency(cards, 6, async (card) => {
    try {
      const html = await fetchText(card.sourceUrl);
      const detail = parseFullmotorDetail(html);

      const combinedText = [card.sourceName, card.badge, detail.description].filter(Boolean).join(" ");
      const transmission =
        detail.transmission !== "Por confirmar" ? detail.transmission : detectTransmission(combinedText) || card.transmission;
      const fuelType = card.fuelType !== "Bencina" ? card.fuelType : detectFuelType(combinedText);
      const drive = card.drive !== "Por confirmar" ? card.drive : detectDrive(combinedText);
      const { engine, engineCc } = parseEngineInfo([combinedText, detail.description].join(" "));

      const km = detail.km ?? card.km;
      const currentYear = new Date().getFullYear();
      const condition = card.year >= currentYear && (km === null || km <= 150) ? "Nuevo" : "Usado";
      const coverImage = detail.gallery[0] ?? card.coverImage;
      const gallery = [coverImage, ...detail.gallery, ...card.gallery]
        .map((url) => normalizeAbsoluteUrl(url, FULLMOTOR_BASE_URL))
        .filter(Boolean)
        .filter((url, index, source) => source.indexOf(url) === index)
        .slice(0, 20);

      const location = detail.location ?? card.location;
      const fallbackLocationIndex = parseInteger(card.id) ?? 0;

      const priceClp = detail.priceFromTags ?? card.priceClp;

      const vehicle = {
        id: card.id,
        slug: card.slug,
        sourceUrl: card.sourceUrl,
        make: card.make,
        model: card.model,
        year: card.year,
        badge: card.badge,
        title: card.title,
        bodyStyle: card.bodyStyle,
        fuelType,
        transmission,
        drive,
        engine: engine ?? card.engine,
        engineCc: engineCc ?? card.engineCc,
        fuelCombined: null,
        doors: null,
        condition,
        km,
        priceClp,
        reservationFeeClp: estimateReservationFee(priceClp),
        estimatedMonthlyClp: estimateMonthly(priceClp),
        versionsAvailable: 1,
        dealer: detail.seller || card.dealer,
        location: location || fallbackCities[fallbackLocationIndex % fallbackCities.length],
        coverImage,
        gallery,
        description: detail.description || card.description,
        highlights: buildFullmotorHighlights({
          transmission,
          fuelType,
          drive,
          km,
        }),
        priceBreakdown: [{ type: "Publicacion", amount: priceClp }],
        source: "FullMotor stock",
      };

      return vehicle;
    } catch {
      return {
        ...card,
        highlights: buildFullmotorHighlights(card),
      };
    }
  });

  return detailed
    .filter((vehicle) => vehicle.coverImage && vehicle.gallery.length > 0)
    .filter((vehicle) => !/\bvendid[oa]\b/i.test(normalizeKey(vehicle.title)));
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
  const chileautosVehicles = await collectChileautosVehicles();
  const fullmotorVehicles = await collectFullmotorVehicles();

  console.log(`Chileautos vehiculos: ${chileautosVehicles.length}`);
  console.log(`FullMotor vehiculos: ${fullmotorVehicles.length}`);

  const vehicles = dedupeVehicleCollection([...chileautosVehicles, ...fullmotorVehicles]).sort((left, right) => {
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
  const sources = new Map();

  for (const vehicle of vehicles) {
    categories.set(vehicle.bodyStyle, (categories.get(vehicle.bodyStyle) ?? 0) + 1);
    sources.set(vehicle.source, (sources.get(vehicle.source) ?? 0) + 1);
  }

  console.log(`Vehiculos generados: ${vehicles.length}`);
  console.log("Fuentes:");
  for (const [source, count] of [...sources.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`- ${source}: ${count}`);
  }

  console.log("Categorias:");
  for (const [category, count] of [...categories.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`- ${category}: ${count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
