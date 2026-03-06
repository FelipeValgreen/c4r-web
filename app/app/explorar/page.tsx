import Image from "next/image";
import type { Metadata } from "next";
import TrackedLink from "@/components/TrackedLink";

const vehicles = [
  { model: "Toyota Corolla 2020", price: "$12.500.000", city: "Santiago", km: "45.000 km" },
  { model: "Kia Sportage 2021", price: "$16.900.000", city: "Concepción", km: "38.000 km" },
  { model: "Mazda CX-5 2019", price: "$15.200.000", city: "Valparaíso", km: "59.000 km" },
  { model: "Hyundai Tucson 2020", price: "$14.750.000", city: "Viña del Mar", km: "51.000 km" },
  { model: "Peugeot 3008 2021", price: "$18.300.000", city: "La Serena", km: "28.000 km" },
  { model: "Subaru XV 2019", price: "$13.990.000", city: "Temuco", km: "63.000 km" },
];

export const metadata: Metadata = {
  title: "Explorar autos verificados | C4R",
  description: "Catálogo de vehículos verificados con chequeo oficial y pago protegido.",
  alternates: {
    canonical: "/app/explorar",
  },
  openGraph: {
    title: "Explorar autos verificados | C4R",
    description: "Catálogo de vehículos verificados con chequeo oficial y pago protegido.",
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
    description: "Catálogo de vehículos verificados con chequeo oficial y pago protegido.",
    images: ["/og-c4r.svg"],
  },
};

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl">Autos verificados</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Cada publicación en C4R incluye validación técnica y legal para que compres con confianza.
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
          <span className="rounded-full border border-platinum bg-white px-4 py-1.5 text-sm font-medium text-gray-700">
            Todos
          </span>
          <span className="rounded-full border border-platinum bg-white px-4 py-1.5 text-sm font-medium text-gray-700">
            Sedan
          </span>
          <span className="rounded-full border border-platinum bg-white px-4 py-1.5 text-sm font-medium text-gray-700">
            SUV
          </span>
          <span className="rounded-full border border-platinum bg-white px-4 py-1.5 text-sm font-medium text-gray-700">
            Bajo 60.000 km
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article
              key={`${vehicle.model}-${vehicle.city}`}
              className="overflow-hidden rounded-2xl border border-platinum bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-[linear-gradient(145deg,#f7f7f4,#e6e4db)]">
                <Image
                  src="/car-placeholder.svg"
                  alt={vehicle.model}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-xl font-semibold text-ink">{vehicle.model}</h2>
                  <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">Verificado</span>
                </div>
                <p className="mt-3 text-base text-gray-700">{vehicle.price}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {vehicle.km} • {vehicle.city}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
