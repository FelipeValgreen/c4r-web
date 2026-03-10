import { revalidatePath } from "next/cache";
import { FileCheck2, Rocket, Wallet } from "lucide-react";
import { formatClp, formatDate, type FinancingProductType, type FinancingStatus } from "@/app/dealers/_data";
import {
  completeFinancingPaperwork,
  createFinancingRequest,
  getDealerSnapshot,
  rejectFinancingRequest,
  selectFinancingOffer,
  sendFinancingRequestToNetwork,
} from "@/lib/dealers-store";
import { requireDealerSession } from "@/lib/dealer-session-server";

export const metadata = {
  title: "Credito Flow Dealers | C4R",
  description: "Hub operativo de creditos para acelerar aprobaciones y disminuir papeleo.",
};

export const dynamic = "force-dynamic";

function statusPill(status: FinancingStatus) {
  if (status === "aprobada") {
    return "bg-green-100 text-green-700";
  }

  if (status === "ofertas" || status === "evaluando") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "enviada") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "rechazada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-200 text-slate-700";
}

function docPill(status: string) {
  if (status === "validado") {
    return "bg-green-100 text-green-700";
  }

  if (status === "cargado") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-700";
}

function offerPill(status: string) {
  if (status === "aprobada") {
    return "bg-green-100 text-green-700";
  }

  if (status === "rechazada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function toMoney(entry: FormDataEntryValue | null): number {
  const value = String(entry ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed);
}

function toInt(entry: FormDataEntryValue | null, fallback: number): number {
  const parsed = Number(String(entry ?? "").replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.round(parsed);
}

async function createFinancingAction(formData: FormData) {
  "use server";

  const session = await requireDealerSession();

  const customer = String(formData.get("customer") ?? "").trim();
  const rut = String(formData.get("rut") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const vehicle = String(formData.get("vehicle") ?? "").trim();
  const assignedExecutive = String(formData.get("assignedExecutive") ?? "").trim();
  const productType = String(formData.get("productType") ?? "convencional").trim() as FinancingProductType;
  const amount = toMoney(formData.get("amount"));
  const downPayment = toMoney(formData.get("downPayment"));
  const monthlyIncome = toMoney(formData.get("monthlyIncome"));
  const termMonths = toInt(formData.get("termMonths"), 36);

  if (!customer || !vehicle || amount <= 0) {
    return;
  }

  await createFinancingRequest({
    customer,
    rut,
    email,
    phone,
    vehicle,
    amount,
    downPayment,
    monthlyIncome,
    termMonths,
    productType,
    assignedExecutive,
  }, session.dealerId);

  revalidatePath("/dealers");
  revalidatePath("/dealers/financing");
  revalidatePath("/dealers/tasks");
}

async function completePaperworkAction(formData: FormData) {
  "use server";

  const session = await requireDealerSession();

  const requestId = String(formData.get("requestId") ?? "").trim();
  if (!requestId) {
    return;
  }

  await completeFinancingPaperwork(requestId, session.dealerId);
  revalidatePath("/dealers/financing");
}

async function sendToNetworkAction(formData: FormData) {
  "use server";

  const session = await requireDealerSession();

  const requestId = String(formData.get("requestId") ?? "").trim();
  if (!requestId) {
    return;
  }

  await sendFinancingRequestToNetwork(requestId, session.dealerId);
  revalidatePath("/dealers/financing");
  revalidatePath("/dealers/tasks");
}

async function selectOfferAction(formData: FormData) {
  "use server";

  const session = await requireDealerSession();

  const requestId = String(formData.get("requestId") ?? "").trim();
  const offerId = String(formData.get("offerId") ?? "").trim();
  if (!requestId || !offerId) {
    return;
  }

  await selectFinancingOffer(requestId, offerId, session.dealerId);
  revalidatePath("/dealers");
  revalidatePath("/dealers/financing");
  revalidatePath("/dealers/reports");
}

async function rejectRequestAction(formData: FormData) {
  "use server";

  const session = await requireDealerSession();

  const requestId = String(formData.get("requestId") ?? "").trim();
  if (!requestId) {
    return;
  }

  await rejectFinancingRequest(requestId, session.dealerId);
  revalidatePath("/dealers/financing");
}

export default async function DealersFinancingPage() {
  const session = await requireDealerSession();
  const snapshot = await getDealerSnapshot(session.dealerId);
  const financingRequests = snapshot.financingRequests;

  const statusCounts: Record<FinancingStatus, number> = {
    borrador: 0,
    enviada: 0,
    evaluando: 0,
    ofertas: 0,
    aprobada: 0,
    rechazada: 0,
  };

  for (const request of financingRequests) {
    statusCounts[request.status] += 1;
  }

  const docsComplete = financingRequests.filter((request) => (request.paperworkScore ?? 0) >= 100).length;
  const inNetwork = financingRequests.filter((request) => request.status === "evaluando" || request.status === "ofertas").length;
  const approvalRate = financingRequests.length > 0 ? (statusCounts.aprobada / financingRequests.length) * 100 : 0;

  const pipelineLabels: Array<{ key: FinancingStatus; label: string }> = [
    { key: "borrador", label: "Borrador" },
    { key: "enviada", label: "Lista para red" },
    { key: "evaluando", label: "Evaluando" },
    { key: "ofertas", label: "Ofertas" },
    { key: "aprobada", label: "Aprobada" },
    { key: "rechazada", label: "Rechazada" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <p className="inline-flex rounded-full bg-khaki-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
          C4R Credito Flow
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink">Orquestador de creditos sin papeleo</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink/70">
          Integra expediente digital, envio a red financiera y comparador de ofertas para acelerar cierres en automotoras.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-platinum bg-platinum/30 p-4">
            <FileCheck2 className="h-5 w-5 text-khaki" />
            <p className="mt-2 text-sm font-semibold text-ink">Expediente digital</p>
            <p className="mt-1 text-xs text-ink/65">Checklist unico para validar documentos y reducir reenvios.</p>
          </article>
          <article className="rounded-xl border border-platinum bg-platinum/30 p-4">
            <Rocket className="h-5 w-5 text-khaki" />
            <p className="mt-2 text-sm font-semibold text-ink">Envio simultaneo</p>
            <p className="mt-1 text-xs text-ink/65">Despacho a multiples financiadoras desde un solo flujo operativo.</p>
          </article>
          <article className="rounded-xl border border-platinum bg-platinum/30 p-4">
            <Wallet className="h-5 w-5 text-khaki" />
            <p className="mt-2 text-sm font-semibold text-ink">Comparador de ofertas</p>
            <p className="mt-1 text-xs text-ink/65">Selecciona la mejor tasa y cuota sin salir del panel dealer.</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-platinum bg-white p-6">
        <h2 className="font-heading text-xl font-semibold text-ink">Nueva solicitud de credito</h2>
        <p className="mt-1 text-sm text-ink/70">Captura completa para iniciar evaluacion comercial y financiera en minutos.</p>

        <form action={createFinancingAction} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            name="customer"
            required
            placeholder="Cliente"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <input
            name="rut"
            placeholder="RUT"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <input
            name="phone"
            placeholder="Telefono"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <input
            name="vehicle"
            required
            placeholder="Vehiculo"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <input
            name="amount"
            required
            type="number"
            min={1}
            placeholder="Monto credito CLP"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <input
            name="downPayment"
            type="number"
            min={0}
            placeholder="Pie CLP"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <input
            name="monthlyIncome"
            type="number"
            min={0}
            placeholder="Ingreso mensual CLP"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <input
            name="termMonths"
            type="number"
            min={12}
            max={72}
            defaultValue={36}
            placeholder="Plazo meses"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <select
            name="productType"
            defaultValue="convencional"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          >
            <option value="convencional">Credito convencional</option>
            <option value="inteligente">Credito inteligente</option>
            <option value="leasing">Leasing</option>
          </select>
          <input
            name="assignedExecutive"
            placeholder="Ejecutivo asignado"
            className="h-10 rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-khaki px-4 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
          >
            Crear y abrir expediente
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Total solicitudes</p>
          <p className="mt-2 text-2xl font-bold text-ink">{financingRequests.length}</p>
        </article>
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Expedientes completos</p>
          <p className="mt-2 text-2xl font-bold text-ink">{docsComplete}</p>
        </article>
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">En red financiera</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{inNetwork}</p>
        </article>
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Aprobadas</p>
          <p className="mt-2 text-2xl font-bold text-green-700">{statusCounts.aprobada}</p>
        </article>
        <article className="rounded-2xl border border-platinum bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Tasa de aprobacion</p>
          <p className="mt-2 text-2xl font-bold text-ink">{formatPercent(approvalRate)}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-platinum bg-white p-5">
        <h2 className="font-heading text-xl font-semibold text-ink">Pipeline operativo</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {pipelineLabels.map((step) => (
            <article key={step.key} className="rounded-xl border border-platinum bg-platinum/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/65">{step.label}</p>
              <p className="mt-1 text-xl font-bold text-ink">{statusCounts[step.key]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {financingRequests.length === 0 ? (
          <article className="rounded-2xl border border-platinum bg-white p-8 text-center">
            <h3 className="font-heading text-xl font-semibold text-ink">Sin solicitudes registradas</h3>
            <p className="mt-2 text-sm text-ink/70">Crea la primera solicitud para activar el flujo de credito digital.</p>
          </article>
        ) : (
          financingRequests.map((request) => {
            const documents = request.documents ?? [];
            const offers = request.offers ?? [];
            const paperworkScore = request.paperworkScore ?? 0;
            const selectedOffer = offers.find((offer) => offer.id === request.selectedOfferId) ?? null;

            return (
              <article key={request.id} className="rounded-2xl border border-platinum bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">{request.id}</p>
                    <h3 className="font-heading text-2xl font-semibold text-ink">{request.customer}</h3>
                    <p className="text-sm text-ink/70">
                      {request.vehicle} • {formatClp(request.amount)} • {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-ink/75 md:grid-cols-2 xl:grid-cols-4">
                  <p>RUT: <span className="font-semibold text-ink">{request.rut || "Sin dato"}</span></p>
                  <p>Email: <span className="font-semibold text-ink">{request.email || "Sin dato"}</span></p>
                  <p>Telefono: <span className="font-semibold text-ink">{request.phone || "Sin dato"}</span></p>
                  <p>Ejecutivo: <span className="font-semibold text-ink">{request.assignedExecutive || "Equipo Credito C4R"}</span></p>
                  <p>Ingreso mensual: <span className="font-semibold text-ink">{formatClp(request.monthlyIncome ?? 0)}</span></p>
                  <p>Pie: <span className="font-semibold text-ink">{formatClp(request.downPayment ?? 0)}</span></p>
                  <p>Plazo: <span className="font-semibold text-ink">{request.termMonths ?? 36} meses</span></p>
                  <p>Producto: <span className="font-semibold text-ink capitalize">{request.productType ?? "convencional"}</span></p>
                </div>

                <div className="mt-4 rounded-xl border border-platinum bg-platinum/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">Expediente digital</p>
                    <span className="text-sm font-semibold text-ink">{paperworkScore}% completo</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-platinum">
                    <div className="h-full rounded-full bg-khaki" style={{ width: `${paperworkScore}%` }} />
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                    {documents.map((document) => (
                      <div key={`${request.id}-${document.id}`} className="rounded-lg border border-platinum bg-white px-3 py-2">
                        <p className="text-xs text-ink/65">{document.label}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${docPill(document.status)}`}>
                          {document.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {request.status !== "aprobada" && request.status !== "rechazada" && paperworkScore < 100 ? (
                    <form action={completePaperworkAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-platinum px-3 text-xs font-semibold text-ink hover:bg-platinum"
                      >
                        Completar expediente
                      </button>
                    </form>
                  ) : null}

                  {request.status !== "aprobada" && request.status !== "rechazada" ? (
                    <form action={sendToNetworkAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-khaki px-3 text-xs font-semibold text-ink hover:bg-khaki-dark"
                      >
                        Enviar a red financiera
                      </button>
                    </form>
                  ) : null}

                  {request.status !== "rechazada" && request.status !== "aprobada" ? (
                    <form action={rejectRequestAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-platinum px-3 text-xs font-semibold text-ink hover:bg-platinum"
                      >
                        Marcar rechazada
                      </button>
                    </form>
                  ) : null}
                </div>

                {offers.length > 0 ? (
                  <div className="mt-4 rounded-xl border border-platinum bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">Ofertas financieras</p>
                      <p className="text-xs text-ink/65">Compara tasa, monto aprobado y cuota mensual.</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {offers.map((offer) => {
                        const isSelected = request.selectedOfferId === offer.id || selectedOffer?.id === offer.id;

                        return (
                          <article
                            key={offer.id}
                            className={`rounded-lg border p-3 ${
                              isSelected ? "border-khaki bg-khaki-light/40" : "border-platinum bg-platinum/10"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-ink">{offer.lender}</p>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${offerPill(offer.status)}`}>
                                {offer.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-ink/80">Monto aprobado: {formatClp(offer.approvedAmount)}</p>
                            <p className="text-sm text-ink/80">Tasa anual: {formatPercent(offer.annualRate)}</p>
                            <p className="text-sm text-ink/80">Plazo: {offer.termMonths} meses</p>
                            <p className="text-sm font-semibold text-ink">Cuota: {formatClp(offer.monthlyFee)}</p>

                            {!isSelected && request.status !== "rechazada" && offer.status !== "rechazada" ? (
                              <form action={selectOfferAction} className="mt-3">
                                <input type="hidden" name="requestId" value={request.id} />
                                <input type="hidden" name="offerId" value={offer.id} />
                                <button
                                  type="submit"
                                  className="inline-flex h-8 w-full items-center justify-center rounded-md border border-platinum text-xs font-semibold text-ink hover:bg-platinum"
                                >
                                  Seleccionar oferta
                                </button>
                              </form>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
