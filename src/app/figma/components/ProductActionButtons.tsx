"use client";

import { useState } from "react";

interface ProductActionButtonsProps {
  productId?: string;
  onBuy?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

export function ProductActionButtons({
  productId = "",
  onBuy,
  onAddToCart,
}: ProductActionButtonsProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      onBuy?.(productId);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      onAddToCart?.(productId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-[16px]">
      {/* Buy Button */}
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full px-[16px] py-[16px] bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999] text-white rounded-[8px] font-cera-pro font-medium text-[14px] transition-colors"
      >
        {loading ? "Processando..." : "Comprar"}
      </button>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="w-full px-[16px] py-[16px] bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999] text-white rounded-[8px] font-cera-pro font-medium text-[14px] transition-colors"
      >
        {loading ? "Adicionando..." : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
