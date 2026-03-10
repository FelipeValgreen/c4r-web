import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "chileautos.pxcrush.net",
      },
      {
        protocol: "https",
        hostname: "latam-editorial.pxcrush.net",
      },
      {
        protocol: "https",
        hostname: "www.fullmotor.cl",
      },
      {
        protocol: "https",
        hostname: "www.rtautomotriz.com",
      },
      {
        protocol: "https",
        hostname: "rtautomotriz.com",
      },
    ],
  },
};

export default nextConfig;
