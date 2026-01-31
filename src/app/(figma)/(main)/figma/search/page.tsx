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
  const produtosMapeados = produtos?.map((produto: any) => {
    const preco = produto.preco || 0;
    const precoOriginal = produto.preco_de || undefined;

    // Calcula desconto se houver preço original
    let desconto = produto.tag_desconto_1;
    if (!desconto && preco && precoOriginal && precoOriginal > preco) {
      const percentualDesconto = Math.round(((precoOriginal - preco) / precoOriginal) * 100);
      desconto = `${percentualDesconto}% OFF`;
    }

    // Calcula parcelas (3x sem juros)
    const valorParcela = preco > 0 ? (preco / 3).toFixed(2).replace('.', ',') : null;
    const parcelas = produto.parcelamento || (valorParcela ? `3x R$${valorParcela} sem juros` : undefined);

    // Últimas unidades para Sérum e Espuma
    const ultimasUnidades = /s[ée]rum|espuma/i.test(produto.nome || '');

    // Pega descrição de várias fontes possíveis (prioriza descricaoResumida)
    const descricao = produto.descricaoResumida
      || produto.listaDescricao?.[0]?.descricao
      || produto.descricao_curta
      || produto.resumo
      || "Hidratação profunda com ativos da Amazônia";

    // Usa formato medium ou thumbnail da imagem
    const imagemUrl = produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url
      || produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail?.url
      || produto.carouselImagensPrincipal?.[0]?.imagem?.url;

    return {
      id: produto.id,
      slug: produto.slug,
      imagem: imagemUrl
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${imagemUrl}`
        : "/new-home/produtos/produto-1.png",
      nome: produto.nome || "Produto",
      descricao,
      preco,
      precoOriginal,
      desconto,
      parcelas,
      rating: produto.rating || 4.5,
      ultimasUnidades,
    };
  }) || [];

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
