"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useMeuContexto } from "@/components/common/Context/context";
import { FreightOptions } from "./FreightOptions";

interface ShippingCalculatorProps {
  title?: string;
  buttonLabel?: string;
  placeholder?: string;
  inputFontSize?: 'small' | 'large';
  width?: 'full' | 'fixed';
}

export function ShippingCalculator({
  title = "Calcule o frete",
  buttonLabel = "Calcular",
  placeholder = "Digite seu CEP",
  inputFontSize = 'large',
  width = 'full',
}: ShippingCalculatorProps) {
  const { freight, cart } = useMeuContexto();
  const {
    cep,
    setCep,
    isLoading,
    error,
    calculateFreight,
    hasCalculated,
    availableServices,
    setSelectedFreight,
    resetFreight,
    selectedServiceIndex,
  } = freight;

  // Recalcular frete automaticamente quando o carrinho mudar
  useEffect(() => {
    const cartItems = Object.values(cart);

    // Se carrinho estiver vazio, limpar valores de frete
    if (cartItems.length === 0) {
      resetFreight();
      return;
    }

    // Se tem CEP e já calculou antes, recalcular
    if (cep && hasCalculated) {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        calculateFreight(cep, cartItems);
      }
    }
  }, [cart]);

  // Auto-calcular quando CEP tiver 8 dígitos
  useEffect(() => {
    const cartItems = Object.values(cart);
    const cleanCep = cep.replace(/\D/g, '');

    // Se carrinho estiver vazio, não calcular
    if (cartItems.length === 0) {
      return;
    }

    // Se CEP tiver 8 dígitos e ainda não calculou, calcular automaticamente
    if (cleanCep.length === 8 && !hasCalculated) {
      calculateFreight(cep, cartItems);
    }
  }, [cep]);

  const handleCalculate = () => {
    if (cep) {
      const cartItems = Object.values(cart);
      calculateFreight(cep, cartItems);
    }
  };

  const handleSelectService = (index: number) => {
    const service = availableServices[index];
    if (service) {
      setSelectedFreight(service.price, service.deliveryTime, index);
    }
  };

  const handleClearCep = () => {
    setCep('');
    resetFreight();
  };

  const selectedService = availableServices[selectedServiceIndex];

  const cleanCep = cep.replace(/\D/g, '');

  return (
    <div className={`flex flex-col gap-[16px] items-start w-full ${width === 'fixed' ? 'md:w-[447px]' : ''}`}>
      {/* Title - Frame 7149 */}
      <p className="font-cera-pro font-bold text-[20px] text-black leading-[1.257] w-full">
        {title}
      </p>

      {/* Input Container - Frame 7150 */}
      <div className="bg-white border border-[#d2d2d2] flex items-center justify-between p-[8px] rounded-[8px] w-full">
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          maxLength={9}
          className={`flex-1 font-cera-pro font-light ${
            inputFontSize === 'small' ? 'text-[14px]' : 'text-base md:text-[20px]'
          } text-black leading-[1.257] px-[8px] py-0 focus:outline-none bg-transparent min-w-0`}
        />

        {/* Botão Limpar CEP (aparece quando tem CEP) */}
        {cep && (
          <button
            onClick={handleClearCep}
            className="text-[#B3261E] hover:text-[#8a1c17] px-1 md:px-2 text-[11px] md:text-[12px] font-cera-pro font-light underline whitespace-nowrap flex-shrink-0"
          >
            Limpar
          </button>
        )}

        <button
          onClick={handleCalculate}
          disabled={isLoading || cleanCep.length < 8}
          className="bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999] flex flex-col h-[32px] items-center justify-center overflow-hidden rounded-[4px] flex-shrink-0 transition-colors"
        >
          <div className="flex gap-[8px] items-center justify-center px-3 md:px-[16px] py-[10px]">
            <p className="font-cera-pro font-medium text-sm md:text-[16px] text-white leading-[1.257] whitespace-nowrap tracking-[0px]">
              {isLoading ? 'Calculando...' : buttonLabel}
            </p>
          </div>
        </button>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="flex gap-[8px] items-center w-full bg-red-50 rounded-lg p-3">
          <p className="font-cera-pro font-light text-[14px] text-[#B3261E] leading-[1.257]">
            {error}
          </p>
        </div>
      )}

      {/* Opções de Frete Disponíveis */}
      {hasCalculated && !error && availableServices.length > 0 && (
        <div className="flex flex-col gap-[8px] items-start w-full">
          <p className="font-cera-pro font-medium text-[14px] text-[#111111] leading-[normal]">
            Selecione a forma de envio:
          </p>

          <FreightOptions
            services={availableServices}
            selectedIndex={selectedServiceIndex}
            onSelect={handleSelectService}
            radioName="freight-option-cart"
          />

          {/* Resumo do frete selecionado */}
          {selectedService && (
            <div className="mt-2 p-3 bg-[#F0F9F4] rounded-lg border border-[#009142] w-full">
              <div className="flex items-center gap-2">
                <Image
                  src="/new-home/icons/verified-green.svg"
                  alt="Verificado"
                  width={16}
                  height={16}
                  className="w-4 h-4 flex-shrink-0"
                />
                <p className="font-cera-pro font-light text-[12px] text-[#009142] leading-[1.257]">
                  CEP {cep} - {selectedService.carrier} - Entrega em {selectedService.deliveryTime} {selectedService.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
