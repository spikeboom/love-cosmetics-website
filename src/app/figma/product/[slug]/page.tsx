import { fetchProdutoBySlug } from "@/modules/produto/domain";
import { ProductPageClient } from "./ProductPageClient";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = params;

  try {
    const { data } = await fetchProdutoBySlug({ slug });
    const produto = data?.[0];

    if (!produto) {
      return {
        title: "Produto não encontrado - Lové Cosméticos",
        description: "Produto não encontrado",
      };
    }

    return {
      title: `Lové Cosméticos - ${produto.nome}`,
      description: produto.listaDescricao?.[0]?.descricao || "Beleza natural e sustentável",
    };
  } catch (error) {
    return {
      title: "Lové Cosméticos - Produto",
      description: "Beleza natural e sustentável",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  try {
    const { data } = await fetchProdutoBySlug({ slug });
    const produto = data?.[0];

    if (!produto) {
      notFound();
    }

    return <ProductPageClient produto={produto} />;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    notFound();
  }
}
