import { fetchProdutosForDesign } from "@/modules/produto/domain";
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
  { nome: "Espuma Facial", descricao: "Limpeza suave e rotina diária", slug: "espuma-facial" },
  { nome: "Sérum Facial", descricao: "Tratamento e performance", slug: "serum-facial" },
  { nome: "Hidratante Facial", descricao: "Hidratação e sensorial premium", slug: "hidratante-facial" },
  { nome: "Manteiga Corporal", descricao: "Hidratação profunda", slug: "manteiga-corporal" },
  { nome: "Máscara de Argila", descricao: "Cuidado e renovação", slug: "mascara-de-argila" },
];

export default async function VIPLandingPage() {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi.lovecosmeticos.xyz";

  let produtos = produtosFallback;

  try {
    const response = await fetchProdutosForDesign();
    const produtosStrapi = response?.data || [];

    if (produtosStrapi.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      produtos = produtosStrapi.map((produto: any) => {
        // Pega a URL da imagem do Strapi
        const imagemUrl =
          produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url ||
          produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.small?.url ||
          produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail?.url ||
          produto.carouselImagensPrincipal?.[0]?.imagem?.url;

        // Pega a primeira descrição disponível
        const descricao =
          produto.listaDescricao?.[0]?.descricao ||
          produto.descricao_curta ||
          "Skincare premium amazônico";

        return {
          nome: produto.nome || "Produto Lovè",
          descricao: descricao,
          imagem: imagemUrl ? `${baseURL}${imagemUrl}` : undefined,
          preco: produto.preco || undefined,
          slug: produto.slug || undefined,
        };
      });
    }
  } catch (error) {
    console.error("[VIP Page] Erro ao buscar produtos do Strapi:", error);
    // Usa produtos fallback em caso de erro
  }

  return <VIPLandingClient produtos={produtos} />;
}
