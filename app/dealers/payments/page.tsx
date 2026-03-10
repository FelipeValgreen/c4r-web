import { formatClp, formatDate } from "@/app/dealers/_data";
import { getDealerSnapshot } from "@/lib/dealers-store";
import { requireDealerSession } from "@/lib/dealer-session-server";

export const metadata = {
  title: "Pagos Dealers | C4R",
  description: "Historial de cobros y pagos de operaciones en C4R.",
};

export const dynamic = "force-dynamic";

function statusPill(status: string) {
  if (status === "confirmado") {
    return "bg-green-100 text-green-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default async function DealersPaymentsPage() {
  const session = await requireDealerSession();
  const snapshot = await getDealerSnapshot(session.dealerId);
  const dealerPayments = snapshot.payments;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h1 className="font-heading text-3xl font-bold text-ink">Pagos</h1>
        <p className="mt-2 text-sm text-ink/70">Resumen de ordenes liquidadas y pagos pendientes.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-platinum bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-platinum text-sm">
            <thead className="bg-platinum/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Orden</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Metodo</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {dealerPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 text-ink/80">{formatDate(payment.date)}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{payment.order}</td>
                  <td className="px-4 py-3 text-ink/80">{payment.method}</td>
                  <td className="px-4 py-3 text-ink/80">{formatClp(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(payment.status)}`}>
                      {payment.status}
                    </span>
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
