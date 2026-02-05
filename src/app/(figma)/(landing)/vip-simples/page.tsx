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

export default async function VIPSimplesPage() {
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
    console.error("[VIP Simples] Erro ao buscar produtos do Strapi:", error);
  }

  return <VIPSimplesClient produtos={produtos} />;
}
