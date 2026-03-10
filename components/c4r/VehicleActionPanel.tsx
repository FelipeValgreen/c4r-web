"use client";

import { useEffect, useMemo, useState } from "react";
import type { C4RVehicle } from "@/lib/chileautos-vehicles";
import { formatCurrencyClp } from "@/lib/chileautos-vehicles";

type ActionMode = "reservar" | "comprar";

type ActionPanelProps = {
  vehicle: C4RVehicle & { ownerDealerId?: string | null };
};

type ReservePayload = {
  fullName: string;
  email: string;
  phone: string;
  visitDate: string;
  comments: string;
};

type BuyPayload = {
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: "contado" | "credito" | "leasing";
  financingPreApproved: boolean;
  tradeIn: boolean;
};

type ApiSuccess = {
  success: true;
  reference: string;
  message: string;
  nextStep: string;
};

type ApiError = {
  success: false;
  message: string;
};

const paymentOptions: Array<{ value: BuyPayload["paymentMethod"]; label: string }> = [
  { value: "contado", label: "Pago contado" },
  { value: "credito", label: "Credito automotriz" },
  { value: "leasing", label: "Leasing" },
];

const emptyReserve: ReservePayload = {
  fullName: "",
  email: "",
  phone: "",
  visitDate: "",
  comments: "",
};

const emptyBuy: BuyPayload = {
  fullName: "",
  email: "",
  phone: "",
  paymentMethod: "contado",
  financingPreApproved: false,
  tradeIn: false,
};

export default function VehicleActionPanel({ vehicle }: ActionPanelProps) {
  const [mode, setMode] = useState<ActionMode>("reservar");
  const [reserveForm, setReserveForm] = useState<ReservePayload>(emptyReserve);
  const [buyForm, setBuyForm] = useState<BuyPayload>(emptyBuy);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<ApiSuccess | ApiError | null>(null);

  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash === "#comprar") {
        setMode("comprar");
        return;
      }

      if (window.location.hash === "#reservar") {
        setMode("reservar");
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const endpoint = useMemo(() => {
    return mode === "reservar" ? "/api/vehicles/reserve" : "/api/vehicles/buy";
  }, [mode]);

  const title = mode === "reservar" ? "Reserva tu auto" : "Inicia tu compra";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResponse(null);

    try {
      const payload =
        mode === "reservar"
          ? {
              mode,
              vehicleId: vehicle.id,
              vehicleSlug: vehicle.slug,
              vehicleTitle: vehicle.title,
              priceClp: vehicle.priceClp,
              reservationFeeClp: vehicle.reservationFeeClp,
              dealerId: vehicle.ownerDealerId ?? undefined,
              ...reserveForm,
            }
          : {
              mode,
              vehicleId: vehicle.id,
              vehicleSlug: vehicle.slug,
              vehicleTitle: vehicle.title,
              priceClp: vehicle.priceClp,
              dealerId: vehicle.ownerDealerId ?? undefined,
              ...buyForm,
            };

      const result = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await result.json()) as ApiSuccess | ApiError;

      if (!result.ok || !data.success) {
        setResponse({
          success: false,
          message: data.success ? "No pudimos procesar la solicitud." : data.message,
        });
        return;
      }

      setResponse(data);
      if (mode === "reservar") {
        setReserveForm(emptyReserve);
      } else {
        setBuyForm(emptyBuy);
      }
    } catch {
      setResponse({
        success: false,
        message: "Error de conexion. Intenta nuevamente en unos minutos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-platinum bg-white p-6 shadow-sm">
      <div id="reservar" className="relative -top-24" />
      <div id="comprar" className="relative -top-24" />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("reservar");
            window.history.replaceState(null, "", "#reservar");
          }}
          className={`inline-flex h-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
            mode === "reservar"
              ? "border-khaki bg-khaki-light text-ink"
              : "border-platinum bg-white text-gray-600 hover:border-khaki/50"
          }`}
        >
          Reservar
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("comprar");
            window.history.replaceState(null, "", "#comprar");
          }}
          className={`inline-flex h-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
            mode === "comprar"
              ? "border-khaki bg-khaki-light text-ink"
              : "border-platinum bg-white text-gray-600 hover:border-khaki/50"
          }`}
        >
          Comprar
        </button>
      </div>

      <h2 className="mt-5 font-heading text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">
        {mode === "reservar"
          ? `Asegura esta unidad desde ${formatCurrencyClp(vehicle.reservationFeeClp)} y agenda una visita.`
          : "Completa tus datos y te contactamos con una propuesta de cierre y medios de pago."}
      </p>

      {mode === "reservar" ? (
        <div className="mt-5 space-y-3">
          <input
            type="text"
            value={reserveForm.fullName}
            onChange={(event) => setReserveForm((state) => ({ ...state, fullName: event.target.value }))}
            placeholder="Nombre y apellido"
            className="h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
          />
          <input
            type="email"
            value={reserveForm.email}
            onChange={(event) => setReserveForm((state) => ({ ...state, email: event.target.value }))}
            placeholder="Correo"
            className="h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
          />
          <input
            type="tel"
            value={reserveForm.phone}
            onChange={(event) => setReserveForm((state) => ({ ...state, phone: event.target.value }))}
            placeholder="Telefono"
            className="h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
          />
          <input
            type="date"
            value={reserveForm.visitDate}
            onChange={(event) => setReserveForm((state) => ({ ...state, visitDate: event.target.value }))}
            className="h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
          />
          <textarea
            value={reserveForm.comments}
            onChange={(event) => setReserveForm((state) => ({ ...state, comments: event.target.value }))}
            placeholder="Comentarios opcionales"
            className="min-h-24 w-full rounded-md border border-platinum px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-khaki"
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <input
            type="text"
            value={buyForm.fullName}
            onChange={(event) => setBuyForm((state) => ({ ...state, fullName: event.target.value }))}
            placeholder="Nombre y apellido"
            className="h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
          />
          <input
            type="email"
            value={buyForm.email}
            onChange={(event) => setBuyForm((state) => ({ ...state, email: event.target.value }))}
            placeholder="Correo"
            className="h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
          />
          <input
            type="tel"
            value={buyForm.phone}
            onChange={(event) => setBuyForm((state) => ({ ...state, phone: event.target.value }))}
            placeholder="Telefono"
            className="h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
          />
          <select
            value={buyForm.paymentMethod}
            onChange={(event) =>
              setBuyForm((state) => ({
                ...state,
                paymentMethod: event.target.value as BuyPayload["paymentMethod"],
              }))
            }
            className="h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none transition-colors focus:border-khaki"
          >
            {paymentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={buyForm.financingPreApproved}
              onChange={(event) => setBuyForm((state) => ({ ...state, financingPreApproved: event.target.checked }))}
              className="h-4 w-4 rounded border-platinum text-khaki focus:ring-khaki"
            />
            Tengo preaprobacion financiera
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={buyForm.tradeIn}
              onChange={(event) => setBuyForm((state) => ({ ...state, tradeIn: event.target.checked }))}
              className="h-4 w-4 rounded border-platinum text-khaki focus:ring-khaki"
            />
            Entrego auto en parte de pago
          </label>
        </div>
      )}

      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleSubmit}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-khaki px-4 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Enviando solicitud..." : mode === "reservar" ? "Confirmar reserva" : "Solicitar compra"}
      </button>

      {response ? (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            response.success
              ? "border-success/40 bg-success/10 text-success"
              : "border-error/30 bg-error/10 text-error"
          }`}
        >
          <p className="font-semibold">{response.success ? response.message : "No fue posible enviar la solicitud"}</p>
          <p className="mt-1">{response.success ? `${response.nextStep} (${response.reference})` : response.message}</p>
        </div>
      ) : null}
    </section>
  );
}
