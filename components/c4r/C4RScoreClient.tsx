"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Award, CheckCircle2, Shield, Star, TrendingUp, XCircle } from "lucide-react";
import TrackedLink from "@/components/TrackedLink";

type CheckState = "green" | "yellow" | "red";

type ScoreApiResponse = {
  plate: string;
  score: number;
  label: "Excelente" | "Bueno" | "Regular" | "Bajo";
  vehicle: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    price: number;
  };
  checks: Record<string, CheckState>;
  highlights: string[];
};

const benefits = [
  {
    icon: Shield,
    title: "Verificacion completa",
    description: "Incluye multas, prendas, siniestros, TAG, revision tecnica y emisiones.",
  },
  {
    icon: Star,
    title: "Confianza total",
    description: "Compradores y vendedores ven el mismo estado real del vehiculo.",
  },
  {
    icon: TrendingUp,
    title: "Venta mas rapida",
    description: "Autos con mejor score generan mas consultas y cierres mas rapidos.",
  },
  {
    icon: Award,
    title: "Respaldo C4R",
    description: "Integra un lenguaje comun de riesgo para decidir mejor.",
  },
];

const testimonials = [
  {
    quote: "El C4R Score me dio la confianza para comprar sin sorpresas.",
    author: "Maria Gonzalez",
  },
  {
    quote: "Como vendedor, me ayuda a filtrar dudas antes del primer contacto.",
    author: "Carlos Rodriguez",
  },
  {
    quote: "La transparencia del score acelera cada negociacion.",
    author: "Ana Morales",
  },
];

const checkLabels: Record<string, string> = {
  multas: "Multas",
  prendas: "Prendas",
  siniestros: "Siniestros",
  tag: "TAG",
  revision: "Revision tecnica",
  emisiones: "Emisiones",
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

export default function C4RScoreClient() {
  const [licensePlate, setLicensePlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [scoreData, setScoreData] = useState<ScoreApiResponse | null>(null);

  const verifyScore = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!licensePlate.trim()) {
      setError("Ingresa una patente valida para continuar.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: licensePlate }),
      });

      const data = (await response.json()) as ScoreApiResponse | { error: string };

      if (!response.ok || "error" in data) {
        setScoreData(null);
        setError("error" in data ? data.error : "No fue posible calcular el score.");
        return;
      }

      setScoreData(data);
      setNotice("Score generado correctamente.");
    } catch {
      setScoreData(null);
      setError("Error de conexion. Intenta nuevamente en unos segundos.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = useMemo(() => {
    if (!scoreData) return "text-ink";
    if (scoreData.score >= 80) return "text-success";
    if (scoreData.score >= 60) return "text-warning";
    return "text-error";
  }, [scoreData]);

  const checkIcon = (status: CheckState) => {
    if (status === "green") return <CheckCircle2 className="h-5 w-5 text-success" />;
    if (status === "yellow") return <AlertTriangle className="h-5 w-5 text-warning" />;
    return <XCircle className="h-5 w-5 text-error" />;
  };

  const checkLabel = (status: CheckState) => {
    if (status === "green") return "Sin problemas";
    if (status === "yellow") return "Revisar";
    return "Atencion";
  };

  const checkBadgeClass = (status: CheckState) => {
    if (status === "green") return "bg-success text-white";
    if (status === "yellow") return "bg-warning text-ink";
    return "bg-error text-white";
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[radial-gradient(circle_at_top,_rgba(176,161,110,0.24),transparent_58%)] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl lg:text-6xl">
              C4R Score: verificacion transparente para decidir mejor
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 sm:text-xl">
              Conoce el riesgo general de un vehiculo antes de comprar o vender.
            </p>

            <form onSubmit={verifyScore} className="mx-auto mt-10 max-w-2xl rounded-2xl border border-platinum bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-ink">Verifica una patente</h2>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Ingresa la patente (ej: ABC123)"
                  value={licensePlate}
                  onChange={(event) => {
                    setLicensePlate(formatPlate(event.target.value));
                    if (error) {
                      setError("");
                    }
                  }}
                  className="h-12 flex-1 rounded-lg border border-platinum px-4 text-ink uppercase tracking-wide outline-none transition focus-visible:ring-2 focus-visible:ring-khaki"
                  maxLength={7}
                />
                <button
                  type="submit"
                  disabled={loading || !licensePlate.trim()}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-khaki px-8 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verificando..." : "Verificar"}
                </button>
              </div>
              {error ? <p className="mt-3 text-sm font-medium text-error">{error}</p> : null}
              {notice ? <p className="mt-3 text-sm font-medium text-success">{notice}</p> : null}
              <p className="mt-2 text-xs text-gray-500">Prueba con: `ABCD12`, `XYZ123` o `DEF456`.</p>

              {scoreData ? (
                <div className="mt-8 text-center">
                  <p className={`text-6xl font-bold ${scoreColor}`}>{scoreData.score}</p>
                  <p className="mt-2 text-xl font-semibold text-ink">C4R Score: {scoreData.label}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {scoreData.vehicle.brand} {scoreData.vehicle.model} {scoreData.vehicle.year} • {scoreData.vehicle.mileage.toLocaleString("es-CL")} km
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    Referencia mercado: {scoreData.vehicle.price.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 })}
                  </p>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink sm:text-4xl">Como se calcula el score</h2>
            <p className="mt-4 text-lg text-gray-600">Consolidamos factores legales y operativos en una lectura simple.</p>
          </div>

          {scoreData ? (
            <>
              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(scoreData.checks).map(([check, status]) => (
                  <article key={check} className="rounded-xl border border-platinum bg-white p-5 text-center shadow-sm">
                    <div className="mx-auto flex w-fit items-center justify-center">{checkIcon(status)}</div>
                    <h3 className="mt-3 font-heading text-lg font-semibold text-ink">{checkLabels[check] ?? check}</h3>
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${checkBadgeClass(status)}`}>
                      {checkLabel(status)}
                    </span>
                  </article>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-platinum bg-white p-6 shadow-sm">
                <h3 className="font-heading text-xl font-semibold text-ink">Resumen rapido</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink/80">
                  {scoreData.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="bg-platinum py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-xl border border-platinum bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-khaki-light">
                  <benefit.icon className="h-7 w-7 text-khaki" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{benefit.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.author} className="rounded-xl border border-platinum bg-white p-6 shadow-sm">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${testimonial.author}-${index}`} className="h-4 w-4 fill-khaki text-khaki" />
                  ))}
                </div>
                <p className="mt-4 text-sm italic text-gray-700">{`"${testimonial.quote}"`}</p>
                <p className="mt-4 font-heading text-base font-semibold text-ink">{testimonial.author}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Decide con evidencia antes de cerrar tu negocio
          </h2>
          <p className="mt-5 text-lg text-gray-300">
            Usa C4R Score junto al reporte completo para reducir riesgo y negociar con claridad.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <TrackedLink
              href="/app/explorar"
              eventName="c4r_score_cta_explore"
              eventParams={{ location: "c4r_score_final_primary" }}
              className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-8 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
            >
              Explorar autos verificados
            </TrackedLink>
            <TrackedLink
              href="/c4r-check"
              eventName="c4r_score_cta_check"
              eventParams={{ location: "c4r_score_final_secondary" }}
              className="inline-flex h-11 items-center justify-center rounded-md border border-white px-8 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-ink"
            >
              Ir a C4R Check
            </TrackedLink>
          </div>
        </div>
      </section>
    </div>
  );
}
