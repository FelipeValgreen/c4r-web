"use client";

import { useMemo, useState } from "react";

type ContactReason =
  | "soporte"
  | "compra"
  | "venta"
  | "dealers"
  | "financiamiento"
  | "otro";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  reason: ContactReason | "";
  message: string;
  consent: boolean;
};

type ContactApiSuccess = {
  message: string;
  ticketId: string;
  createdAt: string;
};

const initialState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  reason: "",
  message: "",
  consent: false,
};

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ContactApiSuccess | null>(null);

  const messageLength = useMemo(() => form.message.trim().length, [form.message]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!form.name.trim()) {
      setError("Debes ingresar tu nombre.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Ingresa un email valido.");
      return;
    }

    if (!form.reason) {
      setError("Selecciona un motivo de contacto.");
      return;
    }

    if (messageLength < 20) {
      setError("El mensaje debe tener al menos 20 caracteres.");
      return;
    }

    if (!form.consent) {
      setError("Debes aceptar ser contactado por C4R.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as ContactApiSuccess | { error: string };

      if (!response.ok || "error" in data) {
        setError("error" in data ? data.error : "No fue posible enviar tu mensaje.");
        return;
      }

      setSuccess(data);
      setForm(initialState);
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="formulario-contacto" className="py-14">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <article className="rounded-2xl border border-platinum bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-heading text-2xl font-semibold text-ink">Envianos un mensaje</h2>
          <p className="mt-2 text-sm text-ink/70">
            Te responderemos en menos de 24 horas habiles. Mientras mas detalle compartas, mejor soporte podremos darte.
          </p>

          {success ? (
            <div className="mt-5 rounded-xl border border-success/30 bg-success/10 p-4">
              <p className="text-sm font-semibold text-success">{success.message}</p>
              <p className="mt-1 text-xs text-ink/80">Ticket: {success.ticketId}</p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-xl border border-error/30 bg-error/10 p-4">
              <p className="text-sm font-semibold text-error">{error}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink">
                Nombre completo
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
                  placeholder="Tu nombre"
                />
              </label>

              <label className="text-sm font-medium text-ink">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
                  placeholder="tu@email.com"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink">
                Telefono (opcional)
                <input
                  name="phone"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
                  placeholder="+56 9 1234 5678"
                />
              </label>

              <label className="text-sm font-medium text-ink">
                Motivo
                <select
                  required
                  name="reason"
                  value={form.reason}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reason: event.target.value as ContactReason | "" }))
                  }
                  className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
                >
                  <option value="">Selecciona una opcion</option>
                  <option value="soporte">Soporte general</option>
                  <option value="compra">Ayuda para comprar</option>
                  <option value="venta">Ayuda para vender</option>
                  <option value="dealers">Consultas dealers</option>
                  <option value="financiamiento">Financiamiento</option>
                  <option value="otro">Otro motivo</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-ink">
              Mensaje
              <textarea
                required
                name="message"
                rows={5}
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 text-sm text-ink outline-none ring-khaki/40 focus:ring-2"
                placeholder="Cuentanos tu caso y lo que necesitas resolver."
              />
              <span className="mt-2 block text-xs text-ink/60">Minimo 20 caracteres ({messageLength}/20+)</span>
            </label>

            <label className="flex items-start gap-3 text-sm text-ink/80">
              <input
                required
                type="checkbox"
                checked={form.consent}
                onChange={(event) => setForm((prev) => ({ ...prev, consent: event.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-platinum text-khaki focus:ring-khaki"
              />
              <span>Acepto ser contactado por C4R para responder esta solicitud.</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-6 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
