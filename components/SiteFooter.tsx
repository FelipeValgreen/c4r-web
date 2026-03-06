import Link from "next/link";
import { footerColumns } from "@/components/nav-links";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-28">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="font-heading text-3xl font-bold">C4R</div>
            <p className="max-w-md text-sm leading-6 text-gray-300">
              El marketplace automotriz más seguro de Chile. Compra y vende autos usados sin miedo a estafas.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-success px-3 py-1 text-sm font-medium text-white">
                C4R Check
              </span>
              <span className="inline-flex items-center rounded-full bg-khaki-light px-3 py-1 text-sm font-medium text-ink">
                Garantía 7 días
              </span>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 xl:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold leading-6 text-white">{column.title}</h3>
                <ul className="mt-6 space-y-4">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link href={link.href} className="text-sm leading-6 text-gray-300 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-gray-700 pt-8">
          <div className="flex flex-col gap-3 text-xs leading-5 text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} C4R. Todos los derechos reservados.</p>
            <p>Hecho para hacer el mercado automotriz más seguro.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
