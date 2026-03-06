import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-khaki/15">
            <Search className="h-12 w-12 text-khaki" />
          </div>
        </div>
        <h1 className="mb-4 font-heading text-3xl font-bold text-ink">No encontramos lo que buscas</h1>
        <p className="mb-8 leading-7 text-gray-600">
          El enlace puede estar roto o la página ya no existe. Te ayudamos a encontrar lo que necesitas.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg bg-khaki px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki focus-visible:ring-offset-2"
          >
            <Home className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
          <Link
            href="/app/explorar"
            className="inline-flex w-full items-center justify-center rounded-lg border border-platinum px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-platinum/40"
          >
            <Search className="mr-2 h-4 w-4" />
            Explorar vehículos
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-600">
          ¿Necesitas ayuda?{" "}
          <Link href="/contacto" className="font-medium text-khaki transition-colors hover:text-khaki-dark">
            Contáctanos
          </Link>
        </p>
      </div>
    </main>
  );
}
