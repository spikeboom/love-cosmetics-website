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

export default async function VIPLandingPage() {
  let produtos: any[] = [];

  try {
    const response = await fetchProdutosForDesign();
    const produtosStrapi = response?.data || [];

    if (produtosStrapi.length > 0) {
      produtos = transformProdutosStrapi({
        produtosStrapi,
        limite: 5,
        incluirSlug: true,
      });
    }
  } catch (error) {
    console.error("[VIP Page] Erro ao buscar produtos do Strapi:", error);
  }

  return <VIPLandingClient produtos={produtos} />;
}
