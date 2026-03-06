const fallbackSiteUrl = "https://v0-c4-r.vercel.app";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl).replace(/\/+$/, "");

export const marketingSlugs = [
  "compra-segura",
  "vende-rapido",
  "dealers-hub",
  "como-funciona",
  "precios",
  "comunidad",
  "blog",
  "contacto",
  "faq",
  "terminos",
  "privacidad",
  "cookies",
  "devoluciones",
];

export const marketingRoutes = marketingSlugs.map((slug) => `/${slug}`);
