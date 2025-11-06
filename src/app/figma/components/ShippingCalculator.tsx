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

  // Auto-calculate when CEP has 8 digits
  const handleCepChange = (value: string) => {
    const formattedCep = value.replace(/\D/g, "").slice(0, 8);
    setCep(formattedCep);

    // Se tiver menos de 8 dígitos, volta ao estado inicial
    if (formattedCep.length < 8) {
      setAddress("");
      setShippingOptions([]);
      setLoading(false);
      return;
    }

    // Se tiver 8 dígitos, calcula automaticamente
    if (formattedCep.length === 8 && !loading) {
      setLoading(true);
      setTimeout(() => {
        // Mock data
        setShippingOptions([
          { type: "Normal", time: "5 a 6 dias úteis", price: "Grátis" },
          { type: "Expressa", time: "Receba amanhã", price: "R$ 14,99" },
        ]);
        // Mock address
        setAddress("Rua Emília Marengo - Vila Regente Feijó, São Paulo - SP");
        setLoading(false);
      }, 300);
    }
  };

  return (
    <div className="flex flex-col gap-[16px] items-start w-full">
      {/* Title - Frame 7149 */}
      <p className="font-cera-pro font-bold text-[24px] text-black leading-[normal] w-full">
        Calcule o frete
      </p>

      {/* Input Container - Frame 7150 */}
      <div className="bg-white border border-[#d2d2d2] flex items-center justify-between p-[8px] rounded-[8px] w-full">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(e) => handleCepChange(e.target.value)}
          maxLength={8}
          className="flex-1 font-cera-pro font-light text-[20px] text-black leading-[normal] px-[8px] py-0 focus:outline-none bg-transparent"
        />
        <button
          onClick={handleCalculate}
          disabled={loading || cep.length < 8}
          className="bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999] flex flex-col h-[32px] items-center justify-center overflow-hidden rounded-[4px] flex-shrink-0 transition-colors"
        >
          <div className="flex gap-[8px] items-center justify-center px-[16px] py-[10px]">
            <p className="font-cera-pro font-medium text-[16px] text-white leading-[normal] text-nowrap tracking-[0px]">
              Calcular
            </p>
          </div>
        </button>
      </div>

      {/* Address Info - Frame 7151 */}
      {address && (
        <div className="flex gap-[8px] items-center w-full">
          <div className="flex flex-col items-start overflow-hidden flex-shrink-0">
            <div className="relative size-[16px]">
              <Image
                src="/new-home/icons/location.svg"
                alt="Localização"
                width={16}
                height={16}
                className="w-full h-full"
              />
            </div>
          </div>
          <p className="flex-1 font-cera-pro font-light text-[14px] text-[#111111] leading-[normal]">
            {address}
          </p>
        </div>
      )}

      {/* Shipping Options - Frame 7154 */}
      {shippingOptions.length > 0 && (
        <div className="flex flex-col items-start w-full">
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              className="border-b border-[#d2d2d2] flex gap-[16px] items-end leading-[normal] px-0 py-[16px] text-[14px] text-nowrap w-full whitespace-pre"
            >
              {/* Type + Time */}
              <div className="flex-1 flex gap-[6px] items-center text-[#111111]">
                <p className="font-cera-pro font-medium text-[14px] leading-[normal]">
                  {option.type}
                </p>
                <p className="font-cera-pro font-light text-[14px] leading-[normal]">
                  {option.time}
                </p>
              </div>

              {/* Price */}
              <p
                className={`font-cera-pro font-medium text-[14px] leading-[normal] text-right ${
                  option.price === "Grátis"
                    ? "text-[#009142]"
                    : "text-[#111111]"
                }`}
              >
                {option.price}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
