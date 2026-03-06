import Link from "next/link";
import { dealerLeads, formatDate } from "@/app/dealers/_data";

export const metadata = {
  title: "Leads Dealers | C4R",
  description: "Seguimiento de oportunidades comerciales de dealers.",
};

function stagePill(stage: string) {
  if (stage === "cerrado") {
    return "bg-green-100 text-green-700";
  }

  if (stage === "oferta") {
    return "bg-amber-100 text-amber-700";
  }

  if (stage === "contactado") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-slate-200 text-slate-700";
}

export default function DealersLeadsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h1 className="font-heading text-3xl font-bold text-ink">Leads comerciales</h1>
        <p className="mt-2 text-sm text-ink/70">
          Prioriza contactos con mayor intencion de compra y asigna seguimiento.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-platinum bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-platinum text-sm">
            <thead className="bg-platinum/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Lead</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Interes</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Etapa</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Asignado</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {dealerLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{lead.customer}</p>
                    <p className="text-xs text-ink/60">{lead.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{lead.interestVehicle}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${stagePill(lead.stage)}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{lead.assignedTo}</td>
                  <td className="px-4 py-3 text-ink/80">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href="/dealers/tasks"
                      className="rounded-lg border border-platinum px-3 py-2 text-xs font-semibold text-ink hover:bg-platinum"
                    >
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
