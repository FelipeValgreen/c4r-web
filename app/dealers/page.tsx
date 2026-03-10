import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Car,
  CircleDollarSign,
  ClipboardList,
  Globe2,
  Plus,
  Users,
  Wrench,
} from "lucide-react";
import { formatClp, formatDate } from "@/app/dealers/_data";
import { getDealerSnapshot } from "@/lib/dealers-store";
import { requireDealerSession } from "@/lib/dealer-session-server";

export const metadata = {
  title: "Dashboard Dealers | C4R",
  description: "Panel operativo para concesionarios y equipos comerciales.",
};

export const dynamic = "force-dynamic";

function statusPill(status: string) {
  if (status === "disponible" || status === "aprobada" || status === "cerrado") {
    return "bg-green-100 text-green-700";
  }

  if (status === "reservado" || status === "evaluando" || status === "en progreso" || status === "ofertas" || status === "enviada") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "vendido" || status === "rechazada" || status === "completada") {
    return "bg-slate-200 text-slate-700";
  }

  if (status === "borrador") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-blue-100 text-blue-700";
}

export default async function DealersDashboardPage() {
  const session = await requireDealerSession();
  const snapshot = await getDealerSnapshot(session.dealerId);
  const dealerVehicles = snapshot.vehicles;
  const dealerLeads = snapshot.leads;
  const dealerTasks = snapshot.tasks;

  const totalStock = dealerVehicles.filter((vehicle) => vehicle.status !== "vendido").length;
  const activeLeads = dealerLeads.filter((lead) => lead.stage !== "cerrado").length;
  const monthSales = dealerVehicles.filter((vehicle) => vehicle.status === "vendido").length;
  const monthRevenue = dealerVehicles
    .filter((vehicle) => vehicle.status === "vendido")
    .reduce((sum, vehicle) => sum + vehicle.price, 0);

  const kpis = [
    {
      label: "Vehiculos en stock",
      value: String(totalStock),
      detail: "listos para gestion comercial",
      icon: Car,
    },
    {
      label: "Leads activos",
      value: String(activeLeads),
      detail: "con seguimiento abierto",
      icon: Users,
    },
    {
      label: "Ventas del mes",
      value: String(monthSales),
      detail: "cierres confirmados",
      icon: CircleDollarSign,
    },
    {
      label: "Ingresos del mes",
      value: formatClp(monthRevenue),
      detail: "facturacion acumulada",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-khaki-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
              Dealers Dashboard
            </p>
            <h1 className="font-heading text-3xl font-bold text-ink">Operacion comercial en tiempo real</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/70">
              Administra inventario, leads, financiamiento y contratos desde un solo panel operativo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dealers/inventory"
              className="inline-flex items-center justify-center rounded-lg border border-platinum px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-platinum"
            >
              Ver inventario
            </Link>
            {session.role === "admin" ? (
              <Link
                href="/dealers/registro"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-khaki px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
              >
                <Plus className="h-4 w-4" />
                Nuevo dealer
              </Link>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-xs text-ink/65">
          Registros dealer pendientes:{" "}
          <span className="font-semibold text-ink">
            {snapshot.registrations.filter((registration) => registration.status === "pendiente").length}
          </span>
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <article key={kpi.label} className="rounded-2xl border border-platinum bg-white p-5">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-khaki-light text-ink">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold text-ink">{kpi.value}</p>
              <p className="mt-1 text-xs text-ink/60">{kpi.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-platinum bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-ink">Leads recientes</h2>
            <Link href="/dealers/leads" className="text-sm font-semibold text-khaki hover:text-khaki-dark">
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {dealerLeads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-platinum p-4"
              >
                <div>
                  <p className="font-semibold text-ink">{lead.customer}</p>
                  <p className="text-sm text-ink/70">{lead.interestVehicle}</p>
                  <p className="text-xs text-ink/60">
                    {lead.phone} • {formatDate(lead.createdAt)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(lead.stage)}`}>
                  {lead.stage}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-platinum bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-ink">Inventario destacado</h2>
            <Link href="/dealers/inventory" className="text-sm font-semibold text-khaki hover:text-khaki-dark">
              Administrar
            </Link>
          </div>

          <div className="space-y-4">
            {dealerVehicles.slice(0, 3).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center gap-4 rounded-xl border border-platinum p-3">
                <Image
                  src={vehicle.image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  width={192}
                  height={128}
                  className="h-16 w-24 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                  </p>
                  <p className="text-sm text-ink/70">{formatClp(vehicle.price)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h2 className="mb-4 font-heading text-xl font-semibold text-ink">Acciones rapidas</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Link href="/dealers/tasks" className="rounded-xl border border-platinum p-4 transition-colors hover:bg-khaki-light/40">
            <ClipboardList className="mb-3 h-5 w-5 text-khaki" />
            <p className="font-semibold text-ink">Tareas</p>
            <p className="text-sm text-ink/70">{dealerTasks.length} actividades asignadas</p>
          </Link>
          <Link href="/dealers/channels" className="rounded-xl border border-platinum p-4 transition-colors hover:bg-khaki-light/40">
            <Globe2 className="mb-3 h-5 w-5 text-khaki" />
            <p className="font-semibold text-ink">Canales</p>
            <p className="text-sm text-ink/70">Distribucion omnicanal por unidad</p>
          </Link>
          <Link href="/dealers/financing" className="rounded-xl border border-platinum p-4 transition-colors hover:bg-khaki-light/40">
            <CircleDollarSign className="mb-3 h-5 w-5 text-khaki" />
            <p className="font-semibold text-ink">Financiamiento</p>
            <p className="text-sm text-ink/70">Solicitudes y estado bancario</p>
          </Link>
          <Link href="/dealers/contracts" className="rounded-xl border border-platinum p-4 transition-colors hover:bg-khaki-light/40">
            <Wrench className="mb-3 h-5 w-5 text-khaki" />
            <p className="font-semibold text-ink">Contratos</p>
            <p className="text-sm text-ink/70">Documentos en revision y firma</p>
          </Link>
          <Link href="/dealers/reports" className="rounded-xl border border-platinum p-4 transition-colors hover:bg-khaki-light/40">
            <BarChart3 className="mb-3 h-5 w-5 text-khaki" />
            <p className="font-semibold text-ink">Reportes</p>
            <p className="text-sm text-ink/70">Metricas de conversion y margen</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
