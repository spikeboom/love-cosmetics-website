import { fetchProdutosForDesign } from "@/modules/produto/domain";
import { transformProdutosStrapi } from "@/utils/transform-produtos-strapi";
import VIPSimplesClient from "./VIPSimplesClient";

export const metadata = {
  title: "Grupo VIP Lovè - WhatsApp Exclusivo | Lové Cosméticos",
  description:
    "Entre no Grupo VIP Lovè e receba lançamentos, ofertas exclusivas, dicas das nossas especialistas e muito mais. Gratuito!",
  openGraph: {
    title: "Grupo VIP Lovè - WhatsApp Exclusivo",
    description:
      "Lançamentos em primeira mão, ofertas exclusivas e dicas de skincare. Entre agora no VIP!",
    type: "website",
  },
};

// Produtos fallback caso o Strapi não retorne
const produtosFallback = [
  { nome: "Espuma Facial", descricao: "Limpeza suave para o rosto", imagem: "/new-home/produtos/produto-1.png", preco: 89.90, slug: "espuma-facial" },
  { nome: "Sérum Facial", descricao: "Tratamento concentrado com ativos amazônicos", imagem: "/new-home/produtos/produto-2.png", preco: 119.90, slug: "serum-facial" },
  { nome: "Hidratante Facial", descricao: "Hidratação profunda com textura leve", imagem: "/new-home/produtos/produto-3.png", preco: 99.90, slug: "hidratante-facial" },
  { nome: "Manteiga Corporal", descricao: "Hidratação intensa para o corpo", imagem: "/new-home/produtos/produto-1.png", preco: 79.90, slug: "manteiga-corporal" },
  { nome: "Máscara de Argila", descricao: "Limpeza profunda e detox facial", imagem: "/new-home/produtos/produto-2.png", preco: 69.90, slug: "mascara-de-argila" },
];

export default async function VIPSimplesPage() {
  let produtos = produtosFallback;

  try {
    const response = await fetchProdutosForDesign();
    const produtosStrapi = response?.data || [];

    if (produtosStrapi.length > 0) {
      produtos = transformProdutosStrapi({
        produtosStrapi,
        produtosMockados: produtosFallback,
        limite: 5,
        incluirSlug: true,
      });
    }
  } catch (error) {
    console.error("[VIP Simples] Erro ao buscar produtos do Strapi:", error);
  }

  return <VIPSimplesClient produtos={produtos} />;
}
