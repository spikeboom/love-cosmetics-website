/**
 * Transforma produtos do Strapi para o formato esperado pelos componentes
 */

import { applyKitDiscountFromFinalPrice } from "@/core/pricing/kits";
import { isEsgotado } from "@/config/produtos-esgotados";

interface TransformProdutosOptions {
  produtosStrapi: any[];
  limite?: number;
  incluirSlug?: boolean;
}

export function transformProdutosStrapi({
  produtosStrapi,
  limite = 5,
  incluirSlug = true,
}: TransformProdutosOptions) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  return produtosStrapi.slice(0, limite).map((produto: any) => {
    const imagemUrl = produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url
      || produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail?.url;

    // Preço vindo do Strapi (já é o preço final)
    const precoStrapi = produto.preco || 0;
    // Preço original (de) vindo do Strapi (quando existe promoção real no cadastro)
    const precoOriginalStrapi = produto.preco_de || null;

    // Preço do Strapi já é o preço final - calcula preco_de a partir do desconto do kit
    const kitPricing = applyKitDiscountFromFinalPrice({
      finalPrice: precoStrapi,
      product: { nome: produto.nome, slug: produto.slug },
    });

    // Preço efetivo e "preço de" para exibição
    const preco = kitPricing?.preco ?? precoStrapi;
    const precoOriginal = kitPricing?.preco_de ?? precoOriginalStrapi;

    // Calcula o desconto baseado no preço final e preço original
    let desconto = null;
    if (kitPricing) {
      desconto = kitPricing.desconto;
    } else if (preco && precoOriginal && precoOriginal > preco) {
      const percentualDesconto = Math.round(((precoOriginal - preco) / precoOriginal) * 100);
      desconto = `${percentualDesconto}% OFF`;
    }

    // Pega descrição do Strapi
    const descricao = produto.descricaoResumida || produto.listaDescricao?.[0]?.descricao || null;

    // Calcula o valor de cada parcela (3x sem juros)
    const valorParcela = preco > 0 ? (preco / 3).toFixed(2).replace('.', ',') : null;
    const parcelas = valorParcela ? `3x R$${valorParcela} sem juros` : null;

    const produtoTransformado: any = {
      id: produto.id?.toString(),
      imagem: imagemUrl
        ? imagemUrl.startsWith("http") ? imagemUrl : `${baseURL}${imagemUrl}`
        : "/new-home/produtos/produto-1.png",
      nome: produto.nome || "Produto",
      descricao,
      desconto,
      preco,
      precoOriginal,
      parcelas,
      rating: produto.nota > 0 ? produto.nota : 4.5,
      // Últimas unidades apenas para Sérum e Espuma
      ultimasUnidades: /s[ée]rum|espuma/i.test(produto.nome || ''),
      esgotado: isEsgotado(produto.slug),
      // Campos extras para o carrinho
      preco_de: precoOriginal,
      bling_number: produto.bling_number,
      peso_gramas: produto.peso_gramas,
      altura: produto.altura,
      largura: produto.largura,
      comprimento: produto.comprimento,
    };

    if (incluirSlug) {
      produtoTransformado.slug = produto.slug || null;
    }

    return produtoTransformado;
  });
}
