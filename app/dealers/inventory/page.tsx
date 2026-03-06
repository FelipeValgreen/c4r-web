import Link from "next/link";
import Image from "next/image";
import { Filter, Plus, Search } from "lucide-react";
import { dealerVehicles, formatClp, formatDate } from "@/app/dealers/_data";

export const metadata = {
  title: "Inventario Dealers | C4R",
  description: "Gestion de inventario para concesionarios en C4R.",
};

type InventoryStatus = "all" | "disponible" | "reservado" | "vendido";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

function statusPill(status: string) {
  if (status === "disponible") {
    return "bg-green-100 text-green-700";
  }

  if (status === "reservado") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-700";
}

function getStatusLabel(status: InventoryStatus) {
  if (status === "all") {
    return "Todos";
  }

  if (status === "disponible") {
    return "Disponibles";
  }

  if (status === "reservado") {
    return "Reservados";
  }

  return "Vendidos";
}

export default async function DealersInventoryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q ?? "").trim();
  const rawStatus = (resolvedSearchParams.status ?? "all").toLowerCase();
  const status: InventoryStatus =
    rawStatus === "disponible" || rawStatus === "reservado" || rawStatus === "vendido"
      ? rawStatus
      : "all";

  const normalizedQuery = query.toLowerCase();

  const filteredVehicles = dealerVehicles.filter((vehicle) => {
    const matchesStatus = status === "all" ? true : vehicle.status === status;

    if (!matchesStatus) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchable = `${vehicle.brand} ${vehicle.model} ${vehicle.year} ${vehicle.id}`.toLowerCase();
    return searchable.includes(normalizedQuery);
  });

  const statusOptions: InventoryStatus[] = ["all", "disponible", "reservado", "vendido"];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-ink">Inventario de vehiculos</h1>
            <p className="mt-2 text-sm text-ink/70">
              Controla estado de unidades, precio publicado y flujo de venta.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dealers/registro"
              className="inline-flex items-center gap-2 rounded-lg bg-khaki px-4 py-2 text-sm font-semibold text-ink hover:bg-khaki-dark"
            >
              <Plus className="h-4 w-4" />
              Publicar vehiculo
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-platinum bg-white p-5">
        <form action="/dealers/inventory" method="get" className="space-y-4">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar por marca, modelo o ano"
              className="w-full rounded-lg border border-platinum px-10 py-3 text-sm text-ink outline-none ring-khaki/40 placeholder:text-ink/50 focus:ring-2"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-platinum px-3 py-1 text-xs font-semibold text-ink">
              <Filter className="h-3.5 w-3.5" />
              Estado
            </span>
            {statusOptions.map((option) => {
              const href =
                option === "all"
                  ? query
                    ? `/dealers/inventory?q=${encodeURIComponent(query)}`
                    : "/dealers/inventory"
                  : query
                    ? `/dealers/inventory?status=${option}&q=${encodeURIComponent(query)}`
                    : `/dealers/inventory?status=${option}`;

              const isActive = status === option;

              return (
                <Link
                  key={option}
                  href={href}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-khaki bg-khaki-light text-ink"
                      : "border-platinum bg-white text-ink/70 hover:bg-platinum"
                  }`}
                >
                  {getStatusLabel(option)}
                </Link>
              );
            })}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <p className="text-sm text-ink/70">
          Mostrando <span className="font-semibold text-ink">{filteredVehicles.length}</span> resultado(s)
          {status !== "all" ? ` en ${getStatusLabel(status).toLowerCase()}` : ""}.
        </p>

        {filteredVehicles.length === 0 ? (
          <div className="rounded-2xl border border-platinum bg-white p-8 text-center">
            <h2 className="font-heading text-xl font-semibold text-ink">No encontramos vehiculos con ese filtro</h2>
            <p className="mt-2 text-sm text-ink/70">
              Ajusta el estado o la busqueda para ver unidades disponibles en tu inventario.
            </p>
            <Link
              href="/dealers/inventory"
              className="mt-4 inline-flex rounded-lg border border-platinum px-4 py-2 text-sm font-semibold text-ink hover:bg-platinum"
            >
              Limpiar filtros
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <article key={vehicle.id} className="overflow-hidden rounded-2xl border border-platinum bg-white">
                <Image
                  src={vehicle.image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  width={900}
                  height={650}
                  className="h-48 w-full object-cover"
                />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-heading text-lg font-semibold text-ink">
                      {vehicle.brand} {vehicle.model} {vehicle.year}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(vehicle.status)}`}
                    >
                      {vehicle.status}
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-ink">{formatClp(vehicle.price)}</p>

                  <div className="space-y-1 text-sm text-ink/70">
                    <p>Kilometraje: {vehicle.km.toLocaleString("es-CL")} km</p>
                    <p>Publicado: {formatDate(vehicle.publishedAt)}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/dealers/solicitud/${vehicle.id}`}
                      className="flex-1 rounded-lg border border-platinum px-3 py-2 text-center text-sm font-semibold text-ink hover:bg-platinum"
                    >
                      Ver ficha
                    </Link>
                    <Link
                      href="/dealers/leads"
                      className="flex-1 rounded-lg bg-khaki px-3 py-2 text-center text-sm font-semibold text-ink hover:bg-khaki-dark"
                    >
                      Ver interesados
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
