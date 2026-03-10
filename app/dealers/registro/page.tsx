import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Building2 } from "lucide-react";
import DealerRegistrationForm from "@/app/dealers/registro/DealerRegistrationForm";
import {
  getDealerSnapshot,
  type DealerRegistrationStatus,
  updateDealerRegistrationStatus,
} from "@/lib/dealers-store";
import { requireDealerSession } from "@/lib/dealer-session-server";

export const metadata = {
  title: "Registro Dealer | C4R",
  description: "Formulario de incorporacion para nuevos dealers en C4R.",
};

export const dynamic = "force-dynamic";

async function updateRegistrationStatusAction(formData: FormData) {
  "use server";

  const session = await requireDealerSession();
  if (session.role !== "admin") {
    return;
  }

  const registrationId = String(formData.get("registrationId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as DealerRegistrationStatus;

  if (!registrationId || !["pendiente", "activo", "rechazado"].includes(status)) {
    return;
  }

  await updateDealerRegistrationStatus(registrationId, status);

  revalidatePath("/dealers");
  revalidatePath("/dealers/registro");
}

function statusPill(status: DealerRegistrationStatus) {
  if (status === "activo") {
    return "bg-green-100 text-green-700";
  }

  if (status === "rechazado") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default async function DealerRegistrationPage() {
  const session = await requireDealerSession();
  const snapshot = await getDealerSnapshot(session.dealerId);
  const canManageRegistrations = session.role === "admin";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <Link href="/dealers" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-khaki hover:text-khaki-dark">
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>
        <h1 className="font-heading text-3xl font-bold text-ink">Registro de dealer</h1>
        <p className="mt-2 text-sm text-ink/70">Completa la informacion para activar tu cuenta comercial en C4R.</p>
      </section>

      {canManageRegistrations ? (
        <>
          <section className="rounded-2xl border border-platinum bg-white p-6">
            <div className="mb-6 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-khaki-light text-ink">
                <Building2 className="h-6 w-6" />
              </span>
              <h2 className="mt-3 font-heading text-2xl font-semibold text-ink">Informacion de la empresa</h2>
            </div>
          </section>

          <DealerRegistrationForm />
        </>
      ) : null}

      {canManageRegistrations ? (
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h2 className="font-heading text-2xl font-semibold text-ink">Solicitudes recibidas</h2>
        <p className="mt-2 text-sm text-ink/70">Aprueba o rechaza onboarding comercial de nuevos dealers.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-platinum text-sm">
            <thead className="bg-platinum/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink">Dealer</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">RUT</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Contacto</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {snapshot.registrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{registration.companyName}</p>
                    <p className="text-xs text-ink/60">{registration.address}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{registration.companyRut}</td>
                  <td className="px-4 py-3 text-ink/80">
                    <p>{registration.email}</p>
                    <p className="text-xs text-ink/60">{registration.phone}</p>
                    <p className="text-xs text-ink/60">Usuario: {registration.portalUsername}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(registration.status)}`}>
                      {registration.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <form action={updateRegistrationStatusAction}>
                        <input type="hidden" name="registrationId" value={registration.id} />
                        <input type="hidden" name="status" value="activo" />
                        <button
                          type="submit"
                          className="rounded-md border border-platinum px-2 py-1 text-xs font-semibold text-ink hover:bg-platinum"
                        >
                          Aprobar
                        </button>
                      </form>
                      <form action={updateRegistrationStatusAction}>
                        <input type="hidden" name="registrationId" value={registration.id} />
                        <input type="hidden" name="status" value="rechazado" />
                        <button
                          type="submit"
                          className="rounded-md border border-platinum px-2 py-1 text-xs font-semibold text-ink hover:bg-platinum"
                        >
                          Rechazar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : (
        <section className="rounded-2xl border border-platinum bg-white p-6">
          <h2 className="font-heading text-2xl font-semibold text-ink">Registro enviado</h2>
          <p className="mt-2 text-sm text-ink/70">
            La gestion de altas y aprobaciones la realiza el equipo administrador de C4R.
          </p>
        </section>
      )}
    </div>
  );
}
