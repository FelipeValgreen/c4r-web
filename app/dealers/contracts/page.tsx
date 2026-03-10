import Link from "next/link";
import { getDealerSnapshot } from "@/lib/dealers-store";
import { requireDealerSession } from "@/lib/dealer-session-server";

export const metadata = {
  title: "Contratos Dealers | C4R",
  description: "Estado documental de cada operacion comercial.",
};

export const dynamic = "force-dynamic";

function statusPill(status: string) {
  if (status === "firmado") {
    return "bg-green-100 text-green-700";
  }

  if (status === "revision") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-700";
}

export default async function DealersContractsPage() {
  const session = await requireDealerSession();
  const snapshot = await getDealerSnapshot(session.dealerId);
  const dealerContracts = snapshot.contracts;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h1 className="font-heading text-3xl font-bold text-ink">Contratos</h1>
        <p className="mt-2 text-sm text-ink/70">Revision, firma y seguimiento de documentos de compra/venta.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-platinum bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-platinum text-sm">
            <thead className="bg-platinum/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Orden</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Archivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {dealerContracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-4 py-3 font-semibold text-ink">{contract.type}</td>
                  <td className="px-4 py-3 text-ink/80">{contract.order}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    {contract.fileLabel && contract.requestHref ? (
                      <Link href={contract.requestHref} className="font-semibold text-khaki hover:text-khaki-dark">
                        {contract.fileLabel}
                      </Link>
                    ) : (
                      "Sin archivo"
                    )}
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
