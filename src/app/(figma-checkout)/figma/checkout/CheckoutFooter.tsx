"use client";

import Image from "next/image";

export function CheckoutFooter() {
  return (
    <footer className="w-full bg-[#254333]">
      {/* Footer branco com meios de pagamento */}
      <div className="bg-[#f8f3ed] w-full py-6 lg:py-[32px] px-4">
        <div className="flex gap-6 lg:gap-[40px] items-center justify-center">
          {/* Elo */}
          <div className="relative h-[18px] w-[48px] lg:h-[22px] lg:w-[56px]">
            <Image
              src="/new-home/footer/elo.png"
              alt="Elo"
              fill
              className="object-contain"
            />
          </div>

          {/* Mastercard */}
          <div className="relative h-[20px] w-[26px] lg:h-[24px] lg:w-[32px]">
            <Image
              src="/new-home/footer/mastercard.png"
              alt="Mastercard"
              fill
              className="object-contain"
            />
          </div>

          {/* Visa */}
          <div className="relative h-[12px] w-[38px] lg:h-[14px] lg:w-[46px]">
            <Image
              src="/new-home/footer/visa.png"
              alt="Visa"
              fill
              className="object-contain"
            />
          </div>

          {/* Amex */}
          <div className="relative h-[24px] w-[24px] lg:h-[28px] lg:w-[28px]">
            <Image
              src="/new-home/footer/amex.png"
              alt="American Express"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
