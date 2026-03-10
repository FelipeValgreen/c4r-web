"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { CreditCard, LogOut, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseBrowserReady } from "@/lib/supabase/browser-client";
import { formatCurrencyClp } from "@/lib/chileautos-vehicles";

type SellerSubscription = {
  id: string;
  planCode: string;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
};

type SellerListing = {
  id: string;
  slug: string;
  title: string;
  year: number;
  location: string;
  priceClp: number;
  status: "draft" | "pending_payment" | "published" | "archived";
  createdAt: string;
};

type SessionApiSuccess = {
  success: true;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  profile: {
    fullName: string;
    phone: string;
    city: string;
  } | null;
  hasActiveSubscription: boolean;
  activeSubscription: SellerSubscription | null;
  listings: SellerListing[];
  mercadopagoEnabled: boolean;
  publicationFeeClp: number;
};

type SessionApiError = {
  success: false;
  error: string;
};

type PublishApiSuccess = {
  success: true;
  status: "published" | "payment_required";
  message: string;
  checkoutUrl?: string;
};

type PublishApiError = {
  success: false;
  error: string;
};

type PaymentStatusApi = {
  success: boolean;
  error?: string;
  listing?: SellerListing;
  checkout?: {
    status: "pending" | "approved" | "rejected" | "cancelled" | "expired";
  };
  hasActiveSubscription?: boolean;
};

type PublishFormState = {
  make: string;
  model: string;
  year: string;
  mileage: string;
  priceClp: string;
  bodyStyle: string;
  fuelType: string;
  transmission: string;
  location: string;
  description: string;
  coverImage: string;
  galleryText: string;
  contactName: string;
  contactPhone: string;
};

const defaultPublishForm: PublishFormState = {
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  mileage: "0",
  priceClp: "",
  bodyStyle: "Automovil",
  fuelType: "Bencina",
  transmission: "Manual",
  location: "Santiago",
  description: "",
  coverImage: "",
  galleryText: "",
  contactName: "",
  contactPhone: "",
};

const bodyStyleOptions = ["Automovil", "Sedan", "SUV", "Hatchback", "Crossover", "Coupe", "Pick-up", "Camioneta", "Van"];
const fuelOptions = ["Bencina", "Diesel", "Hibrido", "Electrico", "Gas"];
const transmissionOptions = ["Manual", "automatico", "CVT", "Doble embrague"];

function normalizeText(value: string): string {
  return value.trim();
}

function parseGalleryInput(value: string): string[] {
  return value
    .split(/[\n,]+/g)
    .map((entry) => normalizeText(entry))
    .filter(Boolean)
    .filter((entry, index, source) => source.indexOf(entry) === index)
    .slice(0, 20);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(date);
}

function getStatusLabel(status: SellerListing["status"]): string {
  if (status === "published") return "Publicada";
  if (status === "pending_payment") return "Pendiente de pago";
  if (status === "archived") return "Archivada";
  return "Borrador";
}

export default function PublicarAutoClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [dashboard, setDashboard] = useState<SessionApiSuccess | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [publishForm, setPublishForm] = useState<PublishFormState>(defaultPublishForm);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishError, setPublishError] = useState("");
  const paymentCheckRef = useRef("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentListingId, setPaymentListingId] = useState("");

  const browserReady = isSupabaseBrowserReady();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setPaymentStatus(normalizeText(params.get("payment") ?? ""));
    setPaymentListingId(normalizeText(params.get("listing") ?? ""));
  }, []);

  const loadDashboard = useCallback(async (activeSession: Session) => {
    setDashboardError("");

    const response = await fetch("/api/seller/session", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
      },
    });

    const payload = (await response.json()) as SessionApiSuccess | SessionApiError;
    if (!response.ok || !payload.success) {
      const message = "success" in payload && payload.success === false ? payload.error : "No se pudo cargar tu sesión seller.";
      throw new Error(message);
    }

    setDashboard(payload);
    setPublishForm((current) => ({
      ...current,
      contactName: current.contactName || payload.profile?.fullName || payload.user.fullName || "",
      contactPhone: current.contactPhone || payload.profile?.phone || "",
      location: current.location || payload.profile?.city || "Santiago",
    }));
  }, []);

  useEffect(() => {
    if (!browserReady) {
      setLoadingSession(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }
      setSession(data.session ?? null);
      setLoadingSession(false);
    };

    void bootstrap();

    const authSubscription = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) {
        return;
      }
      setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      authSubscription.data.subscription.unsubscribe();
    };
  }, [browserReady]);

  useEffect(() => {
    if (!session) {
      setDashboard(null);
      setDashboardError("");
      return;
    }

    let cancelled = false;
    const sync = async () => {
      try {
        await loadDashboard(session);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setDashboardError(error instanceof Error ? error.message : "No se pudo cargar la sesión seller.");
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [loadDashboard, session]);

  useEffect(() => {
    if (!session || !paymentStatus || !paymentListingId) {
      return;
    }

    const marker = `${session.user.id}:${paymentStatus}:${paymentListingId}`;
    if (paymentCheckRef.current === marker) {
      return;
    }

    paymentCheckRef.current = marker;

    const verifyPayment = async () => {
      const response = await fetch(`/api/seller/payment-status?listingId=${encodeURIComponent(paymentListingId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = (await response.json()) as PaymentStatusApi;
      if (!response.ok || !payload.success) {
        setPublishError(payload.error ?? "No pudimos validar el pago de Mercado Pago.");
        return;
      }

      if (payload.checkout?.status === "approved") {
        setPublishMessage("Pago confirmado. Tu publicación ya está activa en C4R.");
      } else if (payload.checkout?.status === "pending") {
        setPublishMessage("Tu pago está en proceso. Actualizaremos la publicación en cuanto se confirme.");
      } else {
        setPublishError("El pago no fue aprobado. Puedes reintentar desde tu listado.");
      }

      await loadDashboard(session);
    };

    void verifyPayment();
  }, [loadDashboard, paymentListingId, paymentStatus, session]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeText(authEmail),
        password: authPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      setAuthMessage("Sesión iniciada correctamente.");
      setAuthPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No pudimos iniciar sesión.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizeText(authEmail),
        password: authPassword,
        options: {
          data: {
            full_name: normalizeText(authName),
          },
          emailRedirectTo: `${window.location.origin}/publicar-auto`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session) {
        setAuthMessage("Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.");
      } else {
        setAuthMessage("Cuenta creada e iniciada correctamente.");
      }

      setAuthPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No pudimos crear la cuenta.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/publicar-auto`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      setAuthLoading(false);
      setAuthError(error instanceof Error ? error.message : "No pudimos iniciar con Google.");
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setDashboard(null);
    setPublishMessage("");
    setPublishError("");
  };

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) {
      setPublishError("Debes iniciar sesión para publicar.");
      return;
    }

    setPublishLoading(true);
    setPublishError("");
    setPublishMessage("");

    const gallery = parseGalleryInput(publishForm.galleryText);
    const payload = {
      make: normalizeText(publishForm.make),
      model: normalizeText(publishForm.model),
      year: Number(publishForm.year),
      mileage: Number(publishForm.mileage),
      priceClp: Number(publishForm.priceClp),
      bodyStyle: publishForm.bodyStyle,
      fuelType: publishForm.fuelType,
      transmission: publishForm.transmission,
      location: normalizeText(publishForm.location),
      description: normalizeText(publishForm.description),
      coverImage: normalizeText(publishForm.coverImage),
      gallery,
      contactName: normalizeText(publishForm.contactName),
      contactPhone: normalizeText(publishForm.contactPhone),
    };

    try {
      const response = await fetch("/api/seller/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as PublishApiSuccess | PublishApiError;
      if (!response.ok || !result.success) {
        throw new Error("success" in result && result.success === false ? result.error : "No se pudo publicar.");
      }

      setPublishMessage(result.message);
      await loadDashboard(session);

      if (result.status === "payment_required" && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }

      setPublishForm((current) => ({
        ...defaultPublishForm,
        contactName: current.contactName,
        contactPhone: current.contactPhone,
        location: current.location,
      }));
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "No se pudo publicar.");
    } finally {
      setPublishLoading(false);
    }
  };

  if (!browserReady) {
    return (
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="font-heading text-2xl font-semibold text-ink">Configura Supabase para habilitar esta sección</h2>
        <p className="mt-3 text-sm text-ink/80">
          Faltan variables públicas para autenticación: <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
      </section>
    );
  }

  if (loadingSession) {
    return (
      <section className="rounded-2xl border border-platinum bg-white p-6">
        <p className="text-sm text-ink/70">Cargando sesión de publicación...</p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <section className="rounded-2xl border border-platinum bg-white p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-khaki-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
            <Sparkles className="h-3.5 w-3.5" />
            Publicación inteligente
          </p>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-ink">Publica con respaldo C4R</h2>
          <p className="mt-3 text-sm leading-6 text-ink/75">
            Registra tu cuenta, sube los datos del auto y publica con pago protegido. Si ya tienes suscripción activa, el
            vehículo se publica de inmediato.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-ink/75">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
              Autenticación con correo o Google.
            </li>
            <li className="flex items-start gap-2">
              <CreditCard className="mt-0.5 h-4 w-4 text-khaki" />
              Pago con Mercado Pago para usuarios sin plan activo.
            </li>
            <li className="flex items-start gap-2">
              <UserRoundCheck className="mt-0.5 h-4 w-4 text-khaki" />
              Publicación con control de estado y trazabilidad.
            </li>
          </ul>
        </section>

        {!session ? (
          <section className="rounded-2xl border border-platinum bg-white p-6">
            <div className="mb-4 grid grid-cols-2 rounded-lg border border-platinum p-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`h-10 rounded-md text-sm font-semibold ${
                  authMode === "login" ? "bg-khaki text-ink" : "text-ink/70 hover:bg-platinum/50"
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`h-10 rounded-md text-sm font-semibold ${
                  authMode === "register" ? "bg-khaki text-ink" : "text-ink/70 hover:bg-platinum/50"
                }`}
              >
                Registrarme
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-platinum bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-platinum disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continuar con Google
            </button>

            <p className="my-4 text-center text-xs text-ink/55">o con correo</p>

            <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="space-y-3">
              {authMode === "register" ? (
                <label className="block text-sm font-medium text-ink">
                  Nombre completo
                  <input
                    required
                    type="text"
                    value={authName}
                    onChange={(event) => setAuthName(event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    placeholder="Tu nombre"
                  />
                </label>
              ) : null}

              <label className="block text-sm font-medium text-ink">
                Correo
                <input
                  required
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                  placeholder="nombre@correo.cl"
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                Contraseña
                <input
                  required
                  type="password"
                  minLength={8}
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                  placeholder="Mínimo 8 caracteres"
                />
              </label>

              <button
                type="submit"
                disabled={authLoading}
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-khaki px-4 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading ? "Procesando..." : authMode === "login" ? "Entrar" : "Crear cuenta"}
              </button>
            </form>

            {authError ? (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>
            ) : null}
            {authMessage ? (
              <p className="mt-3 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {authMessage}
              </p>
            ) : null}
          </section>
        ) : (
          <section className="rounded-2xl border border-platinum bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Sesión activa</p>
            <p className="mt-2 text-sm font-semibold text-ink">{dashboard?.user.email ?? session.user.email}</p>
            <p className="mt-1 text-sm text-ink/70">
              {dashboard?.hasActiveSubscription ? "Suscripción activa" : "Sin suscripción activa"}
            </p>
            {dashboard?.activeSubscription ? (
              <p className="mt-1 text-xs text-ink/60">
                Vigente hasta: {formatDate(dashboard.activeSubscription.expiresAt)}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-platinum px-4 text-sm font-semibold text-ink hover:bg-platinum"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </section>
        )}
      </aside>

      <section className="space-y-6">
        {session ? (
          <>
            <section className="rounded-2xl border border-platinum bg-white p-6">
              <h2 className="font-heading text-2xl font-semibold text-ink">Datos del vehículo</h2>
              <p className="mt-2 text-sm text-ink/70">
                Completa la ficha. Si no tienes suscripción activa, el sistema abrirá Mercado Pago antes de publicar.
              </p>

              <form onSubmit={handlePublish} className="mt-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm font-medium text-ink">
                    Marca
                    <input
                      required
                      value={publishForm.make}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, make: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                      placeholder="Toyota"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Modelo
                    <input
                      required
                      value={publishForm.model}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, model: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                      placeholder="Corolla"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Año
                    <input
                      required
                      type="number"
                      min={1950}
                      max={new Date().getFullYear() + 1}
                      value={publishForm.year}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, year: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm font-medium text-ink">
                    Kilometraje
                    <input
                      required
                      type="number"
                      min={0}
                      value={publishForm.mileage}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, mileage: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Precio CLP
                    <input
                      required
                      type="number"
                      min={1}
                      value={publishForm.priceClp}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, priceClp: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Ubicación
                    <input
                      required
                      value={publishForm.location}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, location: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                      placeholder="Santiago"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm font-medium text-ink">
                    Carrocería
                    <select
                      value={publishForm.bodyStyle}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, bodyStyle: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    >
                      {bodyStyleOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Combustible
                    <select
                      value={publishForm.fuelType}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, fuelType: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    >
                      {fuelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Transmisión
                    <select
                      value={publishForm.transmission}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, transmission: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum bg-white px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    >
                      {transmissionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium text-ink">
                  Descripción comercial
                  <textarea
                    required
                    value={publishForm.description}
                    onChange={(event) => setPublishForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-2 min-h-24 w-full rounded-md border border-platinum px-3 py-2 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    placeholder="Estado general, equipamiento, mantenimiento, número de dueños, etc."
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-ink">
                    Foto principal (URL)
                    <input
                      value={publishForm.coverImage}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, coverImage: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                      placeholder="https://..."
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Fotos galería (URLs, separadas por coma o salto de línea)
                    <textarea
                      value={publishForm.galleryText}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, galleryText: event.target.value }))}
                      className="mt-2 min-h-24 w-full rounded-md border border-platinum px-3 py-2 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                      placeholder="https://... , https://..."
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-ink">
                    Nombre de contacto
                    <input
                      required
                      value={publishForm.contactName}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, contactName: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Teléfono de contacto
                    <input
                      required
                      value={publishForm.contactPhone}
                      onChange={(event) => setPublishForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-md border border-platinum px-3 text-sm text-ink outline-none ring-khaki/30 focus:ring-2"
                      placeholder="+56 9 1234 5678"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-platinum bg-platinum/30 p-4 text-sm text-ink/75">
                  {dashboard?.hasActiveSubscription ? (
                    <p>Tu suscripción está activa: esta publicación se activará inmediatamente sin cobro adicional.</p>
                  ) : (
                    <p>
                      Sin plan activo: al guardar, te enviaremos a Mercado Pago para pagar{" "}
                      <span className="font-semibold text-ink">
                        {formatCurrencyClp(dashboard?.publicationFeeClp ?? 0)}
                      </span>{" "}
                      y publicar.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={publishLoading}
                  className="inline-flex h-11 w-full items-center justify-center rounded-md bg-khaki px-4 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishLoading ? "Procesando publicación..." : "Guardar y continuar"}
                </button>
              </form>

              {publishError ? (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{publishError}</p>
              ) : null}
              {publishMessage ? (
                <p className="mt-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                  {publishMessage}
                </p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-platinum bg-white p-6">
              <h3 className="font-heading text-xl font-semibold text-ink">Mis publicaciones</h3>
              {dashboardError ? (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{dashboardError}</p>
              ) : null}
              {dashboard?.listings.length ? (
                <div className="mt-4 space-y-3">
                  {dashboard.listings.map((listing) => (
                    <article
                      key={listing.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-platinum p-4"
                    >
                      <div>
                        <p className="font-semibold text-ink">{listing.title}</p>
                        <p className="text-sm text-ink/70">
                          {formatCurrencyClp(listing.priceClp)} • {listing.location}
                        </p>
                        <p className="text-xs text-ink/55">Creada: {formatDate(listing.createdAt)}</p>
                      </div>
                      <span className="inline-flex rounded-full border border-platinum bg-platinum/50 px-3 py-1 text-xs font-semibold text-ink">
                        {getStatusLabel(listing.status)}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink/65">Aún no tienes publicaciones creadas.</p>
              )}
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-platinum bg-white p-6">
            <h2 className="font-heading text-2xl font-semibold text-ink">Inicia sesión para comenzar</h2>
            <p className="mt-2 text-sm text-ink/70">
              Una vez autenticado podrás cargar tu auto, pagar si corresponde y publicarlo en el marketplace de C4R.
            </p>
          </section>
        )}
      </section>
    </div>
  );
}
