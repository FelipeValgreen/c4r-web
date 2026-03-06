import type { Metadata } from "next";
import Image from "next/image";
import { Award, Calendar, CheckCircle2, MessageCircle, Shield, Star, TrendingUp, Users } from "lucide-react";
import TrackedLink from "@/components/TrackedLink";

const benefits = [
  {
    icon: Shield,
    title: "Acceso exclusivo a autos verificados",
    description: "Primera opcion en vehiculos que pasan por nuestro proceso de validacion.",
  },
  {
    icon: Award,
    title: "Descuentos especiales",
    description: "Beneficios en servicios de verificacion y cobertura extendida.",
  },
  {
    icon: Users,
    title: "Comunidad de confianza",
    description: "Conecta con compradores y vendedores con historial validado.",
  },
  {
    icon: Star,
    title: "Soporte prioritario",
    description: "Atencion dedicada para resolver dudas y acelerar decisiones.",
  },
];

const testimonials = [
  {
    name: "Maria Gonzalez",
    role: "Miembro desde 2023",
    quote:
      "La comunidad C4R me dio la tranquilidad que necesitaba para comprar. El soporte y la transparencia hacen la diferencia.",
  },
  {
    name: "Carlos Ruiz",
    role: "Miembro desde 2022",
    quote: "Desde que entre a C4R consigo mejores opciones y cierro operaciones con menos incertidumbre.",
  },
  {
    name: "Ana Lopez",
    role: "Miembro desde 2023",
    quote: "El acceso anticipado a vehiculos verificados es el mayor valor para mi familia.",
  },
];

const membershipTiers = [
  {
    name: "Basico",
    price: "Gratis",
    features: ["Acceso a catalogo verificado", "Soporte por email", "Alertas de nuevos autos"],
    cta: "Unirme gratis",
    href: "/contacto",
    popular: false,
  },
  {
    name: "Premium",
    price: "$9.990/mes",
    features: [
      "Todo lo de Basico",
      "Descuentos exclusivos",
      "Soporte prioritario",
      "Acceso anticipado a autos",
      "Beneficios extendidos",
    ],
    cta: "Hacerse Premium",
    href: "/contacto",
    popular: true,
  },
  {
    name: "VIP",
    price: "$19.990/mes",
    features: ["Todo lo de Premium", "Asesor dedicado", "Inspeccion preferente", "Financiamiento preferencial"],
    cta: "Ser VIP",
    href: "/contacto",
    popular: false,
  },
];

const blogHighlights = [
  {
    title: "Como elegir tu primer auto usado",
    excerpt: "Guia para compradores primerizos con checklist legal y de inspeccion.",
    author: "Maria Gonzalez",
    date: "15 Ene 2026",
    image: "/car-placeholder.svg",
  },
  {
    title: "Financiamiento inteligente en 2026",
    excerpt: "Comparativa de opciones para financiar tu proximo vehiculo sin sobrecostos.",
    author: "Carlos Ruiz",
    date: "12 Ene 2026",
    image: "/hero-car.svg",
  },
  {
    title: "Historia real: compra segura en una semana",
    excerpt: "Paso a paso de una transaccion validada de punta a punta con C4R.",
    author: "Ana Lopez",
    date: "10 Ene 2026",
    image: "/car-placeholder.svg",
  },
];

const socialTiles = [
  { image: "/avatar-camila.svg", caption: "Miembros celebrando su compra verificada" },
  { image: "/avatar-javier.svg", caption: "Historias de venta segura" },
  { image: "/hero-car.svg", caption: "Vehiculos con reporte completo" },
  { image: "/car-placeholder.svg", caption: "Comunidad activa y colaborativa" },
];

export const metadata: Metadata = {
  title: "Comunidad C4R | Membresias y Beneficios",
  description:
    "Unete a la comunidad C4R para acceder a beneficios, contenido experto y autos verificados antes que el resto.",
  alternates: {
    canonical: "/comunidad-c4r",
  },
  openGraph: {
    title: "Comunidad C4R | Membresias y Beneficios",
    description:
      "Unete a la comunidad C4R para acceder a beneficios, contenido experto y autos verificados antes que el resto.",
    url: "/comunidad-c4r",
    type: "website",
    images: [
      {
        url: "/og-c4r.svg",
        width: 1200,
        height: 630,
        alt: "Comunidad C4R",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Comunidad C4R | Membresias y Beneficios",
    description:
      "Unete a la comunidad C4R para acceder a beneficios, contenido experto y autos verificados antes que el resto.",
    images: ["/og-c4r.svg"],
  },
};

export default function ComunidadC4RPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[radial-gradient(circle_at_top,_rgba(176,161,110,0.22),transparent_55%)] py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl lg:text-6xl">
            Unete a la comunidad mas confiable del mercado automotriz
          </h1>
          <p className="mt-6 text-lg text-gray-600 sm:text-xl">
            Acceso exclusivo, beneficios concretos y la tranquilidad de comprar entre pares verificados.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <TrackedLink
              href="/contacto"
              eventName="community_cta_join"
              eventParams={{ location: "community_hero_primary" }}
              className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-8 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
            >
              Unirme ahora
            </TrackedLink>
            <TrackedLink
              href="/como-funciona"
              eventName="community_cta_how"
              eventParams={{ location: "community_hero_secondary" }}
              className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-8 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Como funciona
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-xl border border-platinum bg-white p-6 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-khaki-light">
                  <benefit.icon className="h-7 w-7 text-khaki" />
                </div>
                <h2 className="mt-4 font-heading text-lg font-semibold text-ink">{benefit.title}</h2>
                <p className="mt-2 text-sm text-gray-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-platinum py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <article>
              <p className="font-heading text-4xl font-bold text-khaki">15,000+</p>
              <p className="mt-1 text-sm text-gray-600">Miembros activos</p>
            </article>
            <article>
              <p className="font-heading text-4xl font-bold text-khaki">98%</p>
              <p className="mt-1 text-sm text-gray-600">Satisfaccion</p>
            </article>
            <article>
              <p className="font-heading text-4xl font-bold text-khaki">$2.5M</p>
              <p className="mt-1 text-sm text-gray-600">Ahorro acumulado</p>
            </article>
            <article>
              <p className="font-heading text-4xl font-bold text-khaki">24/7</p>
              <p className="mt-1 text-sm text-gray-600">Soporte disponible</p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-xl border border-platinum bg-white p-6 shadow-sm">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${testimonial.name}-${index}`} className="h-4 w-4 fill-khaki text-khaki" />
                  ))}
                </div>
                <p className="mt-4 text-sm italic text-gray-700">{`"${testimonial.quote}"`}</p>
                <p className="mt-4 font-heading text-base font-semibold text-ink">{testimonial.name}</p>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-platinum py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink sm:text-4xl">Elige tu nivel de membresia</h2>
            <p className="mt-4 text-lg text-gray-600">Planes simples para distintos niveles de uso y acompanamiento.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {membershipTiers.map((tier) => (
              <article
                key={tier.name}
                className={`relative rounded-xl border bg-white p-6 shadow-sm ${
                  tier.popular ? "border-khaki ring-2 ring-khaki/30" : "border-platinum"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-khaki px-3 py-1 text-xs font-semibold text-ink">
                    Mas popular
                  </span>
                )}
                <h3 className="font-heading text-xl font-semibold text-ink">{tier.name}</h3>
                <p className="mt-2 font-heading text-3xl font-bold text-khaki">{tier.price}</p>
                <ul className="mt-6 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={`${tier.name}-${feature}`} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-khaki" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <TrackedLink
                  href={tier.href}
                  eventName="community_cta_membership"
                  eventParams={{ location: "community_tiers", tier: tier.name }}
                  className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                    tier.popular ? "bg-khaki text-ink hover:bg-khaki-dark" : "border border-ink text-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  {tier.cta}
                </TrackedLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink sm:text-4xl">Contenido de la comunidad</h2>
            <p className="mt-4 text-lg text-gray-600">Guias, casos reales y mejores practicas para transacciones seguras.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {blogHighlights.map((post) => (
              <article key={post.title} className="overflow-hidden rounded-xl border border-platinum bg-white shadow-sm">
                <div className="relative aspect-[4/3]">
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-semibold text-ink">{post.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <TrackedLink
              href="/blog"
              eventName="community_cta_blog"
              eventParams={{ location: "community_blog" }}
              className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-8 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Ver mas articulos
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="bg-platinum py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-ink sm:text-4xl">Nuestra comunidad en accion</h2>
            <p className="mt-4 text-lg text-gray-600">Historias reales de compradores y vendedores C4R.</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {socialTiles.map((tile) => (
              <article key={tile.caption} className="group relative overflow-hidden rounded-lg">
                <div className="relative aspect-square">
                  <Image src={tile.image} alt={tile.caption} fill className="object-cover" />
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/10 to-transparent p-3">
                  <p className="text-xs text-white">{tile.caption}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <TrackedLink
              href="https://instagram.com/c4r"
              target="_blank"
              rel="noreferrer"
              eventName="community_cta_instagram"
              eventParams={{ location: "community_social" }}
              className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-8 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Seguir en Instagram
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Listo para unirte a la comunidad C4R
          </h2>
          <p className="mt-5 text-lg text-gray-300">
            Da el siguiente paso para comprar y vender con mas respaldo y mejor informacion.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <TrackedLink
              href="/contacto"
              eventName="community_cta_final_join"
              eventParams={{ location: "community_final_primary" }}
              className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-8 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
            >
              Quiero unirme
            </TrackedLink>
            <TrackedLink
              href="/app/explorar"
              eventName="community_cta_final_explore"
              eventParams={{ location: "community_final_secondary" }}
              className="inline-flex h-11 items-center justify-center rounded-md border border-white px-8 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-ink"
            >
              Ver autos verificados
            </TrackedLink>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-300">
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-khaki" />
              Soporte prioritario
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-khaki" />
              Acceso anticipado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-khaki" />
              Beneficios reales
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
