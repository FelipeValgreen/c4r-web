import { getDealerSnapshot } from "@/lib/dealers-store";

export const metadata = {
  title: "Clientes Dealers | C4R",
  description: "Base de clientes de dealers con historial de compras.",
};

export const dynamic = "force-dynamic";

export default async function DealersCustomersPage() {
  const snapshot = await getDealerSnapshot();
  const dealerCustomers = snapshot.customers;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h1 className="font-heading text-3xl font-bold text-ink">Clientes</h1>
        <p className="mt-2 text-sm text-ink/70">Directorio comercial con contacto y actividad historica.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-platinum bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-platinum text-sm">
            <thead className="bg-platinum/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Telefono</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Ciudad</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Compras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {dealerCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 font-semibold text-ink">{customer.name}</td>
                  <td className="px-4 py-3 text-ink/80">{customer.email}</td>
                  <td className="px-4 py-3 text-ink/80">{customer.phone}</td>
                  <td className="px-4 py-3 text-ink/80">{customer.city}</td>
                  <td className="px-4 py-3 text-ink/80">{customer.purchases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
