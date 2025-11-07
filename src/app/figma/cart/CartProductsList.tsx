'use client';

import { CartProductCard } from './CartProductCard';

interface Product {
  id: string;
  nome: string;
  preco: number;
  carouselImagensPrincipal?: Array<{
    imagem?: {
      formats?: {
        medium?: { url: string };
        thumbnail?: { url: string };
      };
    };
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
      {produtos.map((produto) => (
        <CartProductCard
          key={produto.id}
          imagem={getImageUrl(produto)}
          nome={produto.nome}
          preco={produto.preco}
          onQuantidadeChange={(quantidade) =>
            onQuantidadeChange?.(produto.id, quantidade)
          }
        />
      ))}

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
