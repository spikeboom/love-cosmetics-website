'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/formatters';
import { calculateCartResumoCompra, calculatePedidoResumoCompra, getItemDiscountBadges, getOrderItemDiscountBadges } from '@/core/pricing/resumo-compra';
import { getTipoDesconto } from '@/utils/cart-calculations';
import { OutdatedCartAlert } from '@/components/cart/OutdatedCartAlert';

interface ResumoCompraCardProps {
  mode: 'cart' | 'payment' | 'order';

  // Dados
  cartItems?: any[];
  pedido?: any;
  frete: number;
  freteGratis?: boolean;
  enderecoCompleto?: string;
  cupons?: any[];
  cupomDescricao?: string;   // para mode="order" (vem do pedido salvo)
  dataPedido?: string;
  metodoPagamento?: string;

  // Cart-specific
  onCheckout?: () => void;
  freteCalculado?: boolean;
  isCartValid?: boolean | null;
  isValidating?: boolean;
  onRefreshCart?: () => void;
  isMobile?: boolean;

  // Payment-specific
  onAlterarProdutos?: () => void;
  onAlterarEntrega?: () => void;

  // Collapsible - mostra fade+chevron para expandir/recolher detalhes
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function ResumoCompraCard({
  mode,
  cartItems,
  pedido,
  frete,
  freteGratis,
  enderecoCompleto,
  cupons = [],
  cupomDescricao,
  dataPedido,
  metodoPagamento,
  onCheckout,
  freteCalculado = true,
  isCartValid = null,
  isValidating = false,
  onRefreshCart,
  isMobile = false,
  onAlterarProdutos,
  onAlterarEntrega,
  collapsible = false,
  defaultCollapsed = true,
}: ResumoCompraCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(defaultCollapsed);

  // Calcular resumo de acordo com o mode
  const resumo = mode === 'order' && pedido
    ? calculatePedidoResumoCompra(pedido)
    : calculateCartResumoCompra(cartItems || []);

  // Descrição do cupom
  const tipoDesconto = cupomDescricao || (cupons.length > 0 ? getTipoDesconto(cupons) : '');

  // Frete grátis
  const isFreeShipping = freteGratis ?? frete === 0;

  // Items para exibição detalhada (payment/order)
  const displayItems: any[] = mode === 'order' && pedido
    ? (pedido.items || [])
    : (cartItems || []);

  // ========== MODE: CART ==========
  if (mode === 'cart') {
    const isOutdated = isCartValid === false;
    const canCheckout = freteCalculado && !isOutdated;

    return (
      <div className={`flex flex-col bg-white ${
        isMobile
          ? 'w-[calc(100vw-2*8px)] mx-[8px] rounded-t-2xl px-6 py-4 gap-4 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.3),0px_2px_8px_3px_rgba(0,0,0,0.15)]'
          : 'self-stretch rounded-lg p-4 gap-6 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] h-fit'
      }`}>
        {/* Desktop: titulo */}
        {!isMobile && (
          <h2 className="w-full font-cera-pro text-2xl font-bold leading-[1.257] text-[#111111]">
            Resumo da compra
          </h2>
        )}

        <div className={`flex flex-col items-end self-stretch ${isMobile ? 'gap-4' : 'gap-6'}`}>
          <div className={`flex flex-col self-stretch ${isMobile ? 'gap-2' : 'gap-4'}`}>
            {/* Produtos (sem descontos) */}
            <div className="flex justify-between items-stretch self-stretch gap-8">
              <p className={`flex-1 font-cera-pro font-light leading-[1.257] text-[#111111] ${
                isMobile ? 'text-[14px]' : 'text-xl'
              }`}>
                Produtos <span className="text-[12px] text-[#666666]">(sem descontos)</span>
              </p>
              <p className={`font-cera-pro font-light leading-[1.257] text-right text-[#111111] ${
                isMobile ? 'text-[14px]' : 'text-xl'
              }`}>
                {formatPrice(resumo.produtosDe)}
              </p>
            </div>

            {/* Frete */}
            <div className="flex justify-between items-center self-stretch gap-8">
              <p className={`font-cera-pro font-light leading-[1.257] text-[#111111] ${
                isMobile ? 'text-[14px]' : 'text-xl'
              }`}>
                Frete
              </p>
              <p className={`font-cera-pro font-light leading-[1.257] ${
                isMobile ? 'text-[14px]' : 'text-xl'
              } ${freteCalculado ? (isFreeShipping ? 'text-[#009142]' : 'text-black') : 'text-[#B3261E]'}`}>
                {!freteCalculado ? 'Calcule o frete' : isFreeShipping ? 'Gratis' : formatPrice(frete)}
              </p>
            </div>

            {/* Descontos (site - kit/promo) */}
            {resumo.descontoSite > 0 && (
              <div className="flex justify-between items-center self-stretch gap-8">
                <p className={`font-cera-pro font-light leading-[1.257] text-[#111111] ${
                  isMobile ? 'text-[14px]' : 'text-xl'
                }`}>
                  Descontos
                </p>
                <p className={`font-cera-pro font-light leading-[1.257] text-[#009142] ${
                  isMobile ? 'text-[14px]' : 'text-xl'
                }`}>
                  -{formatPrice(resumo.descontoSite)}
                </p>
              </div>
            )}

            {/* Cupom */}
            {resumo.descontoCupom > 0 && (
              <div className="flex justify-between items-center self-stretch gap-8">
                <p className={`font-cera-pro font-light leading-[1.257] text-[#111111] ${
                  isMobile ? 'text-[14px]' : 'text-xl'
                }`}>
                  Cupom{tipoDesconto ? ` (${tipoDesconto})` : ''}
                </p>
                <p className={`font-cera-pro font-light leading-[1.257] text-[#009142] ${
                  isMobile ? 'text-[14px]' : 'text-xl'
                }`}>
                  -{formatPrice(resumo.descontoCupom)}
                </p>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-stretch self-stretch gap-8">
            <h2 className={`flex-1 font-cera-pro font-medium leading-[1.257] text-[#111111] ${
              isMobile ? 'text-base' : 'text-2xl font-bold'
            }`}>
              Total
            </h2>
            <h2 className={`font-cera-pro font-medium leading-[1.257] text-[#111111] ${
              isMobile ? 'text-base' : 'text-2xl font-bold'
            }`}>
              {formatPrice(resumo.produtosFinal + frete)}
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

          {/* Botao Continuar */}
          {onCheckout && (
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
                <span className="font-cera-pro font-medium text-white text-base">
                  {!freteCalculado ? 'Calcule o frete' : isOutdated ? 'Atualize o carrinho' : 'Continuar'}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ========== MODE: PAYMENT ==========
  if (mode === 'payment') {
    // Conteúdo detalhado (produtos individuais, entrega, cupom)
    const detailContent = (
      <>
        {/* Produtos */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]">
              Produtos
            </span>
            <div className="flex items-center gap-2">
              {resumo.produtosDe > resumo.produtosFinal && (
                <span className="font-cera-pro font-light text-[14px] text-[#999] line-through">
                  {formatPrice(resumo.produtosDe)}
                </span>
              )}
              <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                {formatPrice(resumo.produtosFinal)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {displayItems.map((item: any, index: number) => {
              const precoAtual = item.preco;
              const qty = item.quantity || 1;

              // Calcular preco antigo
              let precoAntigo: number | undefined;
              const temCupomAplicado = !!item.cupom_applied || !!item.backup?.preco;
              const precoAntesDosCupom = item.backup?.preco ?? item.preco;
              if (temCupomAplicado) {
                precoAntigo = item.backup?.preco_de ?? item.preco_de ?? precoAntesDosCupom;
                if (precoAntigo && precoAntigo <= precoAtual) precoAntigo = undefined;
              } else {
                precoAntigo = item.preco_de && item.preco_de > precoAtual ? item.preco_de : undefined;
              }

              // Badges individuais de desconto
              const badges = getItemDiscountBadges(item, cupons);

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                      {item.nome || item.name} {qty > 1 && `(x${qty})`}
                    </span>
                    {badges.map((badge, i) => (
                      <span key={i} className="text-white text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#009142]">
                        {badge.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {precoAntigo && (
                      <span className="font-cera-pro font-light text-[12px] text-[#999] line-through">
                        {formatPrice(precoAntigo * qty)}
                      </span>
                    )}
                    <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#111]">
                      {formatPrice(precoAtual * qty)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {onAlterarProdutos && (
            <button
              onClick={onAlterarProdutos}
              className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] underline text-left w-fit"
            >
              Alterar
            </button>
          )}
        </div>

        <div className="bg-white h-px w-full" />

        {/* Entrega */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]">
              Entrega
            </span>
            <span className={`font-cera-pro font-bold text-[18px] lg:text-[20px] ${
              isFreeShipping ? 'text-[#009142]' : 'text-black'
            }`}>
              {isFreeShipping ? 'Gratis' : formatPrice(frete)}
            </span>
          </div>
          {enderecoCompleto && (
            <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
              {enderecoCompleto}
            </p>
          )}
          {onAlterarEntrega && (
            <button
              onClick={onAlterarEntrega}
              className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] underline text-left w-fit"
            >
              Alterar
            </button>
          )}
        </div>

        {/* Cupom */}
        {resumo.descontoCupom > 0 && (
          <>
            <div className="bg-white h-px w-full" />
            <div className="p-4 flex items-center justify-between">
              <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]">
                Cupom{tipoDesconto ? ` (${tipoDesconto})` : ''}
              </span>
              <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#009142]">
                -{formatPrice(resumo.descontoCupom)}
              </span>
            </div>
          </>
        )}
      </>
    );

    const totalSection = (
      <>
        <div className="bg-white h-px w-full" />
        <div className="p-4 flex items-center justify-between">
          <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]">
            Valor total
          </span>
          <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
            {formatPrice(resumo.produtosFinal + frete)}
          </span>
        </div>
      </>
    );

    const fullContent = (
      <div className="bg-[#f8f3ed] rounded-[8px] w-full">
        {collapsible ? (
          <>
            {/* Collapsible detail area */}
            <div className="relative">
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isDetailCollapsed ? '140px' : '2000px' }}
              >
                {detailContent}
              </div>
              {/* Gradient fade overlay */}
              {isDetailCollapsed && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[48px] pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, rgba(248,243,237,0), rgba(248,243,237,1))' }}
                />
              )}
            </div>
            {/* Chevron toggle */}
            <button
              onClick={() => setIsDetailCollapsed(!isDetailCollapsed)}
              className="w-full flex items-center justify-center py-2 hover:bg-[#f0ebe4] transition-colors"
            >
              <svg
                width="24" height="24" viewBox="0 0 24 24" fill="none"
                className={`transition-transform duration-300 ${isDetailCollapsed ? '' : 'rotate-180'}`}
              >
                <path d="M6 9L12 15L18 9" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {totalSection}
          </>
        ) : (
          <>
            {detailContent}
            {totalSection}
          </>
        )}
      </div>
    );

    return (
      <div className="flex flex-col gap-4">
        {/* Mobile: expand/collapse (comportamento original) */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full bg-[#f8f3ed] rounded-[8px] p-4 flex items-center justify-between"
          >
            <span className="font-cera-pro font-bold text-[18px] text-[#111111]">
              {isCollapsed ? 'Ver resumo' : 'Ocultar resumo'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-cera-pro font-bold text-[18px] text-black">
                {formatPrice(resumo.produtosFinal + frete)}
              </span>
              <svg
                width="20" height="20" viewBox="0 0 20 20" fill="none"
                className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
          {!isCollapsed && fullContent}
        </div>

        {/* Desktop: always visible */}
        <div className="hidden lg:block">
          {fullContent}
        </div>

        {/* Tag economia */}
        {resumo.totalEconomizado > 0 && (
          <div className="bg-[#d8f9e7] rounded-[8px] p-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6.5 10L8.5 12L13.5 7M10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18Z" stroke="#254333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#254333]">
              Voce vai economizar {formatPrice(resumo.totalEconomizado)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ========== MODE: ORDER ==========
  const orderDetailContent = (
    <>
      {/* Data do pedido */}
      {dataPedido && (
        <>
          <div className="p-4 flex items-center justify-between">
            <span className="font-cera-pro font-medium text-[16px] text-[#111]">
              Data do pedido
            </span>
            <span className="font-cera-pro font-medium text-[16px] text-black">
              {dataPedido}
            </span>
          </div>
          <div className="bg-white h-px" />
        </>
      )}

      {/* Produtos */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
            Produtos
          </span>
          <div className="flex items-center gap-2">
            {resumo.produtosDe > resumo.produtosFinal && (
              <span className="font-cera-pro font-light text-[14px] text-[#999] line-through">
                {formatPrice(resumo.produtosDe)}
              </span>
            )}
            <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
              {formatPrice(resumo.produtosFinal)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {displayItems.map((item: any, i: number) => {
            const precoAtual = item.preco || item.unit_amount || 0;
            const qty = item.quantity || 1;
            const precoAntigo = item.preco_de && item.preco_de > precoAtual ? item.preco_de : undefined;

            // Badges individuais para pedido salvo
            const badges = getOrderItemDiscountBadges(item, cupomDescricao);

            return (
              <div key={i} className="flex items-start gap-3">
                {/* Imagem */}
                {(item.image_url || item.imagem) && (
                  <img
                    src={item.image_url || item.imagem}
                    alt={item.name || item.nome}
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111]">
                      {item.name || item.nome} {qty > 1 && `(x${qty})`}
                    </span>
                    {badges.map((badge, bi) => (
                      <span key={bi} className="text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 bg-[#009142]">
                        {badge.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {precoAntigo && (
                      <span className="font-cera-pro font-light text-[12px] text-[#999] line-through">
                        {formatPrice(precoAntigo * qty)}
                      </span>
                    )}
                    <span className="font-cera-pro font-medium text-[14px] text-[#111]">
                      {formatPrice(precoAtual * qty)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white h-px" />

      {/* Entrega */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
            Entrega
          </span>
          <span className={`font-cera-pro font-bold text-[18px] lg:text-[20px] ${
            isFreeShipping ? 'text-[#009142]' : 'text-black'
          }`}>
            {isFreeShipping ? 'Gratis' : formatPrice(frete)}
          </span>
        </div>
        {enderecoCompleto && (
          <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111]">
            {enderecoCompleto}
          </p>
        )}
      </div>

      {/* Cupom */}
      {resumo.descontoCupom > 0 && (
        <>
          <div className="bg-white h-px" />
          <div className="p-4 flex justify-between items-center">
            <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
              Cupom{tipoDesconto ? ` (${tipoDesconto})` : ''}
            </span>
            <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#009142]">
              -{formatPrice(resumo.descontoCupom)}
            </span>
          </div>
        </>
      )}
    </>
  );

  const orderTotalSection = (
    <>
      <div className="bg-white h-px" />
      <div className="p-4 flex justify-between items-center">
        <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
          {metodoPagamento ? `Pagamento ${metodoPagamento}` : 'Valor total'}
        </span>
        <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
          {formatPrice(resumo.produtosFinal + frete)}
        </span>
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className={`bg-[#f8f3ed] rounded-[8px] ${collapsible ? '' : 'overflow-hidden'}`}>
        {collapsible ? (
          <>
            {/* Collapsible detail area */}
            <div className="relative">
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isDetailCollapsed ? '140px' : '2000px' }}
              >
                {orderDetailContent}
              </div>
              {/* Gradient fade overlay */}
              {isDetailCollapsed && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[48px] pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, rgba(248,243,237,0), rgba(248,243,237,1))' }}
                />
              )}
            </div>
            {/* Chevron toggle */}
            <button
              onClick={() => setIsDetailCollapsed(!isDetailCollapsed)}
              className="w-full flex items-center justify-center py-2 hover:bg-[#f0ebe4] transition-colors"
            >
              <svg
                width="24" height="24" viewBox="0 0 24 24" fill="none"
                className={`transition-transform duration-300 ${isDetailCollapsed ? '' : 'rotate-180'}`}
              >
                <path d="M6 9L12 15L18 9" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {orderTotalSection}
          </>
        ) : (
          <>
            {orderDetailContent}
            {orderTotalSection}
          </>
        )}
      </div>

      {/* Tag economia */}
      {resumo.totalEconomizado > 0 && (
        <div className="bg-[#d8f9e7] rounded-[8px] p-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6.5 10L8.5 12L13.5 7M10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18Z" stroke="#254333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#254333]">
            Voce <strong>economizou</strong> {formatPrice(resumo.totalEconomizado)}
          </span>
        </div>
      )}
    </div>
  );
}
