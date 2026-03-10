import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Globe2, RefreshCw } from "lucide-react";
import { dealerSalesChannels, type SalesChannel } from "@/app/dealers/_data";
import { getDealerChannelSnapshot, updateDealerVehicleChannel } from "@/lib/dealers-store";
import { requireDealerSession } from "@/lib/dealer-session-server";

export const metadata = {
  title: "Canales Omnicanal | C4R Dealers",
  description: "Publicacion y control omnicanal de inventario dealer en C4R.",
};

export const dynamic = "force-dynamic";

function statusPill(status: string): string {
  if (status === "publicado") {
    return "bg-green-100 text-green-700";
  }

  if (status === "pendiente") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "error") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-200 text-slate-700";
}

async function toggleChannelAction(formData: FormData) {
  "use server";

  const session = await requireDealerSession();

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const channel = String(formData.get("channel") ?? "").trim() as SalesChannel;
  const enabled = String(formData.get("enabled") ?? "").trim() === "true";

  if (!vehicleId || !dealerSalesChannels.some((entry) => entry.key === channel)) {
    return;
  }

  await updateDealerVehicleChannel(vehicleId, channel, enabled, session.dealerId);

  revalidatePath("/dealers/channels");
  revalidatePath("/dealers/inventory");
  revalidatePath("/dealers");
  revalidatePath("/app/explorar");
  revalidatePath("/");
}

export default async function DealersChannelsPage() {
  const session = await requireDealerSession();
  const rows = await getDealerChannelSnapshot(session.dealerId);
  const totalVehicles = rows.length;
  const totalPublished = rows.reduce(
    (sum, row) => sum + row.channels.filter((channel) => channel.status === "publicado").length,
    0,
  );
  const totalIssues = rows.reduce(
    (sum, row) => sum + row.channels.filter((channel) => channel.status === "error").length,
    0,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-khaki-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
              <Globe2 className="h-3.5 w-3.5" />
              Omnicanal C4R
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-ink">Distribucion de inventario por canales</h1>
            <p className="mt-2 max-w-3xl text-sm text-ink/70">
              Gestiona en un solo tablero la publicacion de cada unidad en C4R, Chileautos, Mercado Libre, Facebook Marketplace y Yapo.
            </p>
          </div>

          <Link
            href="/dealers/inventory"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-platinum px-4 text-sm font-semibold text-ink transition-colors hover:bg-platinum"
          >
            Ver inventario
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-platinum bg-platinum/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Vehiculos gestionados</p>
            <p className="mt-2 text-2xl font-bold text-ink">{new Intl.NumberFormat("es-CL").format(totalVehicles)}</p>
          </article>
          <article className="rounded-xl border border-platinum bg-platinum/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Publicaciones activas</p>
            <p className="mt-2 text-2xl font-bold text-ink">{new Intl.NumberFormat("es-CL").format(totalPublished)}</p>
          </article>
          <article className="rounded-xl border border-platinum bg-platinum/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Incidencias</p>
            <p className="mt-2 text-2xl font-bold text-ink">{new Intl.NumberFormat("es-CL").format(totalIssues)}</p>
          </article>
        </div>
      </section>

      {rows.length === 0 ? (
        <section className="rounded-2xl border border-platinum bg-white p-8 text-center">
          <h2 className="font-heading text-xl font-semibold text-ink">Aun no hay unidades para publicar</h2>
          <p className="mt-2 text-sm text-ink/70">Carga vehiculos en inventario y habilita la distribucion omnicanal.</p>
          <Link
            href="/dealers/inventory"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-khaki px-4 text-sm font-semibold text-ink"
          >
            Ir a inventario
          </Link>
        </section>
      ) : (
        <section className="space-y-4">
          {rows.map((row) => (
            <article key={row.vehicle.id} className="rounded-2xl border border-platinum bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-xl font-semibold text-ink">
                    {row.vehicle.brand} {row.vehicle.model} {row.vehicle.year}
                  </p>
                  <p className="mt-1 text-sm text-ink/70">
                    {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(
                      row.vehicle.price,
                    )} · {row.vehicle.location ?? "Santiago"} · Estado {row.vehicle.status}
                  </p>
                </div>

                <Link
                  href={`/dealers/solicitud/${row.vehicle.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-platinum px-3 text-sm font-semibold text-ink hover:bg-platinum"
                >
                  Ver ficha
                </Link>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {row.channels.map((channel) => (
                  <div key={`${row.vehicle.id}-${channel.channel}`} className="rounded-xl border border-platinum p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">
                        {dealerSalesChannels.find((entry) => entry.key === channel.channel)?.label ?? channel.channel}
                      </p>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${statusPill(channel.status)}`}>
                        {channel.status}
                      </span>
                    </div>
                    <p className="mt-2 min-h-10 text-xs text-ink/65">{channel.message}</p>
                    <form action={toggleChannelAction} className="mt-2">
                      <input type="hidden" name="vehicleId" value={row.vehicle.id} />
                      <input type="hidden" name="channel" value={channel.channel} />
                      <input type="hidden" name="enabled" value={channel.enabled ? "false" : "true"} />
                      <button
                        type="submit"
                        className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-platinum text-xs font-semibold text-ink transition-colors hover:bg-platinum"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {channel.enabled ? "Pausar" : "Activar"}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
