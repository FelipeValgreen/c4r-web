import Image from "next/image";
import type { Metadata } from "next";
import TrackedLink from "@/components/TrackedLink";
import { c4rVehicles, formatCurrencyClp, formatKm, vehicleCategories } from "@/lib/chileautos-vehicles";

type SearchParams = {
  q?: string | string[];
  body?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

type SortMode = "recommended" | "price_asc" | "price_desc" | "year_desc" | "brand_asc";

const PAGE_SIZE = 24;

const sortModes: Record<SortMode, string> = {
  recommended: "Recomendados",
  price_asc: "Precio menor a mayor",
  price_desc: "Precio mayor a menor",
  year_desc: "Más nuevos",
  brand_asc: "Marca A-Z",
};

export const metadata: Metadata = {
  title: "Explorar autos verificados | C4R",
  description:
    "Catalogo de vehiculos reales con filtros por categoria, buscador, orden inteligente y ficha completa con compra o reserva.",
  alternates: {
    canonical: "/app/explorar",
  },
  openGraph: {
    title: "Explorar autos verificados | C4R",
    description:
      "Catalogo de vehiculos reales con filtros por categoria, buscador, orden inteligente y ficha completa con compra o reserva.",
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
      "Catalogo de vehiculos reales con filtros por categoria, buscador, orden inteligente y ficha completa con compra o reserva.",
    images: ["/og-c4r.svg"],
  },
};

function getValue(value: string | string[] | undefined): string {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] ?? "" : value;
}

function normalizeSort(value: string): SortMode {
  const availableSorts = Object.keys(sortModes) as SortMode[];
  if (availableSorts.includes(value as SortMode)) {
    return value as SortMode;
  }

  return "recommended";
}

function createExploreUrl({
  query,
  body,
  sort,
  page,
}: {
  query: string;
  body: string;
  sort: SortMode;
  page: number;
}): string {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (body && body !== "all") {
    params.set("body", body);
  }

  if (sort !== "recommended") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `/app/explorar?${queryString}` : "/app/explorar";
}

function sortVehicles(sortMode: SortMode, vehicles: typeof c4rVehicles) {
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
    case "brand_asc":
      return cloned.sort((left, right) => left.make.localeCompare(right.make, "es"));
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

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = getValue(params.q).trim();
  const body = getValue(params.body).trim() || "all";
  const sort = normalizeSort(getValue(params.sort).trim());
  const requestedPage = Number(getValue(params.page));
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

  const lowerQuery = query.toLowerCase();

  const filteredVehicles = c4rVehicles.filter((vehicle) => {
    const matchesBody = body === "all" ? true : vehicle.bodyStyle === body;

    if (!matchesBody) {
      return false;
    }

    if (!lowerQuery) {
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
      vehicle.location,
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(lowerQuery);
  });

  const sortedVehicles = sortVehicles(sort, filteredVehicles);

  const total = sortedVehicles.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedVehicles = sortedVehicles.slice(pageStart, pageStart + PAGE_SIZE);

  const categoryCounts = vehicleCategories.map((category) => ({
    category,
    count: c4rVehicles.filter((vehicle) => vehicle.bodyStyle === category).length,
  }));

  const visiblePageNumbers = [];
  for (let candidate = Math.max(1, currentPage - 2); candidate <= Math.min(totalPages, currentPage + 2); candidate += 1) {
    visiblePageNumbers.push(candidate);
  }

  const clearFiltersUrl = "/app/explorar";

  return (
    <main className="min-h-screen bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl">Autos verificados</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
              Inventario real de Chileautos con fichas completas, compra o reserva protegida y filtros para encontrar rapido el auto ideal.
            </p>
          </div>
          <TrackedLink
            href="/vende-rapido"
            eventName="explore_cta_publish"
            eventParams={{ location: "explore_header" }}
            className="inline-flex h-10 items-center justify-center rounded-md bg-khaki px-5 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
          >
            Publicar mi auto
          </TrackedLink>
        </div>

        <section className="mt-8 rounded-2xl border border-platinum bg-platinum/20 p-4 sm:p-5">
          <form action="/app/explorar" method="get" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px_auto]">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar por marca, modelo, version o categoria"
              className="h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
            />

            <select
              name="sort"
              defaultValue={sort}
              className="h-11 rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
            >
              {(Object.keys(sortModes) as SortMode[]).map((sortKey) => (
                <option key={sortKey} value={sortKey}>
                  {sortModes[sortKey]}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-5 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
            >
              Aplicar filtros
            </button>

            {body !== "all" ? <input type="hidden" name="body" value={body} /> : null}
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <TrackedLink
              href={createExploreUrl({ query, body: "all", sort, page: 1 })}
              eventName="explore_filter_category"
              eventParams={{ category: "all" }}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                body === "all" ? "border border-khaki bg-khaki-light text-ink" : "border border-platinum bg-white text-gray-700"
              }`}
            >
              Todos ({c4rVehicles.length})
            </TrackedLink>

            {categoryCounts.map((entry) => (
              <TrackedLink
                key={entry.category}
                href={createExploreUrl({ query, body: entry.category, sort, page: 1 })}
                eventName="explore_filter_category"
                eventParams={{ category: entry.category }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  body === entry.category
                    ? "border-khaki bg-khaki-light text-ink"
                    : "border-platinum bg-white text-gray-700 hover:border-khaki/40"
                }`}
              >
                {entry.category} ({entry.count})
              </TrackedLink>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <p>
            Mostrando {paginatedVehicles.length} de {total} resultados
            {query ? ` para "${query}"` : ""}.
          </p>
          {(query || body !== "all" || sort !== "recommended") && (
            <TrackedLink
              href={clearFiltersUrl}
              eventName="explore_clear_filters"
              eventParams={{ location: "explore_toolbar" }}
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              Limpiar filtros
            </TrackedLink>
          )}
        </div>

        {paginatedVehicles.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-platinum bg-white p-8 text-center">
            <h2 className="font-heading text-2xl font-semibold text-ink">No encontramos resultados</h2>
            <p className="mt-3 text-sm text-gray-600">Prueba con otra marca, elimina filtros o vuelve al listado completo.</p>
            <TrackedLink
              href={clearFiltersUrl}
              eventName="explore_empty_state_reset"
              eventParams={{ location: "explore_empty_state" }}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-khaki px-4 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
            >
              Ver todos los autos
            </TrackedLink>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedVehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="overflow-hidden rounded-2xl border border-platinum bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <TrackedLink
                  href={`/app/explorar/${vehicle.slug}`}
                  eventName="explore_vehicle_open"
                  eventParams={{ location: "explore_card", vehicleId: vehicle.id }}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_top,#f8f8f5,#e8e5db)] p-4">
                    <Image
                      src={vehicle.coverImage}
                      alt={vehicle.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-heading text-xl font-semibold text-ink">{vehicle.title}</h2>
                      <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">Verificado</span>
                    </div>
                    <p className="mt-3 text-base font-semibold text-ink">{formatCurrencyClp(vehicle.priceClp)}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatKm(vehicle.km)} • {vehicle.location}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {vehicle.bodyStyle} • {vehicle.fuelType} • {vehicle.transmission}
                    </p>
                  </div>
                </TrackedLink>

                <div className="border-t border-platinum px-6 py-4">
                  <div className="grid grid-cols-2 gap-3">
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

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2">
            <TrackedLink
              href={createExploreUrl({ query, body, sort, page: Math.max(1, currentPage - 1) })}
              eventName="explore_pagination"
              eventParams={{ direction: "prev", page: currentPage - 1 }}
              className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold transition-colors ${
                currentPage === 1
                  ? "pointer-events-none border-platinum text-gray-400"
                  : "border-ink text-ink hover:bg-ink hover:text-white"
              }`}
            >
              Anterior
            </TrackedLink>

            {visiblePageNumbers.map((pageNumber) => (
              <TrackedLink
                key={pageNumber}
                href={createExploreUrl({ query, body, sort, page: pageNumber })}
                eventName="explore_pagination"
                eventParams={{ direction: "page", page: pageNumber }}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors ${
                  pageNumber === currentPage
                    ? "border-khaki bg-khaki-light text-ink"
                    : "border-platinum text-ink hover:border-khaki/40"
                }`}
              >
                {pageNumber}
              </TrackedLink>
            ))}

            <TrackedLink
              href={createExploreUrl({ query, body, sort, page: Math.min(totalPages, currentPage + 1) })}
              eventName="explore_pagination"
              eventParams={{ direction: "next", page: currentPage + 1 }}
              className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold transition-colors ${
                currentPage === totalPages
                  ? "pointer-events-none border-platinum text-gray-400"
                  : "border-ink text-ink hover:bg-ink hover:text-white"
              }`}
            >
              Siguiente
            </TrackedLink>
          </nav>
        )}

        <p className="mt-8 text-sm text-gray-500">
          Datos referenciales extraidos de {c4rVehicles[0]?.source ?? "Chileautos"}. Verifica disponibilidad, version y condiciones comerciales en cada ficha.
        </p>
      </div>
    </main>
  );
}
