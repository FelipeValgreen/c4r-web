import { financingRequests, formatClp, formatDate } from "@/app/dealers/_data";

export const metadata = {
  title: "Financiamiento Dealers | C4R",
  description: "Seguimiento de solicitudes de financiamiento del dealer.",
};

function statusPill(status: string) {
  if (status === "aprobada") {
    return "bg-green-100 text-green-700";
  }

  if (status === "evaluando") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "rechazada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

export default function DealersFinancingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h1 className="font-heading text-3xl font-bold text-ink">Financiamiento</h1>
        <p className="mt-2 text-sm text-ink/70">Control de solicitudes enviadas y estado de evaluacion bancaria.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Total solicitudes</p>
          <p className="mt-2 text-2xl font-bold text-ink">{financingRequests.length}</p>
        </article>
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Aprobadas</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {financingRequests.filter((req) => req.status === "aprobada").length}
          </p>
        </article>
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">En evaluacion</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {financingRequests.filter((req) => req.status === "evaluando").length}
          </p>
        </article>
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Rechazadas</p>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {financingRequests.filter((req) => req.status === "rechazada").length}
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-platinum bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-platinum text-sm">
            <thead className="bg-platinum/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Vehiculo</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {financingRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-3 font-semibold text-ink">{request.id}</td>
                  <td className="px-4 py-3 text-ink/80">{request.customer}</td>
                  <td className="px-4 py-3 text-ink/80">{request.vehicle}</td>
                  <td className="px-4 py-3 text-ink/80">{formatClp(request.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{formatDate(request.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
