import type { Metadata } from "next";
import C4RScoreClient from "@/components/c4r/C4RScoreClient";

export const metadata: Metadata = {
  title: "C4R Score | Riesgo del Vehiculo",
  description:
    "Evalua el nivel de riesgo de un auto con C4R Score usando señales legales y operativas en segundos.",
  alternates: {
    canonical: "/c4r-score",
  },
  openGraph: {
    title: "C4R Score | Riesgo del Vehiculo",
    description:
      "Evalua el nivel de riesgo de un auto con C4R Score usando señales legales y operativas en segundos.",
    url: "/c4r-score",
    type: "website",
    images: [
      {
        url: "/og-c4r.svg",
        width: 1200,
        height: 630,
        alt: "C4R Score",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "C4R Score | Riesgo del Vehiculo",
    description:
      "Evalua el nivel de riesgo de un auto con C4R Score usando señales legales y operativas en segundos.",
    images: ["/og-c4r.svg"],
  },
};

export default function C4RScorePage() {
  return <C4RScoreClient />;
}
