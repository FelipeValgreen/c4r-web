import type { MetadataRoute } from "next";
import { marketingRoutes, siteUrl } from "@/lib/site";
import { blogPosts } from "@/lib/blog-posts";
import { getMarketplaceVehicles } from "@/lib/marketplace-catalog";

const coreRoutes = ["/", "/app/explorar", "/publicar-auto", "/c4r-check", "/c4r-score", "/comunidad-c4r"];
const blogPostRoutes = blogPosts.map((post) => `/blog/${post.slug}`);
const staticRoutes = [...coreRoutes, ...marketingRoutes, ...blogPostRoutes];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getMarketplaceVehicles();
  const vehicleDetailRoutes = vehicles.map((vehicle) => `/app/explorar/${vehicle.slug}`);
  const allRoutes = [...staticRoutes, ...vehicleDetailRoutes];
  const now = new Date();

  return allRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/app/explorar" ? 0.9 : 0.7,
  }));
}
