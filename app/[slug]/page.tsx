import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingPlaceholder from "@/components/MarketingPlaceholder";

const pageMap: Record<string, { title: string; description: string }> = {
  "compra-segura": {
    title: "Compra segura en C4R",
    description:
      "Explora vehículos verificados, revisa su historial y compra con pago protegido para evitar estafas y sorpresas.",
  },
  "vende-rapido": {
    title: "Vende rápido y con respaldo",
    description:
      "Publica tu vehículo en minutos, llega a compradores reales y cierra la venta con respaldo en cada etapa.",
  },
  "dealers-hub": {
    title: "Dealers Hub",
    description:
      "Herramientas para concesionarios y flotas: inventario validado, trazabilidad y captación de compradores calificados.",
  },
  "como-funciona": {
    title: "Cómo funciona C4R",
    description:
      "Conoce el flujo completo: chequeo oficial, publicación, pago protegido y garantía de 7 días para tus transacciones.",
  },
  precios: {
    title: "Precios claros",
    description:
      "Modelos de cobro simples para personas y empresas, con transparencia de costos antes de publicar o comprar.",
  },
  comunidad: {
    title: "Comunidad C4R",
    description:
      "Aprende con contenido práctico, alertas antifraude y guías para tomar mejores decisiones en compra y venta.",
  },
  blog: {
    title: "Blog C4R",
    description:
      "Noticias, consejos y tendencias del mercado automotriz chileno para comprar y vender con más información.",
  },
  contacto: {
    title: "Contacto",
    description:
      "Habla con el equipo C4R para soporte, alianzas o dudas sobre el proceso de compra, venta y verificación.",
  },
  faq: {
    title: "Preguntas frecuentes",
    description:
      "Respuestas rápidas sobre verificación, garantías, pagos protegidos, tiempos de publicación y devoluciones.",
  },
  terminos: {
    title: "Términos y condiciones",
    description:
      "Condiciones de uso de la plataforma C4R, obligaciones de usuarios y alcances del servicio.",
  },
  privacidad: {
    title: "Política de privacidad",
    description:
      "Cómo recopilamos, usamos y protegemos tus datos personales al operar dentro de la plataforma C4R.",
  },
  cookies: {
    title: "Política de cookies",
    description:
      "Detalles de las cookies utilizadas para mejorar tu experiencia y medir el uso de nuestros productos.",
  },
  devoluciones: {
    title: "Política de devoluciones",
    description:
      "Revisa condiciones, plazos y cobertura de la garantía C4R Shield para devoluciones elegibles.",
  },
};

const staticSlugs = Object.keys(pageMap);

export const dynamicParams = false;

export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = pageMap[slug];

  if (!page) {
    return {
      title: "C4R",
    };
  }

  return {
    title: `${page.title} | C4R`,
    description: page.description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: `${page.title} | C4R`,
      description: page.description,
      url: `/${slug}`,
      type: "website",
      images: [
        {
          url: "/og-c4r.svg",
          width: 1200,
          height: 630,
          alt: "C4R",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${page.title} | C4R`,
      description: page.description,
      images: ["/og-c4r.svg"],
    },
  };
}

export default async function GenericPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pageMap[slug];

  if (!page) {
    notFound();
  }

  return <MarketingPlaceholder title={page.title} description={page.description} />;
}
