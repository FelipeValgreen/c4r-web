import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import DealerRegistrationForm from "@/app/dealers/registro/DealerRegistrationForm";

export const metadata = {
  title: "Registro Dealers | C4R",
  description: "Formulario de incorporacion para nuevas automotoras y dealers en C4R.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicDealerRegistrationPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8f6ef_0%,#ffffff_45%)] px-6 py-16">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-2xl border border-platinum bg-white p-6">
          <Link
            href="/dealer-login"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-khaki hover:text-khaki-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a acceso dealers
          </Link>
          <h1 className="font-heading text-3xl font-bold text-ink">Registro de dealer</h1>
          <p className="mt-2 text-sm text-ink/70">
            Crea tu cuenta de automotora para publicar inventario y gestionar leads, creditos y canales omnicanal.
          </p>
        </section>

        <section className="rounded-2xl border border-platinum bg-white p-6">
          <div className="mb-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-khaki-light text-ink">
              <Building2 className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-ink">Informacion comercial y acceso</h2>
          </div>
          <DealerRegistrationForm />
        </section>
      </div>
    </main>
  );
}
