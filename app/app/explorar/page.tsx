import Image from "next/image";
import type { Metadata } from "next";
import TrackedLink from "@/components/TrackedLink";
import { c4rVehicles, formatCurrencyClp, formatKm } from "@/lib/chileautos-vehicles";

export const metadata: Metadata = {
  title: "Explorar autos verificados | C4R",
  description: "Catalogo de vehiculos reales con chequeo oficial, ficha completa y opciones de reserva o compra.",
  alternates: {
    canonical: "/app/explorar",
  },
  openGraph: {
    title: "Explorar autos verificados | C4R",
    description: "Catalogo de vehiculos reales con chequeo oficial, ficha completa y opciones de reserva o compra.",
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
    description: "Catalogo de vehiculos reales con chequeo oficial, ficha completa y opciones de reserva o compra.",
    images: ["/og-c4r.svg"],
  },
};

export default function ExplorePage() {
  const vehicles = [...c4rVehicles].sort((left, right) => left.priceClp - right.priceClp);
  const categories = Array.from(new Set(vehicles.map((vehicle) => vehicle.bodyStyle))).slice(0, 4);

  return (
    <main className="min-h-screen bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl">Autos verificados</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Inventario con modelos reales, precios de referencia y ficha completa para reservar o comprar.
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

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full border border-khaki bg-khaki-light px-4 py-1.5 text-sm font-semibold text-ink">Todos</span>
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-platinum bg-white px-4 py-1.5 text-sm font-medium text-gray-700"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
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
                <div className="relative aspect-[4/3] bg-[linear-gradient(145deg,#f7f7f4,#e6e4db)]">
                  <Image
                    src={vehicle.coverImage}
                    alt={vehicle.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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

        <p className="mt-8 text-sm text-gray-500">
          Datos referenciales extraidos de {c4rVehicles[0]?.source ?? "Chileautos"}. Verifica disponibilidad y condiciones en la ficha de cada auto.
        </p>
      </div>
    </main>
  );
}
