'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CartCouponInputProps {
  onApply?: (cupom: string) => void;
  onRemove?: () => void;
}

export function CartCouponInput({ onApply, onRemove }: CartCouponInputProps) {
  const [cupom, setCupom] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const handleApply = () => {
    if (cupom.trim()) {
      setAppliedCoupon(cupom);
      setIsApplied(true);
      onApply?.(cupom);
    }
  };

  const handleRemove = () => {
    setCupom('');
    setAppliedCoupon('');
    setIsApplied(false);
    onRemove?.();
  };

  return (
    <div className="flex flex-col gap-[16px] items-start w-[447px]">
      {/* Title */}
      <h3 className="font-cera-pro font-bold text-[20px] text-black leading-[1.257] w-full">
        Cupom de desconto
      </h3>

      {/* Input Container - Frame 233:11701 */}
      <div className="bg-white border border-[#d2d2d2] flex items-center justify-between gap-[5px] p-[8px] rounded-[8px] w-full">
        {/* Input Text */}
        <div className="flex items-center justify-center gap-[10px] px-[8px]">
          <input
            type="text"
            value={isApplied ? appliedCoupon : cupom}
            onChange={(e) => !isApplied && setCupom(e.target.value.toUpperCase())}
            placeholder="Digite o cupom"
            disabled={isApplied}
            className={`font-cera-pro font-light ${
              isApplied ? 'text-[14px]' : 'text-[20px]'
            } text-black leading-[1.257] focus:outline-none bg-transparent placeholder:font-light ${
              isApplied ? 'cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* Button */}
        <button
          onClick={isApplied ? handleRemove : handleApply}
          disabled={!isApplied && !cupom.trim()}
          className="bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999] flex flex-col h-[32px] items-center justify-center overflow-hidden rounded-[4px] flex-shrink-0 transition-colors"
        >
          <div className="flex gap-[8px] items-center justify-center px-[16px] py-[10px]">
            <p className="font-cera-pro font-medium text-[16px] text-white leading-[1.257] text-nowrap tracking-[0px]">
              {isApplied ? 'Remover' : 'Aplicar'}
            </p>
          </div>
        </button>
      </div>

      {/* Success Message - Frame 233:11702 */}
      {isApplied && (
        <div className="flex gap-[8px] items-center w-full">
          <div className="flex-shrink-0 size-[16px]">
            <Image
              src="/new-home/icons/verified-green.svg"
              alt="Verificado"
              width={16}
              height={16}
              className="w-full h-full"
            />
          </div>
          <p className="flex-1 font-cera-pro font-light text-[14px] text-[#009142] leading-[1.257]">
            Cupom aplicado com sucesso!
          </p>
        </div>
      )}
    </div>
  );
}
