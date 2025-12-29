'use client';

import Image from 'next/image';

interface CartProductCardProps {
  produto: any;
  imagem?: string;
  nome: string;
  preco: number;
  precoAntigo?: number;
  descontoPercentual?: number;
  onAdd: () => void;
  onSubtract: () => void;
  onRemove: () => void;
  tags?: Array<{
    texto: string;
    icon?: string;
    tipo?: 'alerta' | 'sucesso';
  }>;
  isOutdated?: boolean;
  precoAtualizado?: number;
}

export function CartProductCard({
  produto,
  imagem,
  nome,
  preco,
  precoAntigo,
  descontoPercentual,
  onAdd,
  onSubtract,
  onRemove,
  tags = [],
  isOutdated = false,
  precoAtualizado,
}: CartProductCardProps) {
  const quantidade = produto.quantity || 1;

  const handleMinus = () => {
    if (quantidade > 1) {
      onSubtract();
    }
  };

  const handlePlus = () => {
    onAdd();
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

  const precoAtualizadoFormatado = precoAtualizado
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(precoAtualizado)
    : null;

  return (
    <div className={`flex w-full flex-col rounded-lg overflow-clip shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] ${
      isOutdated ? 'ring-2 ring-[#FFE69C]' : ''
    }`}>
      {/* Banner de preço desatualizado */}
      {isOutdated && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FFF3CD] border-b border-[#FFE69C]">
          <svg
            className="w-4 h-4 text-[#856404] flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-cera-pro text-xs md:text-sm font-medium text-[#856404]">
            Preço atualizado{precoAtualizadoFormatado && `: ${precoAtualizadoFormatado}`}
          </span>
        </div>
      )}
      <div className={`flex flex-col gap-4 self-stretch bg-white p-4 ${
        isOutdated ? 'opacity-60' : ''
      }`}>
        {/* Mobile: Tags em cima - Desktop: Hidden */}
        {tags.length > 0 && (
          <div className="flex md:hidden gap-[10px] self-stretch">
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
                <span className="font-cera-pro text-sm font-light leading-[1.257] text-[#B3261E]">
                  {tag.texto}
                </span>
              </div>
            ))}
          </div>
        )}

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
            {/* Mobile: Nome em cima, Counter + Preço embaixo */}
            {/* Desktop: Nome + Counter + Preço na mesma linha */}

            {/* Nome - Full width no mobile */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 self-stretch">
              <div className="flex flex-1 items-stretch gap-1">
                <h3 className="font-cera-pro text-base md:text-[20px] font-medium md:font-bold leading-[1.257] text-[#111111]">
                  {nome}
                </h3>
              </div>

              {/* Counter + Preço - Desktop only na mesma linha do nome */}
              <div className="hidden md:flex h-[32px] items-center gap-8">
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

                {/* Preço - Desktop */}
                <div className="flex flex-col items-end gap-[2px]">
                  {(precoAntigo || descontoPercentual) && (
                    <div className="flex items-center justify-center gap-[10px]">
                      {descontoPercentual && (
                        <span className="font-cera-pro text-xs font-light text-[#009142] leading-none">
                          {descontoPercentual}% OFF
                        </span>
                      )}
                      {precoAntigoFormatado && (
                        <span className="font-cera-pro text-xs font-light text-[#333333] line-through leading-none">
                          {precoAntigoFormatado}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="font-cera-pro text-2xl font-bold text-black leading-none">
                    {precoFormatado}
                  </span>
                </div>
              </div>
            </div>

            {/* Counter + Preço - Mobile only, linha separada */}
            <div className="flex md:hidden items-center justify-between gap-4 self-stretch h-[27px]">
              {/* Counter */}
              <div className="flex items-center justify-center gap-4 rounded-lg bg-[#F8F3ED] px-2 h-full">
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

              {/* Preço - Mobile */}
              <div className="flex flex-col items-end gap-[2px] h-full">
                {(precoAntigo || descontoPercentual) && (
                  <div className="flex items-center justify-center gap-[10px]">
                    {descontoPercentual && (
                      <span className="font-cera-pro text-xs font-light text-[#009142] leading-none">
                        {descontoPercentual}% OFF
                      </span>
                    )}
                    {precoAntigoFormatado && (
                      <span className="font-cera-pro text-xs font-light text-[#333333] line-through leading-none">
                        {precoAntigoFormatado}
                      </span>
                    )}
                  </div>
                )}
                <span className="font-cera-pro text-xl font-bold text-black leading-none">
                  {precoFormatado}
                </span>
              </div>
            </div>

            {/* Tags e Remover - Desktop only */}
            <div className="hidden md:flex items-center justify-between gap-4 self-stretch">
              {tags.length > 0 && (
                <div className="flex gap-[10px]">
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
                      <span className="font-cera-pro text-sm font-light leading-[1.257] text-[#B3261E]">
                        {tag.texto}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão Remover */}
              <button
                onClick={onRemove}
                className="font-cera-pro text-sm font-light text-[#B3261E] hover:text-[#8a1c17] underline transition-colors"
                aria-label="Remover produto"
              >
                Remover
              </button>
            </div>

            {/* Botão Remover - Mobile only */}
            <button
              onClick={onRemove}
              className="md:hidden font-cera-pro text-sm font-light text-[#B3261E] hover:text-[#8a1c17] underline transition-colors self-start"
              aria-label="Remover produto"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
