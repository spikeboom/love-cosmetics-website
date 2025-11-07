'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CartCouponInputProps {
  onApply: (cupom: string) => Promise<void>;
  cupons: any[];
}

export function CartCouponInput({ onApply, cupons }: CartCouponInputProps) {
  const [cupom, setCupom] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasAppliedCoupons = cupons && cupons.length > 0;

  const handleApply = async () => {
    if (cupom.trim() && !isLoading) {
      setIsLoading(true);
      try {
        await onApply(cupom);
        setCupom('');
      } catch (error) {
        console.error('Erro ao aplicar cupom:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
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
            value={cupom}
            onChange={(e) => setCupom(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Digite o cupom"
            disabled={isLoading}
            className="font-cera-pro font-light text-[20px] text-black leading-[1.257] focus:outline-none bg-transparent placeholder:font-light disabled:cursor-wait"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleApply}
          disabled={!cupom.trim() || isLoading}
          className="bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999] flex flex-col h-[32px] items-center justify-center overflow-hidden rounded-[4px] flex-shrink-0 transition-colors"
        >
          <div className="flex gap-[8px] items-center justify-center px-[16px] py-[10px]">
            <p className="font-cera-pro font-medium text-[16px] text-white leading-[1.257] text-nowrap tracking-[0px]">
              {isLoading ? 'Aplicando...' : 'Aplicar'}
            </p>
          </div>
        </button>
      </div>

      {/* Success Message - Cupons Aplicados */}
      {hasAppliedCoupons && cupons.map((c: any, index: number) => (
        <div key={index} className="flex gap-[8px] items-center w-full">
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
            Cupom {c.nome || c.codigo} aplicado com sucesso!
          </p>
        </div>
      ))}
    </div>
  );
}
