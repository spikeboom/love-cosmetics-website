"use client";

import { FREE_SHIPPING_THRESHOLD } from "@/core/pricing/shipping-constants";

interface FreeShippingBannerProps {
  qualifies: boolean;
  amountRemaining: number;
  progressPercent: number;
  subtotal: number;
}

export function FreeShippingBanner({
  qualifies,
  amountRemaining,
  progressPercent,
  subtotal,
}: FreeShippingBannerProps) {
  const threshold = FREE_SHIPPING_THRESHOLD;
  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (qualifies) {
    return (
      <div className="flex items-start gap-[12px] p-[14px] rounded-[12px] bg-[#F0F9F4] border border-[#009142] w-full">
        {/* Ícone check + caminhão */}
        <div className="relative flex-shrink-0 w-[48px] h-[48px]">
          <div className="w-[48px] h-[48px] rounded-full bg-[#E0F2E9] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M16 3H1V16H16V3Z" stroke="#009142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 8H20L23 11V16H16V8Z" stroke="#009142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 21C6.88071 21 8 19.8807 8 18.5C8 17.1193 6.88071 16 5.5 16C4.11929 16 3 17.1193 3 18.5C3 19.8807 4.11929 21 5.5 21Z" stroke="#009142" strokeWidth="1.5"/>
              <path d="M18.5 21C19.8807 21 21 19.8807 21 18.5C21 17.1193 19.8807 16 18.5 16C17.1193 16 16 17.1193 16 18.5C16 19.8807 17.1193 21 18.5 21Z" stroke="#009142" strokeWidth="1.5"/>
            </svg>
          </div>
          {/* Check badge */}
          <div className="absolute -top-[2px] -right-[2px] w-[20px] h-[20px] rounded-full bg-[#009142] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <p className="font-cera-pro font-bold text-[14px] text-[#009142] leading-[1.3]">
            Parabéns! Você ganhou frete grátis
          </p>
          <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-[1.4]">
            Sua compra acima de R$ {threshold} garante frete grátis na opção Econômica.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px] p-[14px] rounded-[12px] bg-[#F0F9F4] border border-[#009142] w-full">
      <div className="flex items-start gap-[12px]">
        {/* Ícone caminhão */}
        <div className="flex-shrink-0 w-[48px] h-[48px] rounded-full bg-[#E0F2E9] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16 3H1V16H16V3Z" stroke="#009142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 8H20L23 11V16H16V8Z" stroke="#009142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.5 21C6.88071 21 8 19.8807 8 18.5C8 17.1193 6.88071 16 5.5 16C4.11929 16 3 17.1193 3 18.5C3 19.8807 4.11929 21 5.5 21Z" stroke="#009142" strokeWidth="1.5"/>
            <path d="M18.5 21C19.8807 21 21 19.8807 21 18.5C21 17.1193 19.8807 16 18.5 16C17.1193 16 16 17.1193 16 18.5C16 19.8807 17.1193 21 18.5 21Z" stroke="#009142" strokeWidth="1.5"/>
          </svg>
        </div>

        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <p className="font-cera-pro font-bold text-[14px] text-[#254333] leading-[1.3]">
            Faltam R$ {formatBRL(amountRemaining)} para frete grátis
          </p>
          <p className="font-cera-pro font-light text-[12px] text-[#666666] leading-[1.4]">
            Adicione mais produtos ao carrinho e ganhe frete grátis na opção Econômica acima de <strong className="font-medium text-[#333333]">R$ {threshold}</strong>.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-[4px] w-full">
        <div className="w-full h-[8px] bg-[#d2d2d2] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#009142] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="font-cera-pro font-light text-[11px] text-[#009142] leading-normal text-right">
          R$ {formatBRL(subtotal)} / R$ {formatBRL(threshold)}
        </p>
      </div>
    </div>
  );
}
