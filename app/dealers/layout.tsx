import type { ReactNode } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { dealerNavLinks } from "@/app/dealers/_data";

export default function DealersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-platinum/30">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-max rounded-2xl border border-platinum bg-white p-5 lg:sticky lg:top-24">
            <div className="mb-5 flex items-center gap-3 border-b border-platinum pb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-khaki-light text-ink">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold text-ink">Dealers C4R</p>
                <p className="text-xs text-ink/70">Panel operativo</p>
              </div>
            </div>

            <nav className="space-y-1" aria-label="Navegacion dealers">
              {dealerNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-ink/85 transition-colors hover:bg-khaki-light/60 hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="mt-5 rounded-xl bg-khaki-light/40 p-3 text-xs text-ink/80">
              Demo navegable sin login. Datos de ejemplo para validar disenio y flujo.
            </p>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
