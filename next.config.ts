import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "strapi.lovecosmeticos.xyz",
      "www.lovecosmetics.com.br",
      "www.lovecosmeticos.xyz",
    ],
  },
};

export default nextConfig;
