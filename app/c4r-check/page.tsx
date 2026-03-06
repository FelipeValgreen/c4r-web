import type { Metadata } from "next";
import C4RCheckClient from "@/components/c4r/C4RCheckClient";

export const metadata: Metadata = {
  title: "C4R Check | Reporte por Patente",
  description:
    "Consulta historial legal y mecanico de un vehiculo por patente con score de confianza C4R.",
  alternates: {
    canonical: "/c4r-check",
  },
  openGraph: {
    title: "C4R Check | Reporte por Patente",
    description:
      "Consulta historial legal y mecanico de un vehiculo por patente con score de confianza C4R.",
    url: "/c4r-check",
    type: "website",
    images: [
      {
        url: "/og-c4r.svg",
        width: 1200,
        height: 630,
        alt: "C4R Check",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "C4R Check | Reporte por Patente",
    description:
      "Consulta historial legal y mecanico de un vehiculo por patente con score de confianza C4R.",
    images: ["/og-c4r.svg"],
  },
};

export default function C4RCheckPage() {
  return <C4RCheckClient />;
}
