import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { siteUrl } from "@/lib/site";
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
  metadataBase: new URL(siteUrl),
  title: "C4R - Compra y vende autos usados sin miedo a estafas",
  description:
    "Con C4R cada vehículo pasa por chequeo oficial, pago protegido y garantía de 7 días. El marketplace automotriz más seguro de Chile.",
  generator: "C4R",
  authors: [{ name: "C4R Team" }],
  alternates: {
    canonical: "/",
  },
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
    url: "/",
    siteName: "C4R",
    type: "website",
    locale: "es_CL",
    images: [
      {
        url: "/og-c4r.svg",
        width: 1200,
        height: 630,
        alt: "C4R - Compra y vende autos usados sin miedo a estafas",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "C4R - Compra y vende autos usados sin miedo a estafas",
    description:
      "Con C4R cada vehículo pasa por chequeo oficial, pago protegido y garantía de 7 días.",
    images: ["/og-c4r.svg"],
  },
  robots: {
    index: true,
    follow: true,
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
        <GoogleAnalytics />
      </body>
    </html>
  );
}
