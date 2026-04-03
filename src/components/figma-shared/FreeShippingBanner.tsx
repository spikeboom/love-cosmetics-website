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
  if (qualifies) {
    return (
      <div className="flex flex-col gap-[8px] p-[12px] rounded-[8px] bg-[#F0F9F4] border border-[#009142]">
        <p className="font-cera-pro font-medium text-[14px] text-[#009142] leading-normal">
          Parabéns! Você ganhou frete grátis
        </p>
        <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-normal">
          Sua compra acima de R$ {FREE_SHIPPING_THRESHOLD} garante frete grátis na opção Econômica.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[8px] p-[12px] rounded-[8px] bg-[#FFF8E1] border border-[#F5B100]">
      <p className="font-cera-pro font-medium text-[14px] text-[#333333] leading-normal">
        Faltam R$ {amountRemaining.toFixed(2).replace(".", ",")} para frete grátis
      </p>
      <p className="font-cera-pro font-light text-[12px] text-[#666666] leading-normal">
        Adicione mais produtos ao carrinho e ganhe frete grátis na opção Econômica acima de R$ {FREE_SHIPPING_THRESHOLD}.
      </p>
      <div className="w-full h-[6px] bg-[#E0E0E0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#009142] rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="font-cera-pro font-light text-[11px] text-[#999999] leading-normal text-right">
        R$ {subtotal.toFixed(2).replace(".", ",")} / R$ {FREE_SHIPPING_THRESHOLD},00
      </p>
    </div>
  );
}
