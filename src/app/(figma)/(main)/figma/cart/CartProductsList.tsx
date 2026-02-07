'use client';

import { CartProductCard } from './CartProductCard';
import { getItemDiscountBadges } from '@/core/pricing/resumo-compra';

interface Product {
  id: string;
  nome: string;
  preco: number;
  precoAntigo?: number;
  descontoPercentual?: number;
  carouselImagensPrincipal?: Array<{
    imagem?: {
      formats?: {
        medium?: { url: string };
        thumbnail?: { url: string };
      };
    };
  }>;
  tags?: Array<{
    texto: string;
    icon?: string;
    tipo?: 'alerta' | 'sucesso';
  }>;
}

interface ProdutoDesatualizado {
  id: string;
  nome: string;
  precoCarrinho: number;
  precoAtual: number;
  precoAtualComCupom: number;
}

interface CartProductsListProps {
  produtos: any[];
  cupons?: any[];
  onAdd: (data: { product: any }) => void;
  onSubtract: (data: { product: any }) => void;
  onRemove: (data: { product: any }) => void;
  produtosDesatualizados?: ProdutoDesatualizado[];
}

export function CartProductsList({
  produtos,
  cupons = [],
  onAdd,
  onSubtract,
  onRemove,
  produtosDesatualizados = [],
}: CartProductsListProps) {
  // Criar mapa de produtos desatualizados para lookup rápido
  const desatualizadosMap = new Map(
    produtosDesatualizados.map(p => [p.id, p])
  );
  const getImageUrl = (produto: any) => {
    // Primeiro tenta usar imagem direta (do CardProduto)
    if (produto.imagem) {
      return produto.imagem;
    }
    // Fallback para carouselImagensPrincipal (do ProductPageClient)
    const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const imagemUrl =
      produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url ||
      produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail?.url;
    return imagemUrl ? `${baseURL}${imagemUrl}` : undefined;
  };

  return (
    <div className="flex flex-col gap-6">
      {produtos.map((produto, index) => {
        // Verificar se tem cupom aplicado
        const temCupomAplicado = !!produto.cupom_applied || !!produto.backup?.preco;

        // Preço atual (já com todos os descontos aplicados)
        const precoAtual = produto.preco;

        // Preço base antes do cupom (usado para calcular desconto acumulado)
        const precoAntesDosCupom = produto.backup?.preco ?? produto.preco;

        // Preço original (preco_de) - o valor riscado
        // Se tem cupom aplicado, usa o preco_de do backup ou o preco antes do cupom
        // Se não tem cupom, usa o preco_de do produto (se existir)
        let precoAntigo: number | undefined;

        if (temCupomAplicado) {
          // Com cupom: mostrar preco_de riscado (do backup ou calcular)
          // preco_de do backup é o preço original do kit ou do produto
          precoAntigo = produto.backup?.preco_de ?? produto.preco_de ?? precoAntesDosCupom;
          // Se o precoAntigo for igual ao precoAtual, não faz sentido mostrar riscado
          if (precoAntigo && precoAntigo <= precoAtual) {
            precoAntigo = undefined;
          }
        } else {
          // Sem cupom: mostrar preco_de apenas se existir e for maior que o preço atual
          precoAntigo = produto.preco_de && produto.preco_de > precoAtual
            ? produto.preco_de
            : undefined;
        }

        // Badges individuais de desconto (kit + cupom separados)
        const discountBadges = getItemDiscountBadges(produto, cupons);

        const tags = produto.tags || [];

        // Verificar se produto está desatualizado
        const produtoDesatualizado = desatualizadosMap.get(String(produto.id));
        const isOutdated = !!produtoDesatualizado;

        return (
          <CartProductCard
            key={produto.id}
            produto={produto}
            imagem={getImageUrl(produto)}
            nome={produto.nome}
            preco={produto.preco}
            precoAntigo={precoAntigo}
            discountBadges={discountBadges}
            tags={tags}
            onAdd={() => onAdd({ product: produto })}
            onSubtract={() => onSubtract({ product: produto })}
            onRemove={() => onRemove({ product: produto })}
            isOutdated={isOutdated}
            precoAtualizado={produtoDesatualizado?.precoAtualComCupom}
          />
        );
      })}

    </div>
  );
}
