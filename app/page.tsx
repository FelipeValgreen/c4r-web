import Image from "next/image";
import { ArrowRight, CheckCircle2, CreditCard, Shield } from "lucide-react";
import TrackedLink from "@/components/TrackedLink";
import { c4rVehicles, formatCurrencyClp, formatKm } from "@/lib/chileautos-vehicles";

const trustPillars = [
  {
    title: "Chequeo obligatorio con C4R Check",
    description: "Cada vehículo pasa por validación técnica y legal antes de publicarse. Sin excepciones.",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  {
    title: "Pago protegido en escrow",
    description: "Tu dinero está seguro hasta que recibas el auto en perfectas condiciones.",
    icon: CreditCard,
    iconColor: "text-khaki",
  },
  {
    title: "Garantía C4R Shield",
    description: "7 días o 300 km para devolver el auto si no cumple con lo prometido.",
    icon: Shield,
    iconColor: "text-warning",
  },
];

const heroPriorityMakes = [
  "audi",
  "bmw",
  "mercedes-benz",
  "lexus",
  "volvo",
  "kia",
  "toyota",
  "hyundai",
  "nissan",
  "volkswagen",
  "chevrolet",
  "peugeot",
  "opel",
];

const blockedHeroBodyStyles = new Set(["Media Barandas", "Chasis Cabina", "Furgón", "Van", "Pick-up"]);

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getHeroScore(vehicle: (typeof c4rVehicles)[number]) {
  const make = normalizeValue(vehicle.make);
  const body = normalizeValue(vehicle.bodyStyle);
  const transmission = normalizeValue(vehicle.transmission);

  let score = 0;

  const makeRank = heroPriorityMakes.indexOf(make);
  if (makeRank >= 0) {
    score += 40 - makeRank;
  }

  if (body.includes("suv")) {
    score += 26;
  } else if (body.includes("sedan")) {
    score += 18;
  } else if (body.includes("hatchback")) {
    score += 14;
  }

  if (transmission.includes("auto")) {
    score += 12;
  }

  if (vehicle.year >= 2025) {
    score += 10;
  } else if (vehicle.year >= 2024) {
    score += 6;
  }

  score += Math.min(Math.round(vehicle.priceClp / 1_000_000), 80);
  score += Math.min(vehicle.gallery.length, 10);

  return score;
}

const heroPool = c4rVehicles.filter((vehicle) => !blockedHeroBodyStyles.has(vehicle.bodyStyle));
const sortedHeroPool = [...(heroPool.length > 0 ? heroPool : c4rVehicles)].sort((left, right) => {
  const scoreDiff = getHeroScore(right) - getHeroScore(left);
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  if (right.year !== left.year) {
    return right.year - left.year;
  }

  return right.priceClp - left.priceClp;
});

const heroVehicle = sortedHeroPool[0] ?? c4rVehicles[0];
const featuredCatalog = sortedHeroPool.slice(0, 6);

const testimonials = [
  {
    quote:
      "Gracias a C4R compré mi auto sin miedo a fraudes. El proceso de verificación me dio total tranquilidad.",
    name: "Camila Rodriguez",
    city: "Santiago",
    avatar: "/avatar-camila.svg",
  },
  {
    quote: "Vendí mi auto en una semana con C4R. El pago protegido me dio la seguridad que necesitaba.",
    name: "Javier Morales",
    city: "Valparaíso",
    avatar: "/avatar-javier.svg",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(176,161,110,0.18),transparent_45%)]" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div className="reveal">
              <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Compra y vende autos usados sin miedo a estafas.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                Con C4R cada vehículo pasa por chequeo oficial, pago protegido y garantía de 7 días.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <TrackedLink
                  href="/app/explorar"
                  eventName="home_cta_explore"
                  eventParams={{ location: "hero_primary" }}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-8 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki focus-visible:ring-offset-2"
                >
                  Explorar autos verificados
                </TrackedLink>
                <TrackedLink
                  href="/como-funciona"
                  eventName="home_cta_how_it_works"
                  eventParams={{ location: "hero_secondary" }}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-6 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  Cómo funciona
                </TrackedLink>
              </div>
            </div>

            <div className="reveal reveal-delay-1 flex items-center justify-center">
              <div className="relative">
                <Image
                  src={heroVehicle.coverImage}
                  alt={`${heroVehicle.title} verificado con sello C4R Shield`}
                  width={620}
                  height={420}
                  priority
                  className="w-full max-w-xl rounded-2xl border border-platinum shadow-[0_25px_70px_-30px_rgba(44,44,44,0.45)]"
                />
                <span className="absolute -right-3 -top-3 inline-flex items-center rounded-full bg-success px-4 py-2 text-sm font-semibold text-white shadow-lg">
                  C4R Shield
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-heading text-3xl font-bold text-ink sm:text-4xl">¿Por qué elegir C4R?</h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Tres pilares que garantizan tu seguridad en cada transacción
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
              {trustPillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <article
                    key={pillar.title}
                    className={`reveal rounded-2xl border border-platinum bg-white p-6 text-center shadow-sm reveal-delay-${Math.min(index, 2)}`}
                  >
                    <Icon className={`mx-auto h-9 w-9 ${pillar.iconColor}`} />
                    <h3 className="mt-5 text-lg font-semibold text-ink">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600">{pillar.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-platinum py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-heading text-3xl font-bold text-ink sm:text-4xl">¿Por qué C4R?</h2>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <h3 className="mb-8 text-xl font-semibold text-ink">Problemas del mercado actual:</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-error" />
                    Multas ocultas y deudas no declaradas
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-error" />
                    Fraudes y estafas en pagos
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-error" />
                    Demoras de meses para vender
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-8 text-xl font-semibold text-ink">Cómo lo resuelve C4R:</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                    Validación completa y transparente
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                    Pago 100% seguro y protegido
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                    Ventas rápidas con compradores verificados
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-heading text-3xl font-bold text-ink sm:text-4xl">
                Autos verificados disponibles
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Cada auto pasa por nuestro proceso de verificación C4R Check
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredCatalog.map((vehicle, index) => (
                <article
                  key={vehicle.id}
                  className={`reveal overflow-hidden rounded-2xl border border-platinum bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg reveal-delay-${Math.min(index % 3, 2)}`}
                >
                  <TrackedLink
                    href={`/app/explorar/${vehicle.slug}`}
                    eventName="home_featured_vehicle_open"
                    eventParams={{ location: "home_catalog", vehicleId: vehicle.id }}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] bg-[linear-gradient(145deg,#f7f7f4,#e6e4db)]">
                      <Image
                        src={vehicle.coverImage}
                        alt={vehicle.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="space-y-3 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-heading text-lg font-semibold text-ink">{vehicle.title}</h3>
                        <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
                          Verificado
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatCurrencyClp(vehicle.priceClp)} • {formatKm(vehicle.km)}
                      </p>
                    </div>
                  </TrackedLink>
                </article>
              ))}
            </div>

            <div className="mt-14 text-center">
              <TrackedLink
                href="/app/explorar"
                eventName="home_catalog_explore"
                eventParams={{ location: "catalog_section" }}
                className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-8 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
              >
                Explorar más autos verificados
                <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-heading text-3xl font-bold text-ink sm:text-4xl">
                Lo que dicen nuestros usuarios
              </h2>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
              {testimonials.map((testimonial, index) => (
                <figure
                  key={testimonial.name}
                  className={`reveal rounded-2xl border border-platinum bg-white p-8 shadow-sm reveal-delay-${Math.min(index, 2)}`}
                >
                  <blockquote className="text-lg leading-8 text-gray-900">
                    <p>{`"${testimonial.quote}"`}</p>
                  </blockquote>
                  <figcaption className="mt-8 flex items-center gap-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full border border-platinum"
                    />
                    <div>
                      <div className="font-semibold text-ink">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.city}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink py-16 sm:py-24">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
            <h2 className="text-balance font-heading text-3xl font-bold text-white sm:text-4xl">
              Vende tu auto en días, no en meses.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Publica gratis en C4R y recibe ofertas reales con pago protegido.
            </p>
            <div className="mt-10">
              <TrackedLink
                href="/vende-rapido"
                eventName="home_cta_sell"
                eventParams={{ location: "sell_section" }}
                className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-8 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
              >
                Publicar mi auto ahora
              </TrackedLink>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-heading text-3xl font-bold text-ink sm:text-4xl">Confían en nosotros</h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">Para hacer el mercado automotriz más seguro</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 text-center text-base font-semibold text-gray-500 sm:grid-cols-4">
              <div className="rounded-xl border border-platinum px-4 py-5">BancoEstado</div>
              <div className="rounded-xl border border-platinum px-4 py-5">Santander</div>
              <div className="rounded-xl border border-platinum px-4 py-5">BCI</div>
              <div className="rounded-xl border border-platinum px-4 py-5">Falabella</div>
            </div>
          </div>
        </section>

        <section className="bg-khaki py-16 sm:py-24">
          <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
            <h2 className="text-balance font-heading text-3xl font-bold text-ink sm:text-4xl">
              Compra, vende y financia tu auto en un solo lugar seguro.
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <TrackedLink
                href="/app/explorar"
                eventName="home_final_cta_explore"
                eventParams={{ location: "final_section_primary" }}
                className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-8 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Explorar autos verificados
              </TrackedLink>
              <TrackedLink
                href="/comunidad-c4r"
                eventName="home_final_cta_community"
                eventParams={{ location: "final_section_secondary" }}
                className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-6 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Unirme a la comunidad C4R
              </TrackedLink>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
