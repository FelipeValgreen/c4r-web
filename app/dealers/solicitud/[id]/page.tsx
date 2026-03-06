import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { dealerLeads, dealerVehicles, formatClp, formatDate } from "@/app/dealers/_data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `Solicitud ${id} | Dealers C4R`,
    description: "Detalle de solicitud comercial en dashboard dealers.",
  };
}

export default async function DealerRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vehicle = dealerVehicles.find((item) => item.id === id);
  const lead = dealerLeads.find((item) => item.id === id);

  if (!vehicle && !lead) {
    notFound();
  }

  const title = vehicle
    ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
    : (lead?.interestVehicle ?? "Solicitud dealer");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Solicitud {id}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink/70">Detalle operativo para seguimiento comercial y cierre.</p>
      </section>

      {vehicle ? (
        <section className="grid gap-6 rounded-2xl border border-platinum bg-white p-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Image
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            width={900}
            height={650}
            className="h-52 w-full rounded-xl object-cover lg:h-full"
          />
          <div className="space-y-3">
            <p className="text-sm text-ink/70">
              Estado: <span className="font-semibold capitalize text-ink">{vehicle.status}</span>
            </p>
            <p className="text-sm text-ink/70">
              Precio publicado: <span className="font-semibold text-ink">{formatClp(vehicle.price)}</span>
            </p>
            <p className="text-sm text-ink/70">
              Kilometraje: <span className="font-semibold text-ink">{vehicle.km.toLocaleString("es-CL")} km</span>
            </p>
            <p className="text-sm text-ink/70">
              Fecha publicacion: <span className="font-semibold text-ink">{formatDate(vehicle.publishedAt)}</span>
            </p>
          </div>
        </section>
      ) : null}

      {lead ? (
        <section className="rounded-2xl border border-platinum bg-white p-6">
          <h2 className="font-heading text-xl font-semibold text-ink">Lead asociado</h2>
          <div className="mt-4 grid gap-3 text-sm text-ink/80 md:grid-cols-2">
            <p>
              Cliente: <span className="font-semibold text-ink">{lead.customer}</span>
            </p>
            <p>
              Telefono: <span className="font-semibold text-ink">{lead.phone}</span>
            </p>
            <p>
              Asignado: <span className="font-semibold text-ink">{lead.assignedTo}</span>
            </p>
            <p>
              Fecha: <span className="font-semibold text-ink">{formatDate(lead.createdAt)}</span>
            </p>
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/dealers/inventory" className="rounded-lg border border-platinum px-4 py-2 text-sm font-semibold text-ink hover:bg-platinum">
          Volver a inventario
        </Link>
        <Link href="/dealers/leads" className="rounded-lg bg-khaki px-4 py-2 text-sm font-semibold text-ink hover:bg-khaki-dark">
          Ir a leads
        </Link>
      </div>
    </div>
  );
}
