import { getDealerSnapshot } from "@/lib/dealers-store";
import { requireDealerSession } from "@/lib/dealer-session-server";

export const metadata = {
  title: "Tareas Dealers | C4R",
  description: "Plan de seguimiento y tareas del equipo comercial.",
};

export const dynamic = "force-dynamic";

function taskPill(status: string) {
  if (status === "completada") {
    return "bg-green-100 text-green-700";
  }

  if (status === "en progreso") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-blue-100 text-blue-700";
}

export default async function DealersTasksPage() {
  const session = await requireDealerSession();
  const snapshot = await getDealerSnapshot(session.dealerId);
  const dealerTasks = snapshot.tasks;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h1 className="font-heading text-3xl font-bold text-ink">Tareas del equipo</h1>
        <p className="mt-2 text-sm text-ink/70">Priorizacion operativa para no perder oportunidades de cierre.</p>
      </section>

      <section className="space-y-3">
        {dealerTasks.map((task) => (
          <article key={task.id} className="rounded-2xl border border-platinum bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">{task.title}</h2>
                <p className="text-sm text-ink/70">
                  Responsable: {task.owner} • Vencimiento: {task.dueLabel}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${taskPill(task.status)}`}>
                {task.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
