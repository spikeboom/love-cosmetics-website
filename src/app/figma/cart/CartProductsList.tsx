'use client';

import { CartProductCard } from './CartProductCard';

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

interface CartProductsListProps {
  produtos: Product[];
  onQuantidadeChange?: (productId: string, quantidade: number) => void;
}

export function CartProductsList({
  produtos,
  onQuantidadeChange,
}: CartProductsListProps) {
  const getImageUrl = (produto: Product) => {
    const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const imagemUrl =
      produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url ||
      produto.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail?.url;
    return imagemUrl ? `${baseURL}${imagemUrl}` : undefined;
  };

  return (
    <div className="flex flex-col gap-6">
      {produtos.map((produto, index) => {
        // Mock data para demonstração quando não vem do Strapi
        const precoAntigo = produto.precoAntigo || produto.preco * 1.4; // 40% de desconto
        const descontoPercentual = produto.descontoPercentual || 40;

        // Tags mockadas alternando entre produtos
        const tagsMock: Array<{
          texto: string;
          icon?: string;
          tipo?: 'alerta' | 'sucesso';
        }> = index === 0
          ? [
              {
                texto: 'Últimas unidades',
                icon: '/new-home/icons/alert.svg',
                tipo: 'alerta' as const,
              },
              {
                texto: 'Frete grátis',
                icon: '/new-home/icons/verified.svg',
                tipo: 'sucesso' as const,
              },
            ]
          : index === 1
          ? [
              {
                texto: 'Mais vendido',
                icon: '/new-home/icons/verified.svg',
                tipo: 'sucesso' as const,
              },
            ]
          : [];

        const tags = produto.tags || tagsMock;

        return (
          <CartProductCard
            key={produto.id}
            imagem={getImageUrl(produto)}
            nome={produto.nome}
            preco={produto.preco}
            precoAntigo={precoAntigo}
            descontoPercentual={descontoPercentual}
            tags={tags}
            onQuantidadeChange={(quantidade) =>
              onQuantidadeChange?.(produto.id, quantidade)
            }
          />
        );
      })}

      {/* Tag Múltiplas */}
      <div className="flex flex-col justify-center gap-2 self-stretch rounded-lg bg-[#F8F3ED] p-4">
        <div className="flex items-center gap-1">
          <p className="font-cera-pro text-sm font-light leading-[1.257] text-[#111111]">
            🎁 Você ganhou frete grátis para esta compra!
          </p>
        </div>
      </div>
    </div>
  );
}
