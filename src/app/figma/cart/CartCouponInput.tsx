'use client';

import { useState } from 'react';

interface CartCouponInputProps {
  onApply?: (cupom: string) => void;
}

export function CartCouponInput({ onApply }: CartCouponInputProps) {
  const [cupom, setCupom] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cupom.trim()) {
      onApply?.(cupom);
    }
  };

  return (
    <div className="flex w-[447px] flex-col gap-4">
      <h3 className="w-full font-cera-pro text-xl font-bold leading-[1.257] text-black">
        Cupom de desconto
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={cupom}
          onChange={(e) => setCupom(e.target.value)}
          placeholder="Digite seu cupom"
          className="flex items-center justify-between gap-[5px] self-stretch rounded-lg border border-[#D2D2D2] bg-white px-2 py-2 font-cera-pro text-sm placeholder-gray-400 focus:outline-none focus:border-[#254333]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#254333] px-4 py-2 font-cera-pro text-sm font-medium text-white hover:bg-[#1a3023] transition-colors"
        >
          Aplicar cupom
        </button>
      </form>
    </div>
  );
}
