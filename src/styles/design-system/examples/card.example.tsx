/**
 * EXEMPLO DE REFERÊNCIA - Cards
 *
 * Este arquivo serve como referência para criar cards consistentes.
 * NÃO use este componente diretamente em produção.
 * Copie os padrões e adapte conforme necessário.
 */

import Image from "next/image";
import Link from "next/link";

// =============================================================================
// CARD DE PRODUTO COMPLETO
// Uso: Vitrines, grids de produtos, mais vendidos
// =============================================================================

export function CardProdutoExemplo() {
  return (
    <div
      className="
      bg-white
      rounded-[16px]
      shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
      w-full lg:w-[230px]
      pb-[16px]
    "
    >
      {/* Imagem */}
      <div className="relative w-full h-[196px] max-h-[312px] rounded-t-[16px] overflow-hidden">
        <Image
          src="/placeholder-produto.jpg"
          alt="Nome do Produto"
          fill
          className="object-cover pointer-events-none"
        />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-[12px] items-start px-[16px] pt-[16px]">
        {/* Nome */}
        <p className="font-cera-pro font-medium text-[16px] text-black leading-normal w-full">
          Nome do Produto
        </p>

        {/* Descrição */}
        <p className="font-cera-pro font-light text-[14px] text-black leading-normal w-full line-clamp-3">
          Descrição breve do produto com informações importantes para o cliente.
        </p>

        {/* Preços */}
        <div className="flex flex-col gap-[2px] items-start">
          {/* Preço original (riscado) */}
          <p className="font-cera-pro font-light text-[12px] text-[#333333] line-through">
            R$ 99,90
          </p>

          {/* Preço atual + desconto */}
          <div className="flex gap-[8px] items-center">
            <p className="font-cera-pro font-bold text-[20px] text-black leading-none">
              R$ 79,90
            </p>
            <p className="font-cera-pro font-light text-[14px] text-[#009142] leading-none">
              -20%
            </p>
          </div>

          {/* Parcelas */}
          <p className="font-cera-pro font-light text-[12px] text-[#333333]">
            ou 3x de R$ 26,63
          </p>
        </div>

        {/* Avaliação (estrelas) */}
        <div className="flex gap-[4px] items-center">
          <div className="flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 2L9.5 6.5L14 7L10.5 10L11.5 14.5L8 12L4.5 14.5L5.5 10L2 7L6.5 6.5L8 2Z"
                  fill={star <= 4 ? "#FFB800" : "#E0E0E0"}
                />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CARD DE PRODUTO COM LINK
// Uso: Cards clicáveis que levam para página do produto
// =============================================================================

export function CardProdutoLinkExemplo() {
  return (
    <Link
      href="/figma/product/slug-do-produto"
      className="cursor-pointer hover:opacity-90 transition-opacity"
    >
      <div
        className="
        bg-white
        rounded-[16px]
        shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
        w-full lg:w-[230px]
        pb-[16px]
      "
      >
        {/* ... mesmo conteúdo do CardProdutoExemplo ... */}
      </div>
    </Link>
  );
}

// =============================================================================
// CARD COM BADGE DE RANKING
// Uso: Seção "Mais Vendidos"
// =============================================================================

export function CardComRankingExemplo() {
  const ranking = 1;

  return (
    <div
      className="
      bg-white
      rounded-[16px]
      shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
      w-full lg:w-[230px]
      pb-[16px]
    "
    >
      {/* Imagem com Badge */}
      <div className="relative w-full h-[196px] rounded-t-[16px] overflow-hidden">
        <Image
          src="/placeholder-produto.jpg"
          alt="Produto"
          fill
          className="object-cover"
        />

        {/* Badge de Ranking */}
        <div className="absolute left-[max(8px,calc(50%-66px))] top-[-2px] w-[32px] h-[41px] flex items-center justify-center lg:translate-x-[-50%]">
          <Image
            src={`/new-home/icons/badge-ranking-${ranking}.svg`}
            alt={`Posição ${ranking}`}
            width={32}
            height={41}
            className="absolute"
          />
        </div>
      </div>

      {/* ... resto do conteúdo ... */}
    </div>
  );
}

// =============================================================================
// CARD COM TAG "ÚLTIMAS UNIDADES"
// Uso: Produtos com estoque baixo
// =============================================================================

export function CardComAlertaExemplo() {
  return (
    <div
      className="
      bg-white
      rounded-[16px]
      shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
      w-full lg:w-[230px]
      pb-[16px]
    "
    >
      {/* Imagem com Tag */}
      <div className="relative w-full h-[196px] rounded-t-[16px] overflow-hidden">
        <Image
          src="/placeholder-produto.jpg"
          alt="Produto"
          fill
          className="object-cover"
        />

        {/* Tag Últimas Unidades */}
        <div className="absolute left-1/2 top-[163px] w-[90%] max-w-[214px] translate-x-[-50%]">
          <div className="bg-[#f8f3ed] flex gap-[4px] items-center justify-center px-[16px] py-[4px] rounded-[4px]">
            <Image
              src="/new-home/icons/alert.svg"
              alt=""
              width={16}
              height={16}
            />
            <p className="font-cera-pro font-light text-[14px] text-[#b3261e] whitespace-nowrap">
              Últimas unidades
            </p>
          </div>
        </div>
      </div>

      {/* ... resto do conteúdo ... */}
    </div>
  );
}

// =============================================================================
// CARD MINI-BANNER (promocional)
// Uso: Banners de desconto, promoções
// =============================================================================

export function CardMiniBannerExemplo() {
  return (
    <div
      className="
      bg-white
      flex flex-col gap-4 items-start
      pb-4 pt-0 px-0
      rounded-2xl
      shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
      w-full lg:w-[230px]
    "
    >
      {/* Imagem */}
      <div className="relative w-full h-[230px] max-h-[312px] rounded-t-2xl overflow-hidden">
        <Image
          src="/placeholder-banner.jpg"
          alt="Promoção"
          fill
          className="object-cover rounded-t-2xl"
        />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-4 items-start px-4 w-full">
        <p className="font-cera-pro font-bold text-[20px] text-[#254333] leading-none">
          -30% OFF
        </p>
        <p className="font-cera-pro font-bold text-[20px] text-black leading-none">
          Kits Especiais
        </p>
        <p className="font-cera-pro font-light text-[14px] text-black leading-none">
          Aproveite os melhores preços
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// CARD DE SELEÇÃO (clicável)
// Uso: Opções de pagamento, frete, etc.
// =============================================================================

export function CardSelecaoExemplo() {
  return (
    <button
      onClick={() => {}}
      className="
        w-full rounded-[8px]
        border border-transparent
        shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
        bg-white p-4 text-left
        transition-all
        hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]
      "
    >
      <div className="flex items-center gap-4 flex-wrap">
        {/* Ícone + Título */}
        <div className="flex items-center gap-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {/* Ícone aqui */}
          </svg>
          <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#254333]">
            Pix R$ 199,90
          </span>
        </div>

        {/* Badge de destaque */}
        <div className="bg-[#f8f3ed] px-4 py-1 rounded flex items-center gap-1">
          <span className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#b3261e]">
            Aprovação imediata
          </span>
        </div>
      </div>
    </button>
  );
}
