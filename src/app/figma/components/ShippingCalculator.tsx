"use client";

import { useState } from "react";
import Image from "next/image";

interface ShippingOption {
  type: string;
  time: string;
  price: string;
}

interface ShippingCalculatorProps {
  productId?: string;
  onCalculate?: (cep: string) => Promise<ShippingOption[]>;
}

export function ShippingCalculator({
  productId,
  onCalculate,
}: ShippingCalculatorProps) {
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string>("");

  const handleCalculate = async () => {
    if (!cep || cep.length < 8) {
      return;
    }

    setLoading(true);
    try {
      if (onCalculate) {
        const options = await onCalculate(cep);
        setShippingOptions(options);
      } else {
        // Mock data
        setShippingOptions([
          { type: "Normal", time: "5 a 6 dias úteis", price: "Grátis" },
          { type: "Expressa", time: "Receba amanhã", price: "R$ 14,99" },
        ]);
      }
      // Mock address
      setAddress("Rua Emília Marengo - Vila Regente Feijó, São Paulo - SP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-[16px]">
      {/* Title */}
      <label className="font-cera-pro font-medium text-[14px] text-[#254333]">
        Calcule o frete
      </label>

      {/* Input Group */}
      <div className="flex flex-col gap-[12px]">
        <input
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 8);
            setCep(value);
          }}
          className="w-full px-[16px] py-[12px] border border-[#ddd] rounded-[8px] font-cera-pro text-[14px] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#254333] focus:border-transparent"
        />
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full px-[16px] py-[12px] bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999] text-white rounded-[8px] font-cera-pro font-medium text-[14px] transition-colors"
        >
          {loading ? "Calculando..." : "Calcular"}
        </button>
      </div>

      {/* Address Info */}
      {address && (
        <div className="flex gap-[12px] items-start p-[12px] bg-[#f8f3ed] rounded-[8px]">
          <Image
            src="/new-home/icons/location.svg"
            alt="Localização"
            width={16}
            height={16}
            className="flex-shrink-0 mt-[4px]"
          />
          <span className="font-cera-pro font-light text-[12px] text-[#666666]">
            {address}
          </span>
        </div>
      )}

      {/* Shipping Options */}
      {shippingOptions.length > 0 && (
        <div className="flex flex-col gap-[16px]">
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-[16px] border border-[#e0e0e0] rounded-[8px] hover:border-[#254333] transition-colors cursor-pointer"
            >
              <div className="flex flex-col gap-[4px]">
                <p className="font-cera-pro font-medium text-[13px] text-[#333333]">
                  {option.type}
                </p>
                <p className="font-cera-pro font-light text-[12px] text-[#999999]">
                  {option.time}
                </p>
              </div>
              <p className="font-cera-pro font-medium text-[13px] text-[#254333]">
                {option.price}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
