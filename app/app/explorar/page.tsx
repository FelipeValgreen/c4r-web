import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import TrackedLink from "@/components/TrackedLink";
import { formatCurrencyClp, formatKm } from "@/lib/chileautos-vehicles";
import { getMarketplaceVehicles, type MarketplaceVehicle } from "@/lib/marketplace-catalog";

type SearchParams = {
  q?: string | string[];
  body?: string | string[];
  fuel?: string | string[];
  transmission?: string | string[];
  location?: string | string[];
  condition?: string | string[];
  sort?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  maxKm?: string | string[];
  minYear?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

type SortMode = "recommended" | "price_asc" | "price_desc" | "year_desc" | "km_asc";

type ExploreFilters = {
  query: string;
  body: string;
  fuel: string;
  transmission: string;
  location: string;
  condition: string;
  sort: SortMode;
  minPrice: number | null;
  maxPrice: number | null;
  maxKm: number | null;
  minYear: number | null;
  page: number;
};

const PAGE_SIZE = 24;

const sortModes: Record<SortMode, string> = {
  recommended: "Recomendados",
  price_asc: "Precio menor a mayor",
  price_desc: "Precio mayor a menor",
  year_desc: "Mas nuevos",
  km_asc: "Menor kilometraje",
};

const CLEAR_FILTERS_URL = "/app/explorar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explorar autos verificados | C4R",
  description:
    "Catalogo interactivo de autos verificados con filtros avanzados, colecciones y navegacion mejorada para comparar y decidir rapido.",
  alternates: {
    canonical: "/app/explorar",
  },
  openGraph: {
    title: "Explorar autos verificados | C4R",
    description:
      "Catalogo interactivo de autos verificados con filtros avanzados, colecciones y navegacion mejorada para comparar y decidir rapido.",
    url: "/app/explorar",
    type: "website",
    images: [
      {
        url: "/og-c4r.svg",
        width: 1200,
        height: 630,
        alt: "C4R - Explorar autos verificados",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Explorar autos verificados | C4R",
    description:
      "Catalogo interactivo de autos verificados con filtros avanzados, colecciones y navegacion mejorada para comparar y decidir rapido.",
    images: ["/og-c4r.svg"],
  },
};

function getValue(value: string | string[] | undefined): string {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] ?? "" : value;
}

function parseOptionalNumber(value: string): number | null {
  const cleaned = value.replace(/[^0-9]/g, "");
  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
}

function normalizeSort(value: string): SortMode {
  const availableSorts = Object.keys(sortModes) as SortMode[];
  if (availableSorts.includes(value as SortMode)) {
    return value as SortMode;
  }

  return "recommended";
}

function buildExploreUrl(filters: ExploreFilters): string {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.body !== "all") {
    params.set("body", filters.body);
  }

  if (filters.fuel !== "all") {
    params.set("fuel", filters.fuel);
  }

  if (filters.transmission !== "all") {
    params.set("transmission", filters.transmission);
  }

  if (filters.location !== "all") {
    params.set("location", filters.location);
  }

  if (filters.condition !== "all") {
    params.set("condition", filters.condition);
  }

  if (filters.sort !== "recommended") {
    params.set("sort", filters.sort);
  }

  if (filters.minPrice !== null) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice !== null) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.maxKm !== null) {
    params.set("maxKm", String(filters.maxKm));
  }

  if (filters.minYear !== null) {
    params.set("minYear", String(filters.minYear));
  }

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const queryString = params.toString();
  return queryString ? `/app/explorar?${queryString}` : "/app/explorar";
}

function createExploreUrl(base: ExploreFilters, patch: Partial<ExploreFilters>): string {
  const next: ExploreFilters = { ...base, ...patch };
  if (!Object.prototype.hasOwnProperty.call(patch, "page")) {
    next.page = 1;
  }
  return buildExploreUrl(next);
}

function matchesVehicle(vehicle: MarketplaceVehicle, filters: ExploreFilters, normalizedQuery: string): boolean {
  if (filters.body !== "all" && vehicle.bodyStyle !== filters.body) {
    return false;
  }

  if (filters.fuel !== "all" && vehicle.fuelType !== filters.fuel) {
    return false;
  }

  if (filters.transmission !== "all" && vehicle.transmission !== filters.transmission) {
    return false;
  }

  if (filters.location !== "all" && vehicle.location !== filters.location) {
    return false;
  }

  if (filters.condition !== "all" && vehicle.condition !== filters.condition) {
    return false;
  }

  if (filters.minPrice !== null && vehicle.priceClp < filters.minPrice) {
    return false;
  }

  if (filters.maxPrice !== null && vehicle.priceClp > filters.maxPrice) {
    return false;
  }

  if (filters.minYear !== null && vehicle.year < filters.minYear) {
    return false;
  }

  if (filters.maxKm !== null) {
    const kmValue = vehicle.km ?? 0;
    if (kmValue > filters.maxKm) {
      return false;
    }
  }

  if (!normalizedQuery) {
    return true;
  }

  const searchable = [
    vehicle.title,
    vehicle.make,
    vehicle.model,
    vehicle.badge ?? "",
    vehicle.bodyStyle,
    vehicle.fuelType,
    vehicle.transmission,
    vehicle.dealer,
    vehicle.location,
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(normalizedQuery);
}

function sortVehicles(sortMode: SortMode, vehicles: MarketplaceVehicle[]) {
  const cloned = [...vehicles];

  switch (sortMode) {
    case "price_asc":
      return cloned.sort((left, right) => left.priceClp - right.priceClp);
    case "price_desc":
      return cloned.sort((left, right) => right.priceClp - left.priceClp);
    case "year_desc":
      return cloned.sort((left, right) => {
        if (right.year !== left.year) {
          return right.year - left.year;
        }
        return left.priceClp - right.priceClp;
      });
    case "km_asc":
      return cloned.sort((left, right) => {
        const leftKm = left.km ?? 0;
        const rightKm = right.km ?? 0;
        if (leftKm !== rightKm) {
          return leftKm - rightKm;
        }
        return left.priceClp - right.priceClp;
      });
    case "recommended":
    default:
      return cloned.sort((left, right) => {
        if (right.year !== left.year) {
          return right.year - left.year;
        }

        if (right.gallery.length !== left.gallery.length) {
          return right.gallery.length - left.gallery.length;
        }

        return left.priceClp - right.priceClp;
      });
  }
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function findCategoryByKeyword(categories: string[], keyword: string): string {
  return categories.find((category) => category.toLowerCase().includes(keyword)) ?? "all";
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const marketplaceVehicles = await getMarketplaceVehicles();
  const vehicleCategories = Array.from(new Set(marketplaceVehicles.map((vehicle) => vehicle.bodyStyle))).sort((left, right) =>
    left.localeCompare(right, "es"),
  );
  const params = await searchParams;

  const filters: ExploreFilters = {
    query: getValue(params.q).trim(),
    body: getValue(params.body).trim() || "all",
    fuel: getValue(params.fuel).trim() || "all",
    transmission: getValue(params.transmission).trim() || "all",
    location: getValue(params.location).trim() || "all",
    condition: getValue(params.condition).trim() || "all",
    sort: normalizeSort(getValue(params.sort).trim()),
    minPrice: parseOptionalNumber(getValue(params.minPrice).trim()),
    maxPrice: parseOptionalNumber(getValue(params.maxPrice).trim()),
    maxKm: parseOptionalNumber(getValue(params.maxKm).trim()),
    minYear: parseOptionalNumber(getValue(params.minYear).trim()),
    page: Math.max(1, Number(getValue(params.page).trim()) || 1),
  };

  const normalizedQuery = filters.query.toLowerCase();

  const filteredVehicles = marketplaceVehicles.filter((vehicle) => matchesVehicle(vehicle, filters, normalizedQuery));
  const sortedVehicles = sortVehicles(filters.sort, filteredVehicles);

  const total = sortedVehicles.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedVehicles = sortedVehicles.slice(pageStart, pageStart + PAGE_SIZE);
  const firstVisible = paginatedVehicles.length > 0 ? pageStart + 1 : 0;
  const lastVisible = pageStart + paginatedVehicles.length;

  const fuelOptions = Array.from(new Set(marketplaceVehicles.map((vehicle) => vehicle.fuelType))).sort((left, right) =>
    left.localeCompare(right, "es"),
  );
  const transmissionOptions = Array.from(new Set(marketplaceVehicles.map((vehicle) => vehicle.transmission))).sort(
    (left, right) => left.localeCompare(right, "es"),
  );
  const locationOptions = Array.from(new Set(marketplaceVehicles.map((vehicle) => vehicle.location))).sort((left, right) =>
    left.localeCompare(right, "es"),
  );
  const conditionOptions = Array.from(new Set(marketplaceVehicles.map((vehicle) => vehicle.condition))).sort((left, right) =>
    left.localeCompare(right, "es"),
  );

  const bodyCounts = vehicleCategories.map((category) => {
    const count = marketplaceVehicles.filter((vehicle) =>
      matchesVehicle(vehicle, { ...filters, body: category, page: 1 }, normalizedQuery),
    ).length;

    return { category, count };
  });

  const averagePrice =
    filteredVehicles.length > 0
      ? Math.round(filteredVehicles.reduce((sum, vehicle) => sum + vehicle.priceClp, 0) / filteredVehicles.length)
      : 0;

  const automaticOption = transmissionOptions.find((option) => option.toLowerCase().includes("automatic")) ?? "all";
  const hybridOption = fuelOptions.find((option) => option.toLowerCase().includes("hibr")) ?? "all";
  const suvCategory = findCategoryByKeyword(vehicleCategories, "suv");
  const pickupCategory = findCategoryByKeyword(vehicleCategories, "barandas");
  const hatchbackCategory = findCategoryByKeyword(vehicleCategories, "hatch");

  const quickFilters = [
    { label: "0 km", patch: { condition: "Nuevo" } },
    { label: "Bajo $20M", patch: { maxPrice: 20000000 } },
    { label: "Desde 2024", patch: { minYear: 2024 } },
    { label: "Automaticos", patch: { transmission: automaticOption } },
    { label: "Hibridos", patch: { fuel: hybridOption } },
  ].filter((entry) => {
    return Object.values(entry.patch).some((value) => value !== "all" && value !== null);
  });

  const collections = [
    {
      title: "Ciudad inteligente",
      description: "Modelos compactos y eficientes para uso diario.",
      patch: { maxPrice: 22000000, minYear: 2023, body: hatchbackCategory !== "all" ? hatchbackCategory : "all" },
    },
    {
      title: "Familia y SUV",
      description: "Espacio, seguridad y confort para viajes largos.",
      patch: { body: suvCategory, minYear: 2021 },
    },
    {
      title: "Performance premium",
      description: "Versiones deportivas de alta demanda.",
      patch: { minPrice: 40000000, transmission: automaticOption },
    },
    {
      title: "Trabajo y carga",
      description: "Unidades robustas para faena y negocio.",
      patch: { body: pickupCategory, maxKm: 50000 },
    },
  ];

  const activeFilterLabels: string[] = [];
  if (filters.body !== "all") activeFilterLabels.push(`Carroceria: ${filters.body}`);
  if (filters.fuel !== "all") activeFilterLabels.push(`Combustible: ${filters.fuel}`);
  if (filters.transmission !== "all") activeFilterLabels.push(`Transmision: ${filters.transmission}`);
  if (filters.location !== "all") activeFilterLabels.push(`Ubicacion: ${filters.location}`);
  if (filters.condition !== "all") activeFilterLabels.push(`Condicion: ${filters.condition}`);
  if (filters.minPrice !== null) activeFilterLabels.push(`Desde ${formatCurrencyClp(filters.minPrice)}`);
  if (filters.maxPrice !== null) activeFilterLabels.push(`Hasta ${formatCurrencyClp(filters.maxPrice)}`);
  if (filters.maxKm !== null) activeFilterLabels.push(`Max ${new Intl.NumberFormat("es-CL").format(filters.maxKm)} km`);
  if (filters.minYear !== null) activeFilterLabels.push(`Desde ano ${filters.minYear}`);
  if (filters.query) activeFilterLabels.push(`Busqueda: "${filters.query}"`);

  const visiblePageNumbers = [];
  for (let pageNumber = Math.max(1, currentPage - 2); pageNumber <= Math.min(totalPages, currentPage + 2); pageNumber += 1) {
    visiblePageNumbers.push(pageNumber);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf9f5_0%,#ffffff_32%)] pb-14 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <section className="rounded-3xl border border-platinum bg-white p-6 shadow-[0_24px_60px_-44px_rgba(44,44,44,0.35)] sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_340px]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-khaki/35 bg-khaki-light/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                <Sparkles className="h-3.5 w-3.5" />
                Catalogo premium C4R
              </p>
              <h1 className="mt-4 font-heading text-4xl font-bold text-ink sm:text-5xl">Explora autos verificados con mejor navegacion</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-ink/75">
                Descubre por colecciones, filtra por presupuesto y compara unidades reales con fotos autenticas. Disenamos esta seccion para que encuentres tu proximo auto en menos pasos.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <TrackedLink
                  href="#inventario"
                  eventName="explore_jump_inventory"
                  eventParams={{ location: "explore_hero" }}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-5 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
                >
                  Explorar inventario
                </TrackedLink>
                <TrackedLink
                  href="/vende-rapido"
                  eventName="explore_cta_publish"
                  eventParams={{ location: "explore_hero" }}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  Publicar mi auto
                </TrackedLink>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <article className="rounded-2xl border border-platinum bg-platinum/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Stock total</p>
                <p className="mt-2 font-heading text-3xl font-bold text-ink">
                  {new Intl.NumberFormat("es-CL").format(marketplaceVehicles.length)}
                </p>
                <p className="mt-1 text-sm text-ink/70">autos verificados</p>
              </article>
              <article className="rounded-2xl border border-platinum bg-platinum/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Resultado filtrado</p>
                <p className="mt-2 font-heading text-3xl font-bold text-ink">{new Intl.NumberFormat("es-CL").format(total)}</p>
                <p className="mt-1 text-sm text-ink/70">coincidencias activas</p>
              </article>
              <article className="rounded-2xl border border-platinum bg-platinum/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Precio promedio</p>
                <p className="mt-2 font-heading text-3xl font-bold text-ink">
                  {averagePrice > 0 ? formatCurrencyClp(averagePrice) : formatCurrencyClp(0)}
                </p>
                <p className="mt-1 text-sm text-ink/70">segun filtro activo</p>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-semibold text-ink">Colecciones destacadas</h2>
            <p className="text-sm text-ink/65">Inspirado en vitrinas de automotoras globales y navegacion por ambiente tipo retail.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {collections.map((collection) => (
              <TrackedLink
                key={collection.title}
                href={createExploreUrl(filters, collection.patch)}
                eventName="explore_collection_open"
                eventParams={{ collection: collection.title }}
                className="group rounded-2xl border border-platinum bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-khaki/45 hover:shadow-[0_16px_35px_-30px_rgba(44,44,44,0.55)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-khaki">Coleccion</p>
                <h3 className="mt-2 font-heading text-xl font-semibold text-ink">{collection.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{collection.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  Ver seleccion
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </TrackedLink>
            ))}
          </div>
        </section>

        <section id="inventario" className="mt-10 grid gap-8 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="h-max rounded-2xl border border-platinum bg-white p-5 xl:sticky xl:top-24">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-khaki" />
              <p className="text-sm font-semibold uppercase tracking-wide text-ink/75">Filtros avanzados</p>
            </div>

            <form action="/app/explorar" method="get" className="space-y-4">
              <label className="block text-sm font-medium text-ink">
                Buscar modelo o version
                <span className="relative mt-2 block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={filters.query}
                    placeholder="Ej: Corolla, Sportage, Hibrido"
                    className="h-11 w-full rounded-md border border-platinum bg-white px-10 text-sm text-ink outline-none transition-colors focus:border-khaki"
                  />
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium text-ink">
                  Desde CLP
                  <input
                    type="number"
                    name="minPrice"
                    min={0}
                    defaultValue={filters.minPrice ?? ""}
                    className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Hasta CLP
                  <input
                    type="number"
                    name="maxPrice"
                    min={0}
                    defaultValue={filters.maxPrice ?? ""}
                    className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium text-ink">
                  Ano minimo
                  <input
                    type="number"
                    name="minYear"
                    min={1990}
                    max={2030}
                    defaultValue={filters.minYear ?? ""}
                    className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Max km
                  <input
                    type="number"
                    name="maxKm"
                    min={0}
                    defaultValue={filters.maxKm ?? ""}
                    className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-ink">
                Carroceria
                <select
                  name="body"
                  defaultValue={filters.body}
                  className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                >
                  <option value="all">Todas</option>
                  {vehicleCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-ink">
                Combustible
                <select
                  name="fuel"
                  defaultValue={filters.fuel}
                  className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                >
                  <option value="all">Todos</option>
                  {fuelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-ink">
                Transmision
                <select
                  name="transmission"
                  defaultValue={filters.transmission}
                  className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                >
                  <option value="all">Todas</option>
                  {transmissionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-ink">
                Condicion
                <select
                  name="condition"
                  defaultValue={filters.condition}
                  className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                >
                  <option value="all">Todas</option>
                  {conditionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-ink">
                Ubicacion
                <select
                  name="location"
                  defaultValue={filters.location}
                  className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                >
                  <option value="all">Todas</option>
                  {locationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-ink">
                Ordenar por
                <select
                  name="sort"
                  defaultValue={filters.sort}
                  className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
                >
                  {(Object.keys(sortModes) as SortMode[]).map((option) => (
                    <option key={option} value={option}>
                      {sortModes[option]}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-khaki px-4 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
              >
                Actualizar resultados
              </button>
            </form>

            <TrackedLink
              href={CLEAR_FILTERS_URL}
              eventName="explore_clear_filters"
              eventParams={{ location: "explore_sidebar" }}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-platinum px-4 text-sm font-semibold text-ink transition-colors hover:bg-platinum"
            >
              Limpiar filtros
            </TrackedLink>

            <p className="mt-4 text-xs text-ink/60">
              Consejo UX: aplica 2 o 3 filtros maximo para descubrir opciones sin bloquear resultados.
            </p>
          </aside>

          <div className="space-y-5">
            <div className="rounded-2xl border border-platinum bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-ink/70">
                    Mostrando {firstVisible}-{lastVisible} de {new Intl.NumberFormat("es-CL").format(total)} autos.
                  </p>
                  <p className="text-xs text-ink/55">
                    Precio promedio visible: {averagePrice > 0 ? formatCurrencyClp(averagePrice) : formatCurrencyClp(0)}.
                  </p>
                </div>
                <span className="rounded-full border border-khaki/40 bg-khaki-light px-3 py-1 text-xs font-semibold text-ink">
                  {formatCompactNumber(total)} resultados
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickFilters.map((chip) => (
                  <TrackedLink
                    key={chip.label}
                    href={createExploreUrl(filters, chip.patch)}
                    eventName="explore_quick_filter"
                    eventParams={{ label: chip.label }}
                    className="rounded-full border border-platinum bg-white px-3 py-1.5 text-xs font-semibold text-ink/80 transition-colors hover:border-khaki/45 hover:bg-khaki-light/40"
                  >
                    {chip.label}
                  </TrackedLink>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <TrackedLink
                  href={createExploreUrl(filters, { body: "all" })}
                  eventName="explore_filter_category"
                  eventParams={{ category: "all" }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filters.body === "all"
                      ? "border-khaki bg-khaki-light text-ink"
                      : "border-platinum bg-white text-ink/75 hover:border-khaki/45"
                  }`}
                >
                  Todos ({marketplaceVehicles.length})
                </TrackedLink>
                {bodyCounts.map((entry) => (
                  <TrackedLink
                    key={entry.category}
                    href={createExploreUrl(filters, { body: entry.category })}
                    eventName="explore_filter_category"
                    eventParams={{ category: entry.category }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filters.body === entry.category
                        ? "border-khaki bg-khaki-light text-ink"
                        : "border-platinum bg-white text-ink/75 hover:border-khaki/45"
                    }`}
                  >
                    {entry.category} ({entry.count})
                  </TrackedLink>
                ))}
              </div>

              {activeFilterLabels.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilterLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-platinum bg-platinum/40 px-3 py-1 text-xs font-medium text-ink/80"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {paginatedVehicles.length === 0 ? (
              <div className="rounded-2xl border border-platinum bg-white p-8 text-center">
                <h2 className="font-heading text-2xl font-semibold text-ink">No encontramos resultados</h2>
                <p className="mt-3 text-sm text-ink/70">Ajusta presupuesto, ubicacion o carroceria para ampliar el catalogo.</p>
                <TrackedLink
                  href={CLEAR_FILTERS_URL}
                  eventName="explore_empty_state_reset"
                  eventParams={{ location: "explore_empty_state" }}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-khaki px-4 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
                >
                  Ver todo el inventario
                </TrackedLink>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {paginatedVehicles.map((vehicle) => (
                  <article
                    key={vehicle.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-platinum bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-khaki/45 hover:shadow-[0_20px_45px_-38px_rgba(44,44,44,0.75)]"
                  >
                    <TrackedLink
                      href={`/app/explorar/${vehicle.slug}`}
                      eventName="explore_vehicle_open"
                      eventParams={{ location: "explore_card", vehicleId: vehicle.id }}
                      className="flex flex-1 flex-col"
                    >
                      <div className="relative aspect-[16/10] bg-[radial-gradient(circle_at_top,_#f8f8f5,_#e8e5db)] p-4">
                        <Image
                          src={vehicle.coverImage}
                          alt={vehicle.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
                          className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
                          unoptimized
                        />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold text-white">Verificado</span>
                          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink">
                            {vehicle.condition}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h2 className="min-h-[3.7rem] overflow-hidden font-heading text-xl font-semibold text-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                          {vehicle.title}
                        </h2>

                        <p className="mt-3 text-2xl font-bold text-ink">{formatCurrencyClp(vehicle.priceClp)}</p>
                        <p className="mt-1 text-sm text-ink/70">{formatKm(vehicle.km)} • {vehicle.location}</p>

                        <div className="mt-3 space-y-1 text-xs uppercase tracking-wide text-ink/60">
                          <p>{vehicle.bodyStyle}</p>
                          <p>{vehicle.fuelType} • {vehicle.transmission}</p>
                          <p>{vehicle.dealer}</p>
                        </div>

                        <div className="mt-3 rounded-xl border border-platinum bg-platinum/25 p-3">
                          <p className="text-xs font-medium text-ink/70">Reserva desde</p>
                          <p className="text-sm font-semibold text-ink">{formatCurrencyClp(vehicle.reservationFeeClp)}</p>
                        </div>
                      </div>
                    </TrackedLink>

                    <div className="border-t border-platinum px-5 py-4">
                      <div className="grid grid-cols-2 gap-2">
                        <TrackedLink
                          href={`/app/explorar/${vehicle.slug}#reservar`}
                          eventName="explore_vehicle_reserve"
                          eventParams={{ location: "explore_card", vehicleId: vehicle.id }}
                          className="inline-flex h-10 items-center justify-center rounded-md border border-ink text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
                        >
                          Reservar
                        </TrackedLink>
                        <TrackedLink
                          href={`/app/explorar/${vehicle.slug}#comprar`}
                          eventName="explore_vehicle_buy"
                          eventParams={{ location: "explore_card", vehicleId: vehicle.id }}
                          className="inline-flex h-10 items-center justify-center rounded-md bg-khaki text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
                        >
                          Comprar
                        </TrackedLink>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {totalPages > 1 ? (
              <nav className="flex items-center justify-center gap-2 pt-2">
                <TrackedLink
                  href={buildExploreUrl({ ...filters, page: Math.max(1, currentPage - 1) })}
                  eventName="explore_pagination"
                  eventParams={{ direction: "prev", page: currentPage - 1 }}
                  className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold transition-colors ${
                    currentPage === 1
                      ? "pointer-events-none border-platinum text-ink/30"
                      : "border-ink text-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  Anterior
                </TrackedLink>

                {visiblePageNumbers.map((pageNumber) => (
                  <TrackedLink
                    key={pageNumber}
                    href={buildExploreUrl({ ...filters, page: pageNumber })}
                    eventName="explore_pagination"
                    eventParams={{ direction: "page", page: pageNumber }}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors ${
                      pageNumber === currentPage
                        ? "border-khaki bg-khaki-light text-ink"
                        : "border-platinum text-ink hover:border-khaki/45"
                    }`}
                  >
                    {pageNumber}
                  </TrackedLink>
                ))}

                <TrackedLink
                  href={buildExploreUrl({ ...filters, page: Math.min(totalPages, currentPage + 1) })}
                  eventName="explore_pagination"
                  eventParams={{ direction: "next", page: currentPage + 1 }}
                  className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold transition-colors ${
                    currentPage === totalPages
                      ? "pointer-events-none border-platinum text-ink/30"
                      : "border-ink text-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  Siguiente
                </TrackedLink>
              </nav>
            ) : null}
          </div>
        </section>

        <p className="mt-10 text-sm text-ink/60">
          Inventario unificado desde dealers C4R, Chileautos y FullMotor. Valida disponibilidad, version y condiciones con el vendedor antes de cerrar.
        </p>
      </div>
    </main>
  );
}
