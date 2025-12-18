import { fetchProdutosForDesign } from "@/modules/produto/domain";
import { transformProdutosStrapi } from "@/utils/transform-produtos-strapi";
import VIPLandingClient from "./VIPLandingClient";

export const metadata = {
  title: "Grupo VIP Lovè - WhatsApp Exclusivo | Lové Cosméticos",
  description:
    "Entre no Grupo VIP Lovè e receba lançamentos, kits exclusivos, condições especiais e uma rotina de skincare guiada direto no seu WhatsApp. Gratuito!",
  openGraph: {
    title: "Grupo VIP Lovè - WhatsApp Exclusivo",
    description:
      "Lançamentos em primeira mão, kits exclusivos e rotina de skincare personalizada. Entre agora no VIP!",
    type: "website",
  },
};

// Produtos fallback caso o Strapi não retorne
const produtosFallback = [
  { nome: "Espuma Facial", descricao: "Limpeza suave para o rosto, removendo impurezas e preparando a pele para os próximos passos da rotina", imagem: "/new-home/produtos/produto-1.png", preco: 89.90, slug: "espuma-facial" },
  { nome: "Sérum Facial", descricao: "Tratamento concentrado com ativos amazônicos para potencializar resultados e performance da pele", imagem: "/new-home/produtos/produto-2.png", preco: 119.90, slug: "serum-facial" },
  { nome: "Hidratante Facial", descricao: "Hidratação profunda com textura leve, ideal para manter a pele nutrida e protegida durante o dia", imagem: "/new-home/produtos/produto-3.png", preco: 99.90, slug: "hidratante-facial" },
  { nome: "Manteiga Corporal", descricao: "Hidratação intensa para o corpo com manteiga de cupuaçu e ativos da Amazônia", imagem: "/new-home/produtos/produto-1.png", preco: 79.90, slug: "manteiga-corporal" },
  { nome: "Máscara de Argila", descricao: "Limpeza profunda e detox facial com argila amazônica, removendo toxinas e renovando a pele", imagem: "/new-home/produtos/produto-2.png", preco: 69.90, slug: "mascara-de-argila" },
];

export default async function VIPLandingPage() {
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
    console.error("[VIP Page] Erro ao buscar produtos do Strapi:", error);
  }

  return <VIPLandingClient produtos={produtos} />;
}
