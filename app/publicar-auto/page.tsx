import type { Metadata } from "next";
import PublicarAutoClient from "@/app/publicar-auto/PublicarAutoClient";

export const metadata: Metadata = {
  title: "Publicar mi auto | C4R",
  description:
    "Publica tu auto en C4R con autenticación segura (correo o Google), control de suscripción y cobro con Mercado Pago.",
  alternates: {
    canonical: "/publicar-auto",
  },
};

export default function PublicarAutoPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_35%)] px-6 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-6 rounded-2xl border border-platinum bg-white p-6">
          <p className="inline-flex rounded-full bg-khaki-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
            Venta inteligente C4R
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-ink sm:text-5xl">Publica tu auto y vende con respaldo</h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-ink/75 sm:text-base">
            Flujo operativo completo: registro/login con Supabase, validación de suscripción y cobro en Mercado Pago para
            activar la publicación cuando corresponda.
          </p>
        </section>

        <PublicarAutoClient />
      </div>
    </main>
  );
}
