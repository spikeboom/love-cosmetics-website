import { fetchProdutosForSearch } from "@/modules/produto/domain";
import { SearchPageClient } from "./SearchPageClient";

export const metadata = {
  title: "Lové Cosméticos - Busca de Produtos",
  description: "Encontre os melhores produtos de beleza natural e sustentável",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  const { data: produtos } = await fetchProdutosForSearch({ q: query });

  // Mapeia os produtos do Strapi para o formato esperado pelo componente
  const produtosMapeados = produtos?.map((produto: any) => ({
    id: produto.id,
    slug: produto.slug,
    imagem: produto.carouselImagensPrincipal?.[0]?.imagem?.url
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${produto.carouselImagensPrincipal[0].imagem.url}`
      : "/new-home/produtos/produto-1.png",
    nome: produto.nome || "Produto",
    descricao: produto.listaDescricao?.[0]?.descricao || "",
    preco: produto.preco || 0,
    precoOriginal: produto.preco_de || undefined,
    desconto: produto.tag_desconto_1 || undefined,
    parcelas: produto.parcelamento || undefined,
    rating: produto.rating || 4,
    ultimasUnidades: produto.ultimasUnidades || false,
  })) || [];

  // Define o título baseado na busca
  const getTitulo = () => {
    if (!query || query.trim() === "") return "Todos os Produtos";
    if (query.toLowerCase().includes("rotina-essencial") || query.toLowerCase().includes("rotina essencial")) {
      return "Rotina Essencial Lové";
    }
    if (query.toLowerCase().includes("kit")) return "Kits";
    return `Resultados para "${query}"`;
  };

  return (
    <SearchPageClient
      produtos={produtosMapeados}
      titulo={getTitulo()}
      query={query}
    />
  );
}
