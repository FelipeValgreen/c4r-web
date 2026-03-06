import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "C4R - Compra y vende autos usados sin miedo a estafas",
  description:
    "Con C4R cada vehículo pasa por chequeo oficial, pago protegido y garantía de 7 días. El marketplace automotriz más seguro de Chile.",
  generator: "C4R",
  authors: [{ name: "C4R Team" }],
  keywords: [
    "autos usados",
    "compra segura",
    "venta rápida",
    "marketplace automotriz",
    "Chile",
  ],
  openGraph: {
    title: "C4R - Compra y vende autos usados sin miedo a estafas",
    description:
      "Con C4R cada vehículo pasa por chequeo oficial, pago protegido y garantía de 7 días.",
    type: "website",
    locale: "es_CL",
  },
  twitter: {
    card: "summary",
    title: "C4R - Compra y vende autos usados sin miedo a estafas",
    description:
      "Con C4R cada vehículo pasa por chequeo oficial, pago protegido y garantía de 7 días.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} bg-white text-ink antialiased`}
      >
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
