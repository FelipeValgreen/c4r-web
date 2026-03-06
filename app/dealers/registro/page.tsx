import Link from "next/link";
import { ArrowLeft, Building2, Phone } from "lucide-react";

export const metadata = {
  title: "Registro Dealer | C4R",
  description: "Formulario de incorporacion para nuevos dealers en C4R.",
};

type PageProps = {
  searchParams: Promise<{
    submitted?: string;
  }>;
};

export default async function DealerRegistrationPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const isSubmitted = resolvedSearchParams.submitted === "1";

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

      {isSubmitted ? (
        <section className="rounded-2xl border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-semibold text-success">Solicitud enviada correctamente.</p>
          <p className="mt-1 text-sm text-ink/80">
            El equipo comercial recibio tus datos de registro. Puedes continuar por el canal de contacto para seguimiento.
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-platinum bg-white p-6">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-khaki-light text-ink">
            <Building2 className="h-6 w-6" />
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-ink">Informacion de la empresa</h2>
        </div>

        <form action="/dealers/registro" method="get" className="space-y-5">
          <input type="hidden" name="submitted" value="1" />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-ink">
              Nombre empresa
              <input
                name="company_name"
                required
                className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 outline-none ring-khaki/40 focus:ring-2"
                placeholder="AutoCenter SPA"
              />
            </label>
            <label className="text-sm font-medium text-ink">
              RUT empresa
              <input
                name="company_rut"
                required
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
                className="mt-2 w-full rounded-lg border border-platinum px-4 py-3 outline-none ring-khaki/40 focus:ring-2"
                placeholder="ventas@empresa.cl"
              />
            </label>
            <label className="text-sm font-medium text-ink">
              Telefono
              <input
                name="phone"
                required
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
              className="inline-flex items-center justify-center rounded-lg bg-khaki px-4 py-2 text-sm font-semibold text-ink hover:bg-khaki-dark"
            >
              Enviar solicitud
            </button>
            <Link href="/contacto" className="inline-flex items-center justify-center gap-2 rounded-lg border border-platinum px-4 py-2 text-sm font-semibold text-ink hover:bg-platinum">
              <Phone className="h-4 w-4" />
              Hablar con soporte
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
