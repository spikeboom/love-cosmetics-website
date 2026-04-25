import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

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
        hostname: 'directus.lovecosmeticos.xyz',
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
  async rewrites() {
    return [
      // Raiz
      { source: '/', destination: '/figma/design' },
      // Main pages
      { source: '/cart', destination: '/figma/cart' },
      { source: '/search', destination: '/figma/search' },
      { source: '/product/:slug', destination: '/figma/product/:slug' },
      { source: '/entrar', destination: '/figma/entrar' },
      { source: '/cadastrar', destination: '/figma/cadastrar' },
      { source: '/esqueci-senha', destination: '/figma/esqueci-senha' },
      { source: '/sair', destination: '/figma/sair' },
      { source: '/sobre', destination: '/figma/sobre' },
      { source: '/fale-conosco', destination: '/figma/fale-conosco' },
      { source: '/experimento', destination: '/figma/experimento' },
      { source: '/test-mode', destination: '/figma/test-mode' },
      // Minha conta
      { source: '/minha-conta/pedidos', destination: '/figma/minha-conta/pedidos' },
      { source: '/minha-conta/pedidos/:id', destination: '/figma/minha-conta/pedidos/:id' },
      // Checkout
      { source: '/checkout', destination: '/figma/checkout' },
      { source: '/checkout/identificacao', destination: '/figma/checkout/identificacao' },
      { source: '/checkout/entrega', destination: '/figma/checkout/entrega' },
      { source: '/checkout/pagamento', destination: '/figma/checkout/pagamento' },
      { source: '/checkout/confirmacao', destination: '/figma/checkout/confirmacao' },
      { source: '/checkout/esqueci-senha', destination: '/figma/checkout/esqueci-senha' },
      { source: '/checkout/nova-senha', destination: '/figma/checkout/nova-senha' },
    ];
  },
  async redirects() {
    return [
      // Redireciona /figma/* para /* (URLs limpas)
      { source: '/figma/design', destination: '/', permanent: true },
      { source: '/figma/cart', destination: '/cart', permanent: true },
      { source: '/figma/search', destination: '/search', permanent: true },
      { source: '/figma/product/:slug', destination: '/product/:slug', permanent: true },
      { source: '/figma/entrar', destination: '/entrar', permanent: true },
      { source: '/figma/cadastrar', destination: '/cadastrar', permanent: true },
      { source: '/figma/esqueci-senha', destination: '/esqueci-senha', permanent: true },
      { source: '/figma/sair', destination: '/sair', permanent: true },
      { source: '/figma/sobre', destination: '/sobre', permanent: true },
      { source: '/figma/fale-conosco', destination: '/fale-conosco', permanent: true },
      { source: '/figma/experimento', destination: '/experimento', permanent: true },
      { source: '/figma/test-mode', destination: '/test-mode', permanent: true },
      { source: '/test', destination: '/test-mode', permanent: false },
      { source: '/teste', destination: '/test-mode', permanent: false },
      // Minha conta
      { source: '/figma/minha-conta/pedidos', destination: '/minha-conta/pedidos', permanent: true },
      { source: '/figma/minha-conta/pedidos/:id', destination: '/minha-conta/pedidos/:id', permanent: true },
      // Checkout
      { source: '/figma/checkout', destination: '/checkout', permanent: true },
      { source: '/figma/checkout/identificacao', destination: '/checkout/identificacao', permanent: true },
      { source: '/figma/checkout/entrega', destination: '/checkout/entrega', permanent: true },
      { source: '/figma/checkout/pagamento', destination: '/checkout/pagamento', permanent: true },
      { source: '/figma/checkout/confirmacao', destination: '/checkout/confirmacao', permanent: true },
      { source: '/figma/checkout/esqueci-senha', destination: '/checkout/esqueci-senha', permanent: true },
      { source: '/figma/checkout/nova-senha', destination: '/checkout/nova-senha', permanent: true },
      // Redireciona /figma para raiz
      { source: '/figma', destination: '/', permanent: true },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
