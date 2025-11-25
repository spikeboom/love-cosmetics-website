'use client';

import Image from 'next/image';
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
  produtos: any[];
  onAdd: (data: { product: any }) => void;
  onSubtract: (data: { product: any }) => void;
  onRemove: (data: { product: any }) => void;
}

export function CartProductsList({
  produtos,
  onAdd,
  onSubtract,
  onRemove,
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
                icon: '/new-home/icons/verified-red.svg',
                tipo: 'sucesso' as const,
              },
            ]
          : index === 1
          ? [
              {
                texto: 'Mais vendido',
                icon: '/new-home/icons/verified-red.svg',
                tipo: 'sucesso' as const,
              },
            ]
          : [];

        const tags = produto.tags || tagsMock;

        return (
          <CartProductCard
            key={produto.id}
            produto={produto}
            imagem={getImageUrl(produto)}
            nome={produto.nome}
            preco={produto.preco}
            precoAntigo={precoAntigo}
            descontoPercentual={descontoPercentual}
            tags={tags}
            onAdd={() => onAdd({ product: produto })}
            onSubtract={() => onSubtract({ product: produto })}
            onRemove={() => onRemove({ product: produto })}
          />
        );
      })}

      {/* Tag Múltiplas */}
      <div className="flex flex-col justify-center gap-2 self-stretch rounded-lg bg-[#F8F3ED] p-4">
        <div className="flex items-center gap-1">
          <Image
            src="/new-home/icons/verified-red.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
          />
          <p className="font-cera-pro text-sm font-light leading-[1.257] text-[#B3261E]">
            Frete grátis para compras acima de R$ 99,99
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Image
            src="/new-home/icons/verified-red.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
          />
          <p className="font-cera-pro text-sm font-light leading-[1.257] text-[#B3261E]">
            10% de desconto pagando no pix
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Image
            src="/new-home/icons/verified-red.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
          />
          <p className="font-cera-pro text-sm font-light leading-[1.257] text-[#B3261E]">
            Parcele em até 10x sem juros
          </p>
        </div>
      </div>
    </div>
  );
}
