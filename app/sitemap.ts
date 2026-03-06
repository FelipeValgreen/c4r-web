import type { MetadataRoute } from "next";
import { marketingRoutes, siteUrl } from "@/lib/site";

const coreRoutes = ["/", "/app/explorar", "/c4r-check", "/c4r-score", "/comunidad-c4r"];
const allRoutes = [...coreRoutes, ...marketingRoutes];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return allRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/app/explorar" ? 0.9 : 0.7,
  }));
}
