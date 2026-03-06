"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Car, CheckCircle2, Clock3, FileText, Search, Shield, XCircle } from "lucide-react";
import TrackedLink from "@/components/TrackedLink";

type Severity = "low" | "medium" | "high";
type Recommendation = "buy" | "review" | "avoid";

type VehicleCheckResult = {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuel: string;
  transmission: string;
  mileage: number;
  owners: number;
  fines: {
    count: number;
    amount: number;
  };
  technicalReview: {
    valid: boolean;
    expiresAt: string;
  };
  insurance: {
    valid: boolean;
    company: string;
  };
  accidents: Array<{
    date: string;
    type: string;
    severity: Severity;
    description: string;
  }>;
  maintenance: Array<{
    date: string;
    mileage: number;
    type: string;
    workshop: string;
  }>;
  trustScore: number;
  recommendation: Recommendation;
};

function formatPlate(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (cleaned.length <= 4) {
    return cleaned;
  }

  if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }

  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}`;
}

export default function C4RCheckClient() {
  const [plate, setPlate] = useState("");
  const [result, setResult] = useState<VehicleCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const scoreStyle = useMemo(() => {
    if (!result) {
      return { text: "text-ink", bg: "bg-platinum" };
    }

    if (result.trustScore >= 80) {
      return { text: "text-success", bg: "bg-success/10" };
    }

    if (result.trustScore >= 60) {
      return { text: "text-warning", bg: "bg-warning/10" };
    }

    return { text: "text-error", bg: "bg-error/10" };
  }, [result]);

  const recommendationText = useMemo(() => {
    if (!result) {
      return "";
    }

    if (result.recommendation === "buy") {
      return "Recomendado para compra";
    }

    if (result.recommendation === "review") {
      return "Revisar antes de comprar";
    }

    return "No recomendado";
  }, [result]);

  const recommendationIcon = useMemo(() => {
    if (!result) {
      return <Clock3 className="h-5 w-5 text-ink" />;
    }

    if (result.recommendation === "buy") {
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    }

    if (result.recommendation === "review") {
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    }

    return <XCircle className="h-5 w-5 text-error" />;
  }, [result]);

  const submitSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!plate.trim()) {
      setError("Ingresa una patente valida para continuar.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate }),
      });

      const data = (await response.json()) as VehicleCheckResult | { error: string };

      if (!response.ok || "error" in data) {
        setResult(null);
        setError("error" in data ? data.error : "No fue posible generar el reporte.");
        return;
      }

      setResult(data);
      setNotice("Reporte generado correctamente.");
    } catch {
      setResult(null);
      setError("Error de conexion. Intenta nuevamente en unos segundos.");
    } finally {
      setLoading(false);
    }
  };

  const severityClass = (severity: Severity) => {
    if (severity === "low") return "bg-success/10 text-success";
    if (severity === "medium") return "bg-warning/10 text-warning";
    return "bg-error/10 text-error";
  };

  const badgeClass = (condition: boolean) => {
    return condition ? "bg-success text-white" : "bg-error text-white";
  };

  return (
    <main className="min-h-screen bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <header className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-khaki-light px-4 py-1 text-sm font-semibold text-ink">
            <Shield className="h-4 w-4" />
            C4R Check
          </div>
          <h1 className="mt-5 font-heading text-4xl font-bold text-ink sm:text-5xl">Reporte completo por patente</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Consulta estado legal, historial de accidentes y score de confianza en segundos.
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-platinum bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={submitSearch} className="space-y-4">
            <label htmlFor="plate" className="block text-sm font-semibold text-ink">
              Patente del vehiculo
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="plate"
                type="text"
                value={plate}
                onChange={(event) => {
                  setPlate(formatPlate(event.target.value));
                  if (error) {
                    setError("");
                  }
                }}
                placeholder="ABCD-12 o AB12-34"
                className={`h-12 w-full rounded-lg border px-4 text-base uppercase tracking-wide text-ink outline-none transition focus-visible:ring-2 focus-visible:ring-khaki ${
                  error ? "border-error" : "border-platinum"
                }`}
                maxLength={7}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading || !plate.trim()}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-khaki px-6 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Generando reporte..." : "Generar reporte"}
              </button>
            </div>
            {error && <p className="text-sm font-medium text-error">{error}</p>}
            {notice && <p className="text-sm font-medium text-success">{notice}</p>}
            <p className="text-xs text-gray-500">Prueba con: `ABCD12`, `XYZ123` o `DEF456`.</p>
          </form>
        </section>

        {!result && (
          <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-platinum bg-white p-5 text-center shadow-sm">
              <Shield className="mx-auto h-8 w-8 text-khaki" />
              <h2 className="mt-3 font-heading text-lg font-semibold text-ink">Estado legal</h2>
              <p className="mt-2 text-sm text-gray-600">Revisión técnica, seguro obligatorio y multas pendientes.</p>
            </article>
            <article className="rounded-xl border border-platinum bg-white p-5 text-center shadow-sm">
              <FileText className="mx-auto h-8 w-8 text-khaki" />
              <h2 className="mt-3 font-heading text-lg font-semibold text-ink">Historial completo</h2>
              <p className="mt-2 text-sm text-gray-600">Accidentes registrados, propietarios y mantenciones.</p>
            </article>
            <article className="rounded-xl border border-platinum bg-white p-5 text-center shadow-sm">
              <Search className="mx-auto h-8 w-8 text-khaki" />
              <h2 className="mt-3 font-heading text-lg font-semibold text-ink">Resultado instantaneo</h2>
              <p className="mt-2 text-sm text-gray-600">Reporte listo en segundos para decidir con mas confianza.</p>
            </article>
          </section>
        )}

        {result && (
          <section className="mt-8 space-y-6">
            <article className="rounded-2xl border border-platinum bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-ink">
                <Car className="h-5 w-5 text-khaki" />
                Datos del vehiculo
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-gray-500">Marca/Modelo</p>
                  <p className="font-semibold text-ink">{result.brand} {result.model}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ano</p>
                  <p className="font-semibold text-ink">{result.year}</p>
                </div>
                <div>
                  <p className="text-gray-500">Color</p>
                  <p className="font-semibold text-ink">{result.color}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kilometraje</p>
                  <p className="font-semibold text-ink">{result.mileage.toLocaleString("es-CL")} km</p>
                </div>
              </div>
            </article>

            <article className={`rounded-2xl border border-platinum p-6 shadow-sm ${scoreStyle.bg}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {recommendationIcon}
                  <p className="font-heading text-xl font-semibold text-ink">Score de confianza</p>
                </div>
                <p className={`text-3xl font-bold ${scoreStyle.text}`}>{result.trustScore}/100</p>
              </div>
              <p className={`mt-2 text-sm font-semibold ${scoreStyle.text}`}>{recommendationText}</p>
            </article>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-platinum bg-white p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-ink">Estado legal</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Revision tecnica</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(result.technicalReview.valid)}`}>
                      {result.technicalReview.valid ? "Vigente" : "Vencida"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Seguro obligatorio</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(result.insurance.valid)}`}>
                      {result.insurance.valid ? "Vigente" : "No vigente"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Multas pendientes</span>
                    <span className="font-semibold text-ink">
                      {result.fines.count} ({result.fines.amount.toLocaleString("es-CL")})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Propietarios</span>
                    <span className="font-semibold text-ink">{result.owners}</span>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-platinum bg-white p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-ink">Historial de accidentes</h3>
                {result.accidents.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-600">No se registran accidentes en la base consultada.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {result.accidents.map((accident) => (
                      <div key={`${accident.date}-${accident.type}`} className="rounded-lg border border-platinum p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-ink">{accident.type}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityClass(accident.severity)}`}>
                            {accident.severity === "low" ? "Leve" : accident.severity === "medium" ? "Moderado" : "Grave"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{accident.date}</p>
                        <p className="mt-1 text-sm text-gray-700">{accident.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>

            <article className="rounded-2xl border border-platinum bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-semibold text-ink">Historial de mantenciones</h3>
              {result.maintenance.length === 0 ? (
                <p className="mt-4 text-sm text-gray-600">No hay mantenciones registradas.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {result.maintenance.map((item) => (
                    <div key={`${item.date}-${item.mileage}`} className="flex items-center justify-between rounded-lg bg-platinum/55 p-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{item.type}</p>
                        <p className="text-xs text-gray-600">{item.workshop}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{item.date}</p>
                        <p className="text-sm font-semibold text-ink">{item.mileage.toLocaleString("es-CL")} km</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setNotice("");
                }}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-ink px-6 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Nueva busqueda
              </button>
              <TrackedLink
                href="/app/explorar"
                eventName="c4r_check_cta_explore"
                eventParams={{ location: "c4r_check_results" }}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-khaki px-6 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
              >
                Explorar autos verificados
              </TrackedLink>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
