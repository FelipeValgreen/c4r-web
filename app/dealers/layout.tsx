import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Building2 } from "lucide-react";
import { dealerNavLinks } from "@/app/dealers/_data";
import { DEALER_SESSION_COOKIE, verifyDealerSessionToken } from "@/lib/dealer-auth";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DealersLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(DEALER_SESSION_COOKIE)?.value ?? "";
  const session = sessionToken ? await verifyDealerSessionToken(sessionToken) : null;
  const operatorLabel = session?.valid ? session.username : "Operador";
  const roleLabel = session?.role === "admin" ? "Administrador" : "Dealer";
  const navLinks = dealerNavLinks.filter((link) => {
    if (link.href === "/dealers/registro" && session?.role !== "admin") {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-platinum/30">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-max rounded-2xl border border-platinum bg-white p-5 lg:sticky lg:top-24">
            <div className="mb-4 flex items-center gap-3 border-b border-platinum pb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-khaki-light text-ink">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold text-ink">Dealers C4R</p>
                <p className="text-xs text-ink/70">Panel operativo</p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-platinum bg-platinum/35 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/55">Sesion activa</p>
              <p className="truncate text-sm font-medium text-ink">{operatorLabel}</p>
              <p className="truncate text-[11px] uppercase tracking-wide text-ink/60">
                {roleLabel} · {session?.dealerId ?? "DLR-C4R-DEMO"}
              </p>
              <Link href="/dealer-logout" className="mt-1 inline-flex text-xs font-semibold text-khaki hover:text-khaki-dark">
                Cerrar sesion
              </Link>
            </div>

            <nav className="space-y-1" aria-label="Navegacion dealers">
              {navLinks.map((link) => (
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
              Panel operativo con datos persistentes para gestion comercial diaria.
            </p>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
