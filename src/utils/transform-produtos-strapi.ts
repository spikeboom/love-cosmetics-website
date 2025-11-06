/**
 * Transforma produtos do Strapi para o formato esperado pelos componentes
 */

interface ProdutoMockado {
  imagem: string;
  nome: string;
  descricao?: string;
  desconto?: string;
  preco: number;
  precoOriginal?: number;
  parcelas?: string;
  rating?: number;
  ultimasUnidades?: boolean;
  slug?: string;
}

interface TransformProdutosOptions {
  produtosStrapi: any[];
  produtosMockados: ProdutoMockado[];
  limite?: number;
  incluirSlug?: boolean;
}

export function transformProdutosStrapi({
  produtosStrapi,
  produtosMockados,
  limite = 5,
  incluirSlug = true,
}: TransformProdutosOptions) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // Transforma produtos do Strapi para o formato esperado
  const produtosTransformados = produtosStrapi.slice(0, limite).map((produto: any, index: number) => {
    const imagemUrl = produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url
      || produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail?.url;

    // Preço final (com desconto) vindo do Strapi
    const preco = produto.preco || 0;
    // Preço original (de) vindo do Strapi
    const precoOriginal = produto.preco_de || null;

    // Calcula o desconto baseado no preço final e preço original
    let desconto = null;
    if (preco && precoOriginal && precoOriginal > preco) {
      const percentualDesconto = Math.round(((precoOriginal - preco) / precoOriginal) * 100);
      desconto = `${percentualDesconto}% OFF`;
    }

    // Pega a primeira descrição disponível da listaDescricao
    const descricao = produto.listaDescricao?.[0]?.descricao || produtosMockados[index % produtosMockados.length]?.descricao;

    // Calcula o valor de cada parcela (3x sem juros)
    const valorParcela = preco > 0 ? (preco / 3).toFixed(2).replace('.', ',') : null;
    const parcelasTexto = valorParcela ? `3x R$${valorParcela} sem juros` : produtosMockados[index % produtosMockados.length]?.parcelas;

    const produtoTransformado: any = {
      imagem: imagemUrl ? `${baseURL}${imagemUrl}` : produtosMockados[index % produtosMockados.length]?.imagem,
      nome: produto.nome || produtosMockados[index % produtosMockados.length]?.nome,
      descricao: descricao,
      desconto: desconto || produtosMockados[index % produtosMockados.length]?.desconto,
      preco: preco || produtosMockados[index % produtosMockados.length]?.preco,
      precoOriginal: precoOriginal || produtosMockados[index % produtosMockados.length]?.precoOriginal,
      parcelas: parcelasTexto,
      rating: produtosMockados[index % produtosMockados.length]?.rating,
      ultimasUnidades: produtosMockados[index % produtosMockados.length]?.ultimasUnidades,
    };

    // Adiciona slug se solicitado
    if (incluirSlug) {
      produtoTransformado.slug = produto.slug || null;
    }

    return produtoTransformado;
  });

  // Se não houver produtos do Strapi, usa os mockados
  return produtosTransformados.length > 0 ? produtosTransformados : produtosMockados;
}
