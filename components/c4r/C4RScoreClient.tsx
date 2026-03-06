"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Award, CheckCircle2, Shield, Star, TrendingUp, XCircle } from "lucide-react";
import TrackedLink from "@/components/TrackedLink";

type CheckState = "green" | "yellow" | "red";

type VehicleData = {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  checks: Record<string, CheckState>;
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

function randomState(score: number, high: number, medium: number): CheckState {
  if (score >= high) return "green";
  if (score >= medium) return "yellow";
  return "red";
}

export default function C4RScoreClient() {
  const [licensePlate, setLicensePlate] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  const verifyScore = () => {
    if (!licensePlate.trim()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const generatedScore = Math.floor(Math.random() * 100) + 1;
      setScore(generatedScore);
      setVehicleData({
        brand: "Toyota",
        model: "Corolla",
        year: 2022,
        mileage: 25000,
        price: 18500000,
        checks: {
          multas: randomState(generatedScore, 80, 50),
          prendas: randomState(generatedScore, 70, 40),
          siniestros: randomState(generatedScore, 75, 45),
          tag: randomState(generatedScore, 85, 55),
          revision: randomState(generatedScore, 90, 60),
          emisiones: randomState(generatedScore, 80, 50),
        },
      });
      setLoading(false);
    }, 1200);
  };

  const scoreColor = useMemo(() => {
    if (score === null) return "text-ink";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
  }, [score]);

  const scoreLabel = useMemo(() => {
    if (score === null) return "";
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bueno";
    if (score >= 40) return "Regular";
    return "Bajo";
  }, [score]);

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

            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-platinum bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-ink">Verifica una patente</h2>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Ingresa la patente (ej: ABC123)"
                  value={licensePlate}
                  onChange={(event) => setLicensePlate(event.target.value.toUpperCase())}
                  className="h-12 flex-1 rounded-lg border border-platinum px-4 text-ink outline-none transition focus-visible:ring-2 focus-visible:ring-khaki"
                />
                <button
                  type="button"
                  onClick={verifyScore}
                  disabled={loading || !licensePlate.trim()}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-khaki px-8 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verificando..." : "Verificar"}
                </button>
              </div>

              {score !== null && vehicleData && (
                <div className="mt-8 text-center">
                  <p className={`text-6xl font-bold ${scoreColor}`}>{score}</p>
                  <p className="mt-2 text-xl font-semibold text-ink">C4R Score: {scoreLabel}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {vehicleData.brand} {vehicleData.model} {vehicleData.year}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink sm:text-4xl">Como se calcula el score</h2>
            <p className="mt-4 text-lg text-gray-600">Consolidamos factores legales y operativos en una lectura simple.</p>
          </div>

          {vehicleData && (
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(vehicleData.checks).map(([check, status]) => (
                <article key={check} className="rounded-xl border border-platinum bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex w-fit items-center justify-center">{checkIcon(status)}</div>
                  <h3 className="mt-3 font-heading text-lg font-semibold capitalize text-ink">{check}</h3>
                  <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${checkBadgeClass(status)}`}>
                    {checkLabel(status)}
                  </span>
                </article>
              ))}
            </div>
          )}
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
