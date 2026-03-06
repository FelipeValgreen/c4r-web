const reportBlocks = [
  "Ventas por mes",
  "Rotacion de stock",
  "Margen bruto",
  "Tiempo promedio de cierre",
  "Top asesores",
  "Fuentes de leads",
];

export const metadata = {
  title: "Reportes Dealers | C4R",
  description: "Metricas clave de operacion y conversion para dealers.",
};

export default function DealersReportsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h1 className="font-heading text-3xl font-bold text-ink">Reportes</h1>
        <p className="mt-2 text-sm text-ink/70">Vista ejecutiva de volumen, conversion y rentabilidad.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportBlocks.map((title, index) => (
          <article key={title} className="rounded-2xl border border-platinum bg-white p-5">
            <p className="text-sm font-semibold text-ink">{title}</p>
            <div className="mt-4 h-40 rounded-xl bg-platinum/50 p-4">
              <div className="flex h-full items-end gap-2">
                {[42, 58, 37, 66, 49, 72].map((height, barIndex) => (
                  <div
                    key={`${index}-${barIndex}`}
                    className="w-full rounded-t bg-khaki/70"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
