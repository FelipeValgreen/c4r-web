import Link from "next/link";
import Image from "next/image";
import { Filter, Plus, Search } from "lucide-react";
import { dealerVehicles, formatClp, formatDate } from "@/app/dealers/_data";

export const metadata = {
  title: "Inventario Dealers | C4R",
  description: "Gestion de inventario para concesionarios en C4R.",
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

export default function DealersInventoryPage() {
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
            <button className="inline-flex items-center gap-2 rounded-lg border border-platinum px-4 py-2 text-sm font-semibold text-ink hover:bg-platinum">
              <Filter className="h-4 w-4" />
              Filtros
            </button>
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
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
          <input
            type="search"
            placeholder="Buscar por marca, modelo o ano"
            className="w-full rounded-lg border border-platinum px-10 py-3 text-sm text-ink outline-none ring-khaki/40 placeholder:text-ink/50 focus:ring-2"
          />
        </label>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {dealerVehicles.map((vehicle) => (
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
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(vehicle.status)}`}>
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
      </section>
    </div>
  );
}
