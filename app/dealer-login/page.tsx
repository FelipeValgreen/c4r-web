import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import {
  createDealerSessionToken,
  DEFAULT_DEALER_SESSION_ID,
  DEALER_SESSION_COOKIE,
  getDealerSessionMaxAgeSeconds,
  isDealerCredentialsValid,
  normalizeDealerNextPath,
} from "@/lib/dealer-auth";
import { authenticateDealerPortalCredentials } from "@/lib/dealers-store";

type SearchParams = Promise<{
  next?: string;
  error?: string;
  logout?: string;
}>;

type PageProps = {
  searchParams: SearchParams;
};

export const metadata = {
  title: "Acceso Dealers | C4R",
  description: "Ingreso seguro para el portal operativo de dealers C4R.",
  robots: {
    index: false,
    follow: false,
  },
};

async function loginDealerAction(formData: FormData) {
  "use server";

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const nextRaw = String(formData.get("next") ?? "/dealers").trim();
  const nextPath = normalizeDealerNextPath(nextRaw);

  const isAdminAccess = await isDealerCredentialsValid(username, password);
  const dealerAccess = isAdminAccess
    ? null
    : await authenticateDealerPortalCredentials(username, password);

  if (!isAdminAccess && !dealerAccess) {
    redirect(`/dealer-login?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  const { token, expiresAt } = await createDealerSessionToken(
    isAdminAccess
      ? {
          username,
          dealerId: DEFAULT_DEALER_SESSION_ID,
          role: "admin",
        }
      : {
          username: dealerAccess?.portalUsername ?? username,
          dealerId: dealerAccess?.id ?? DEFAULT_DEALER_SESSION_ID,
          role: "dealer",
        },
  );
  const maxAge = getDealerSessionMaxAgeSeconds();
  const cookieStore = await cookies();

  cookieStore.set(DEALER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    expires: new Date(expiresAt),
    path: "/",
  });

  redirect(nextPath);
}

export default async function DealerLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = normalizeDealerNextPath(String(params.next ?? "/dealers"));
  const hasError = params.error === "1";
  const hasLogout = params.logout === "1";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8f6ef_0%,#ffffff_45%)] px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-8 rounded-3xl border border-platinum bg-white p-6 shadow-[0_24px_55px_-42px_rgba(44,44,44,0.5)] md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <section className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-khaki-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
            <ShieldCheck className="h-3.5 w-3.5" />
            Portal dealers C4R
          </p>
          <h1 className="font-heading text-4xl font-bold text-ink">Acceso seguro para gestion comercial</h1>
          <p className="max-w-xl text-sm leading-6 text-ink/75">
            Desde este panel cada dealer administra su inventario, leads, creditos y canales omnicanal. El acceso es
            restringido para equipos autorizados.
          </p>

          <div className="grid gap-3 rounded-2xl border border-platinum bg-platinum/20 p-4 text-sm text-ink/75">
            <p className="font-semibold text-ink">Incluye:</p>
            <p>1. Publicacion omnicanal por unidad (C4R, Chileautos, Mercado Libre, Facebook, Yapo).</p>
            <p>2. Seguimiento de leads de compra/reserva por dealer.</p>
            <p>3. Flujo financiero y documental desde una sola consola.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-platinum bg-white p-5">
          <h2 className="font-heading text-2xl font-semibold text-ink">Ingresar</h2>
          <p className="mt-1 text-sm text-ink/70">Usa tus credenciales de operador dealer.</p>

          {hasError ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Usuario o contrasena incorrectos.
            </p>
          ) : null}

          {hasLogout ? (
            <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Sesion cerrada correctamente.
            </p>
          ) : null}

          <form action={loginDealerAction} className="mt-4 space-y-3">
            <input type="hidden" name="next" value={nextPath} />

            <label className="block text-sm font-medium text-ink">
              Usuario
              <input
                name="username"
                type="text"
                required
                autoComplete="username"
                className="mt-2 h-11 w-full rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/35 focus:ring-2"
                placeholder="usuario@dealer.cl"
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              Contrasena
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-2 h-11 w-full rounded-lg border border-platinum px-3 text-sm text-ink outline-none ring-khaki/35 focus:ring-2"
                placeholder="********"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-khaki px-4 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
            >
              <LockKeyhole className="h-4 w-4" />
              Entrar al dashboard
            </button>
          </form>

          <div className="mt-4 border-t border-platinum pt-4">
            <p className="text-xs text-ink/65">Aun no tienes cuenta dealer?</p>
            <Link href="/dealer-registro" className="text-sm font-semibold text-khaki hover:text-khaki-dark">
              Registrar automotora
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
