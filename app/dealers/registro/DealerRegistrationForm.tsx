"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";

type RegistrationResponse = {
  message: string;
  registrationId: string;
  createdAt: string;
};

type FormState = {
  companyName: string;
  companyRut: string;
  email: string;
  phone: string;
  address: string;
};

const initialState: FormState = {
  companyName: "",
  companyRut: "",
  email: "",
  phone: "",
  address: "",
};

export default function DealerRegistrationForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RegistrationResponse | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/dealers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as RegistrationResponse | { error: string };

      if (!response.ok || "error" in data) {
        setSuccess(null);
        setError("error" in data ? data.error : "No fue posible enviar la solicitud.");
        return;
      }

      setSuccess(data);
      setForm(initialState);
    } catch {
      setSuccess(null);
      setError("Error de conexion. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-platinum bg-white p-6">
      {success ? (
        <div className="mb-5 rounded-2xl border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-semibold text-success">{success.message}</p>
          <p className="mt-1 text-xs text-ink/80">ID: {success.registrationId}</p>
          <p className="mt-1 text-xs text-ink/80">
            Estado inicial: pendiente de validacion comercial y legal.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-2xl border border-error/30 bg-error/10 p-4">
          <p className="text-sm font-semibold text-error">{error}</p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Nombre empresa
            <input
              name="companyName"
              required
              value={form.companyName}
              onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 outline-none ring-khaki/40 focus:ring-2"
              placeholder="AutoCenter SPA"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            RUT empresa
            <input
              name="companyRut"
              required
              value={form.companyRut}
              onChange={(event) => setForm((prev) => ({ ...prev, companyRut: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 outline-none ring-khaki/40 focus:ring-2"
              placeholder="12.345.678-9"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Email comercial
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 outline-none ring-khaki/40 focus:ring-2"
              placeholder="ventas@empresa.cl"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Telefono
            <input
              name="phone"
              required
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 outline-none ring-khaki/40 focus:ring-2"
              placeholder="+56 9 1234 5678"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-ink">
          Direccion
          <input
            name="address"
            required
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 outline-none ring-khaki/40 focus:ring-2"
            placeholder="Av. Apoquindo 1234, Las Condes"
          />
        </label>

        <div className="rounded-xl border border-platinum bg-platinum/30 p-4 text-sm text-ink/80">
          <p className="font-semibold text-ink">Documentos requeridos</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Constitucion de sociedad</li>
            <li>Vigencia y poderes del representante legal</li>
            <li>Certificado de domicilio comercial</li>
            <li>Cuenta bancaria para liquidaciones</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-khaki px-4 py-2 text-sm font-semibold text-ink hover:bg-khaki-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </button>
          <Link href="/contacto" className="inline-flex items-center justify-center gap-2 rounded-lg border border-platinum px-4 py-2 text-sm font-semibold text-ink hover:bg-platinum">
            <Phone className="h-4 w-4" />
            Hablar con soporte
          </Link>
        </div>
      </form>
    </section>
  );
}
