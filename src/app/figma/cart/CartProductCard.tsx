'use client';

import Image from 'next/image';

interface CartProductCardProps {
  imagem?: string;
  nome: string;
  tamanho?: string;
  preco: number;
  quantidade?: number;
  onQuantidadeChange?: (quantidade: number) => void;
}

export function CartProductCard({
  imagem,
  nome,
  tamanho = '200g',
  preco,
  quantidade = 1,
  onQuantidadeChange,
}: CartProductCardProps) {
  const handleMinus = () => {
    if (quantidade > 1) {
      onQuantidadeChange?.(quantidade - 1);
    }
  };

  const handlePlus = () => {
    onQuantidadeChange?.(quantidade + 1);
  };

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(preco);

  return (
    <div className="flex w-[921px] flex-col rounded-lg shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col gap-4 self-stretch bg-white p-4">
        <div className="flex items-center gap-4">
          {/* Imagem */}
          <div className="h-[100px] w-[100px] rounded bg-[#F8F3ED] overflow-hidden flex items-center justify-center shrink-0">
            {imagem ? (
              <Image
                src={imagem}
                alt={nome}
                width={100}
                height={100}
                className="object-cover w-full h-full"
                priority
              />
            ) : (
              <div className="w-full h-full bg-[#F8F3ED]" />
            )}
          </div>

          {/* Informações */}
          <div className="flex flex-1 flex-col gap-2">
            <h3 className="font-cera-pro text-base font-medium leading-[1.257] text-black">
              {nome}
            </h3>
            <p className="font-cera-pro text-sm font-light leading-[1.257] text-[#111111]">
              {tamanho}
            </p>
            <div className="flex items-center gap-4">
              <p className="font-cera-pro text-xl font-light leading-[1.257] text-black">
                {precoFormatado}
              </p>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMinus}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#D2D2D2] hover:bg-[#F8F3ED] transition-colors"
            >
              -
            </button>
            <span className="font-cera-pro text-base w-6 text-center">{quantidade}</span>
            <button
              onClick={handlePlus}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#D2D2D2] hover:bg-[#F8F3ED] transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
