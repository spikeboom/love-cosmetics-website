import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
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
      {
        protocol: 'https',
        hostname: 'sandbox.api.pagseguro.com',
      },
      {
        protocol: 'https',
        hostname: 'api.pagseguro.com',
      },
    ],
  },
};

export default nextConfig;
