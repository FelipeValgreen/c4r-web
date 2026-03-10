import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleDollarSign, Fuel, Gauge, MapPin, ShieldCheck } from "lucide-react";
import TrackedLink from "@/components/TrackedLink";
import VehicleActionPanel from "@/components/c4r/VehicleActionPanel";
import VehicleGallery from "@/components/c4r/VehicleGallery";
import { c4rVehicles, formatCurrencyClp, formatKm, getVehicleBySlug } from "@/lib/chileautos-vehicles";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return c4rVehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);

  if (!vehicle) {
    return {
      title: "Auto no encontrado | C4R",
      description: "La ficha del auto solicitado no esta disponible.",
    };
  }

  return {
    title: `${vehicle.title} | C4R`,
    description: `Ficha completa de ${vehicle.title}, precio ${formatCurrencyClp(vehicle.priceClp)}, opcion de reserva y compra protegida.`,
    alternates: {
      canonical: `/app/explorar/${vehicle.slug}`,
    },
    openGraph: {
      title: `${vehicle.title} | C4R`,
      description: `Ficha completa de ${vehicle.title}, precio ${formatCurrencyClp(vehicle.priceClp)}, opcion de reserva y compra protegida.`,
      url: `/app/explorar/${vehicle.slug}`,
      type: "website",
      images: [
        {
          url: vehicle.coverImage,
          width: 1200,
          height: 700,
          alt: vehicle.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${vehicle.title} | C4R`,
      description: `Ficha completa de ${vehicle.title}, precio ${formatCurrencyClp(vehicle.priceClp)}, opcion de reserva y compra protegida.`,
      images: [vehicle.coverImage],
    },
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  const specItems = [
    { label: "Carroceria", value: vehicle.bodyStyle },
    { label: "Combustible", value: vehicle.fuelType },
    { label: "Transmision", value: vehicle.transmission },
    { label: "Traccion", value: vehicle.drive },
    { label: "Puertas", value: vehicle.doors ? String(vehicle.doors) : "Por confirmar" },
    { label: "Motor", value: vehicle.engine ?? "Por confirmar" },
    {
      label: "Consumo mixto",
      value: vehicle.fuelCombined ? `${new Intl.NumberFormat("es-CL").format(vehicle.fuelCombined)} km/L` : "Por confirmar",
    },
    { label: "Kilometraje", value: formatKm(vehicle.km) },
  ];

  const sourceLabel = vehicle.source.toLowerCase().includes("fullmotor") ? "FullMotor" : "Chileautos";

  return (
    <main className="min-h-screen bg-white pb-16">
      <section className="border-b border-platinum bg-[radial-gradient(circle_at_top,_rgba(176,161,110,0.22),transparent_55%)] py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <TrackedLink
            href="/app/explorar"
            eventName="vehicle_back_to_catalog"
            eventParams={{ location: "vehicle_detail", vehicleId: vehicle.id }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/80 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catalogo
          </TrackedLink>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-khaki">Ficha verificada C4R</p>
              <h1 className="mt-2 font-heading text-4xl font-bold text-ink sm:text-5xl">{vehicle.title}</h1>
              <p className="mt-4 max-w-3xl text-base text-ink/80">{vehicle.description}</p>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm font-semibold text-success">
              Verificacion documental y tecnica incluida
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[minmax(0,1.3fr)_380px] lg:px-8">
          <div>
            <VehicleGallery title={vehicle.title} images={vehicle.gallery.length > 0 ? vehicle.gallery : [vehicle.coverImage]} />

            <div className="mt-8 rounded-2xl border border-platinum bg-white p-6">
              <h2 className="font-heading text-2xl font-semibold text-ink">Especificaciones</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {specItems.map((item) => (
                  <div key={item.label} className="rounded-lg border border-platinum bg-platinum/30 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-platinum bg-white p-6">
              <h2 className="font-heading text-2xl font-semibold text-ink">Equipamiento destacado</h2>
              <ul className="mt-5 grid gap-2 text-sm text-ink/80 sm:grid-cols-2">
                {vehicle.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-platinum bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-khaki">Precio referencial</p>
              <p className="mt-2 font-heading text-3xl font-bold text-ink">{formatCurrencyClp(vehicle.priceClp)}</p>
              <p className="mt-1 text-sm text-gray-600">{vehicle.condition} • {vehicle.year} • {formatKm(vehicle.km)}</p>

              <div className="mt-5 space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-khaki" />
                  <span>Reserva desde {formatCurrencyClp(vehicle.reservationFeeClp)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-khaki" />
                  <span>Cuota estimada desde {formatCurrencyClp(vehicle.estimatedMonthlyClp)}/mes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-khaki" />
                  <span>{vehicle.fuelType} • {vehicle.transmission}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-khaki" />
                  <span>{vehicle.location} • {vehicle.dealer}</span>
                </div>
              </div>

              {vehicle.priceBreakdown.length > 0 ? (
                <div className="mt-5 border-t border-platinum pt-4 text-sm">
                  <p className="font-semibold text-ink">Desglose de precio</p>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    {vehicle.priceBreakdown.map((item) => (
                      <li key={`${vehicle.id}-${item.type}`} className="flex items-center justify-between gap-3">
                        <span>{item.type}</span>
                        <span className="font-semibold text-ink">{formatCurrencyClp(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            <VehicleActionPanel vehicle={vehicle} />

            <section className="rounded-2xl border border-platinum bg-white p-6 text-sm text-gray-700">
              <p className="font-semibold text-ink">Fuente del inventario</p>
              <p className="mt-2">
                Datos referenciales sincronizados desde {vehicle.source}. Revisa la fuente original para validar cambios de precio o versiones.
              </p>
              <TrackedLink
                href={vehicle.sourceUrl}
                eventName="vehicle_open_source"
                eventParams={{ location: "vehicle_detail", vehicleId: vehicle.id }}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-ink px-4 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en {sourceLabel}
              </TrackedLink>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
