'use client';

import { getTipoDesconto } from '@/utils/cart-calculations';
import { OutdatedCartAlert } from '@/components/cart/OutdatedCartAlert';

interface CartSummaryProps {
  subtotal: number;
  frete: number;
  cupom?: number;
  cupons?: any[];
  total: number;
  onCheckout: () => void;
  isMobile?: boolean;
  freteCalculado?: boolean;
  isCartValid?: boolean | null;
  isValidating?: boolean;
  onRefreshCart?: () => void;
}

export function CartSummary({
  subtotal,
  frete,
  cupom = 0,
  cupons = [],
  total,
  onCheckout,
  isMobile = false,
  freteCalculado = false,
  isCartValid = null,
  isValidating = false,
  onRefreshCart,
}: CartSummaryProps) {
  const tipoDesconto = getTipoDesconto(cupons);

  // Carrinho desatualizado se validação retornou false
  const isOutdated = isCartValid === false;

  // Pode continuar se frete calculado E carrinho válido (ou ainda não validado)
  const canCheckout = freteCalculado && !isOutdated;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className={`flex flex-col bg-white ${
      isMobile
        ? 'w-[calc(100vw-2*8px)] mx-[8px] rounded-t-2xl px-6 py-4 gap-4 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.3),0px_2px_8px_3px_rgba(0,0,0,0.15)]'
        : 'self-stretch rounded-lg p-4 gap-6 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] h-fit'
    }`}>
      {/* Mobile não tem título "Resumo da compra", apenas desktop */}
      {!isMobile && (
        <h2 className="w-full font-cera-pro text-2xl font-bold leading-[1.257] text-[#111111]">
          Resumo da compra
        </h2>
      )}

      {/* Container principal */}
      <div className={`flex flex-col items-end self-stretch ${isMobile ? 'gap-4' : 'gap-6'}`}>
        {/* Items - Produtos, Frete, Cupom */}
        <div className={`flex flex-col self-stretch ${isMobile ? 'gap-2' : 'gap-4'}`}>
          {/* Produtos */}
          <div className={`flex justify-between items-stretch self-stretch ${isMobile ? 'gap-8' : 'gap-8'}`}>
            <p className={`flex-1 font-cera-pro font-light leading-[1.257] text-[#111111] ${
              isMobile ? 'text-[14px]' : 'text-xl'
            }`}>
              Produtos
            </p>
            <p className={`font-cera-pro font-light leading-[1.257] text-right text-[#111111] ${
              isMobile ? 'text-[14px]' : 'text-xl'
            }`}>
              {formatPrice(subtotal)}
            </p>
          </div>

          {/* Frete */}
          <div className={`flex justify-between items-center self-stretch ${isMobile ? 'gap-8' : 'gap-8'}`}>
            <p className={`font-cera-pro font-light leading-[1.257] text-[#111111] ${
              isMobile ? 'text-[14px]' : 'text-xl'
            }`}>
              Frete
            </p>
            <p className={`font-cera-pro font-light leading-[1.257] ${
              isMobile ? 'text-[14px]' : 'text-xl'
            } ${freteCalculado ? 'text-black' : 'text-[#B3261E]'}`}>
              {freteCalculado ? formatPrice(frete) : 'Calcule o frete'}
            </p>
          </div>

          {/* Cupom - Desconto (positivo) ou Acréscimo (negativo) */}
          {cupom !== 0 && (
            <div className={`flex justify-between items-center self-stretch ${isMobile ? 'gap-8' : 'gap-8'}`}>
              <p className={`font-cera-pro font-light leading-[1.257] text-[#111111] ${
                isMobile ? 'text-[14px]' : 'text-xl'
              }`}>
                {cupom > 0 ? 'Cupom' : 'Acréscimo'}{tipoDesconto && <span className="text-[#666666] text-[12px] ml-1">({tipoDesconto})</span>}
              </p>
              <p className={`font-cera-pro font-light leading-[1.257] ${
                cupom > 0 ? 'text-[#009142]' : 'text-[#B3261E]'
              } ${isMobile ? 'text-[14px]' : 'text-xl'}`}>
                {cupom > 0 ? '-' : '+'}{formatPrice(Math.abs(cupom))}
              </p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className={`flex justify-between items-stretch self-stretch ${isMobile ? 'gap-8' : 'gap-8'}`}>
          <h2 className={`flex-1 font-cera-pro font-medium leading-[1.257] text-[#111111] ${
            isMobile ? 'text-base' : 'text-2xl font-bold'
          }`}>
            Total
          </h2>
          <h2 className={`font-cera-pro font-medium leading-[1.257] text-[#111111] ${
            isMobile ? 'text-base' : 'text-2xl font-bold'
          }`}>
            {formatPrice(total)}
          </h2>
        </div>

        {/* Aviso de carrinho desatualizado */}
        {isOutdated && onRefreshCart && (
          <OutdatedCartAlert
            onRefresh={onRefreshCart}
            isRefreshing={isValidating}
            isMobile={isMobile}
          />
        )}

        {/* Botão Continuar */}
        <button
          onClick={onCheckout}
          disabled={!canCheckout}
          className={`flex items-center justify-center self-stretch rounded-lg transition-colors ${
            canCheckout
              ? 'bg-[#254333] hover:bg-[#1a3023]'
              : 'bg-[#999999] cursor-not-allowed'
          }`}
        >
          <div className={`flex items-center justify-center ${isMobile ? 'px-4 py-[10px]' : 'py-3'}`}>
            <span className={`font-cera-pro font-medium text-white ${
              isMobile ? 'text-base' : 'text-base'
            }`}>
              {!freteCalculado ? 'Calcule o frete' : isOutdated ? 'Atualize o carrinho' : 'Continuar'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
