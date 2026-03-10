import { formatClp } from "@/app/dealers/_data";
import { getDealerSnapshot } from "@/lib/dealers-store";

export const metadata = {
  title: "Reportes Dealers | C4R",
  description: "Metricas clave de operacion y conversion para dealers.",
};

export const dynamic = "force-dynamic";

export default async function DealersReportsPage() {
  const snapshot = await getDealerSnapshot();

  const totalStock = snapshot.vehicles.filter((vehicle) => vehicle.status !== "vendido").length;
  const sold = snapshot.vehicles.filter((vehicle) => vehicle.status === "vendido");
  const soldCount = sold.length;
  const soldRevenue = sold.reduce((acc, vehicle) => acc + vehicle.price, 0);
  const activeLeads = snapshot.leads.filter((lead) => lead.stage !== "cerrado").length;
  const closedLeads = snapshot.leads.filter((lead) => lead.stage === "cerrado").length;
  const conversion = snapshot.leads.length > 0 ? Math.round((closedLeads / snapshot.leads.length) * 100) : 0;

  const cards = [
    { title: "Stock activo", value: String(totalStock), detail: "vehiculos listos para venta" },
    { title: "Leads activos", value: String(activeLeads), detail: "con seguimiento en curso" },
    { title: "Ventas cerradas", value: String(soldCount), detail: `conversion ${conversion}%` },
    { title: "Ingresos confirmados", value: formatClp(soldRevenue), detail: "facturacion acumulada" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h1 className="font-heading text-3xl font-bold text-ink">Reportes</h1>
        <p className="mt-2 text-sm text-ink/70">Vista ejecutiva de volumen, conversion y rentabilidad.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-platinum bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">{card.title}</p>
            <p className="mt-2 text-2xl font-bold text-ink">{card.value}</p>
            <p className="mt-1 text-xs text-ink/60">{card.detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
