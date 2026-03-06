import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import DealerRegistrationForm from "@/app/dealers/registro/DealerRegistrationForm";

export const metadata = {
  title: "Registro Dealer | C4R",
  description: "Formulario de incorporacion para nuevos dealers en C4R.",
};

export default function DealerRegistrationPage() {
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

      <section className="rounded-2xl border border-platinum bg-white p-6">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-khaki-light text-ink">
            <Building2 className="h-6 w-6" />
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-ink">Informacion de la empresa</h2>
        </div>
      </section>

      <DealerRegistrationForm />
    </div>
  );
}
