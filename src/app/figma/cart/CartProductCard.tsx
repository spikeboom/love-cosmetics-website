'use client';

import Image from 'next/image';

interface CartProductCardProps {
  imagem?: string;
  nome: string;
  preco: number;
  precoAntigo?: number;
  descontoPercentual?: number;
  quantidade?: number;
  onQuantidadeChange?: (quantidade: number) => void;
  tags?: Array<{
    texto: string;
    icon?: string;
    tipo?: 'alerta' | 'sucesso';
  }>;
}

export function CartProductCard({
  imagem,
  nome,
  preco,
  precoAntigo,
  descontoPercentual,
  quantidade = 1,
  onQuantidadeChange,
  tags = [],
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

  const precoAntigoFormatado = precoAntigo
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(precoAntigo)
    : null;

  return (
    <div className="flex w-[921px] flex-col rounded-lg shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col gap-4 self-stretch bg-white p-4">
        <div className="flex gap-4 self-stretch">
          {/* Imagem */}
          <div className="h-[80px] w-[80px] rounded-lg bg-[#F8F3ED] overflow-hidden flex items-center justify-center shrink-0">
            {imagem ? (
              <Image
                src={imagem}
                alt={nome}
                width={80}
                height={80}
                className="object-cover w-full h-full"
                priority
              />
            ) : (
              <div className="w-full h-full bg-[#F8F3ED]" />
            )}
          </div>

          {/* Resumo do item */}
          <div className="flex flex-1 flex-col gap-4 self-stretch">
            {/* Top row: Nome + Counter + Preço */}
            <div className="flex items-center justify-between gap-4 self-stretch">
              {/* Nome */}
              <div className="flex h-[32px] flex-1 items-stretch gap-1">
                <h3 className="font-cera-pro text-[20px] font-bold leading-[1.257] text-[#111111]">
                  {nome}
                </h3>
              </div>

              {/* Counter + Preço */}
              <div className="flex h-[32px] items-center gap-8">
                {/* Counter */}
                <div className="flex items-center justify-center gap-4 self-stretch rounded-lg bg-[#F8F3ED] px-2">
                  <button
                    onClick={handleMinus}
                    className="flex h-4 w-4 items-center justify-center"
                    aria-label="Diminuir quantidade"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 13H5v-2h14v2z" fill="#254333" />
                    </svg>
                  </button>
                  <span className="font-cera-pro text-base font-medium leading-[1.257]">
                    {quantidade}
                  </span>
                  <button
                    onClick={handlePlus}
                    className="flex h-4 w-4 items-center justify-center"
                    aria-label="Aumentar quantidade"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#254333" />
                    </svg>
                  </button>
                </div>

                {/* Preço */}
                <div className="flex flex-col items-end gap-2">
                  {(precoAntigo || descontoPercentual) && (
                    <div className="flex items-center justify-center gap-[10px]">
                      {descontoPercentual && (
                        <span className="font-cera-pro text-xs font-light leading-[1.257] text-[#009142]">
                          {descontoPercentual}% OFF
                        </span>
                      )}
                      {precoAntigoFormatado && (
                        <span className="font-cera-pro text-xs font-light leading-[1.257] text-[#333333] line-through">
                          {precoAntigoFormatado}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="font-cera-pro text-2xl font-bold leading-[1.257] text-black">
                    {precoFormatado}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex gap-[10px] self-stretch">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center gap-1 rounded bg-[#F8F3ED] px-4 py-1"
                  >
                    {tag.icon && (
                      <Image
                        src={tag.icon}
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4"
                      />
                    )}
                    <span
                      className={`font-cera-pro text-sm font-light leading-[1.257] ${
                        tag.tipo === 'alerta' ? 'text-[#B3261E]' : 'text-[#B3261E]'
                      }`}
                    >
                      {tag.texto}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
