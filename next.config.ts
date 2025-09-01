import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi.lovecosmeticos.xyz',
      },
      {
        protocol: 'https',
        hostname: 'www.lovecosmetics.com.br',
      },
      {
        protocol: 'https',
        hostname: 'www.lovecosmeticos.xyz',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
      },
    ],
  },
};

export default nextConfig;
