"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useCart, useShipping } from "@/contexts";
import { FreightOptions } from "@/components/figma-shared";

interface FallbackProduct {
  quantity: number;
  peso_gramas: number;
  altura: number;
  largura: number;
  comprimento: number;
  bling_number?: string;
  preco: number;
}

interface ShippingCalculatorProps {
  title?: string;
  buttonLabel?: string;
  placeholder?: string;
  inputFontSize?: 'small' | 'large';
  width?: 'full' | 'fixed';
  fallbackProduct?: FallbackProduct;
  variant?: 'cart' | 'pdp';
}

export function ShippingCalculator({
  title = "Calcule o frete",
  buttonLabel = "Calcular",
  placeholder = "Digite seu CEP",
  inputFontSize = 'large',
  width = 'full',
  fallbackProduct,
  variant = 'pdp',
}: ShippingCalculatorProps) {
  const { cart } = useCart();
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
    addressLabel,
  } = useShipping();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  // Itens efetivos: carrinho, ou produto fallback (PDP) quando carrinho vazio
  const getEffectiveItems = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length > 0) return cartItems;
    if (fallbackProduct) return [fallbackProduct];
    return [];
  };

  // Chave estável: só muda quando itens, quantidades ou preços mudam
  // Flags de cupom (cupom_applied, tag_desconto_*) não afetam o frete
  const cartFreightKey = useMemo(() => {
    const items = Object.entries(cart).map(([id, item]: [string, any]) =>
      `${id}:${item.quantity}:${item.preco}`
    );
    items.sort();
    return items.join('|');
  }, [cart]);

  // Recalcular frete automaticamente quando itens/quantidades/preços mudam
  useEffect(() => {
    const items = getEffectiveItems();

    // Se não tem itens (carrinho vazio e sem fallback), limpar valores de frete
    if (items.length === 0) {
      resetFreight();
      return;
    }

    // Se tem CEP e já calculou antes, recalcular silenciosamente
    if (cep && hasCalculated) {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        console.log(`📦 [SHIPPING-CALC] Recalculando frete — cartFreightKey mudou, CEP: ${cleanCep}`);
        calculateFreight(cep, items, { silent: true });
      }
    }
  }, [cartFreightKey]);

  // Auto-calcular quando CEP tiver 8 dígitos
  useEffect(() => {
    const items = getEffectiveItems();
    const cleanCep = cep.replace(/\D/g, '');

    // Se não tem itens, não calcular
    if (items.length === 0) {
      return;
    }

    // Se CEP tiver 8 dígitos e ainda não calculou, calcular automaticamente (silencioso)
    if (cleanCep.length === 8 && !hasCalculated) {
      console.log(`📦 [SHIPPING-CALC] Auto-calculando frete — CEP completo: ${cleanCep}, hasCalculated: false`);
      calculateFreight(cep, items, { silent: true });
    }
  }, [cep]);

  const handleCalculate = () => {
    if (cep) {
      const items = getEffectiveItems();
      calculateFreight(cep, items);
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
    try {
      localStorage.removeItem("love_cosmetics_last_cep");
      localStorage.removeItem("love_cosmetics_freight_data");
    } catch {
      // ignore
    }
  };

  const selectedService = availableServices[selectedServiceIndex];

  const cleanCep = cep.replace(/\D/g, '');

  // Carrinho: sempre selecionar a opção de menor valor (sem mostrar lista)
  useEffect(() => {
    if (variant !== "cart") return;
    if (!hasCalculated) return;
    if (error) return;
    if (availableServices.length === 0) return;

    const cheapestIndex = availableServices.reduce((minIndex, service, index) => {
      if (service.price < availableServices[minIndex].price) return index;
      return minIndex;
    }, 0);

    if (selectedServiceIndex === cheapestIndex) return;
    const cheapest = availableServices[cheapestIndex];
    setSelectedFreight(cheapest.price, cheapest.deliveryTime, cheapestIndex);
  }, [
    variant,
    hasCalculated,
    error,
    availableServices,
    selectedServiceIndex,
    setSelectedFreight,
  ]);

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

        {(cep.length > 0 || hasCalculated) && (
          <button
            type="button"
            onClick={handleClearCep}
            aria-label="Limpar CEP"
            className="h-[32px] w-[32px] flex items-center justify-center text-[#666666] hover:text-[#111111] flex-shrink-0 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        <button
          onClick={handleCalculate}
          disabled={isLoading || cleanCep.length < 8}
          className="bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999] flex flex-col h-[32px] items-center justify-center overflow-hidden rounded-[4px] flex-shrink-0 transition-colors"
        >
          <div className="flex gap-[8px] items-center justify-center px-3 md:px-[16px] py-[10px]">
            <p className="font-cera-pro font-medium text-sm md:text-[16px] text-white leading-[1.257] whitespace-nowrap tracking-[0px]">
              {buttonLabel}
            </p>
          </div>
        </button>
      </div>

      {/* Barra de carregamento */}
      {isLoading && (
        <div className="w-full h-[3px] bg-[#E0E0E0] rounded-full overflow-hidden -mt-[8px]">
          <div className="h-full bg-[#009142] rounded-full animate-shimmer" />
        </div>
      )}

      {/* Endereço resumido - logo abaixo do input */}
      {addressLabel && hasCalculated && !error && (
        <div className="flex items-start gap-[6px] w-full -mt-[8px]">
          <Image
            src="/new-home/icons/location.svg"
            alt="Localização"
            width={16}
            height={16}
            className="w-4 h-4 flex-shrink-0 mt-[1px]"
          />
          <p className="font-cera-pro font-light text-[14px] text-[#333333] leading-[1.4]">
            {addressLabel}
          </p>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="flex gap-[8px] items-center w-full bg-red-50 rounded-lg p-3">
          <p className="font-cera-pro font-light text-[14px] text-[#B3261E] leading-[1.257]">
            {error}
          </p>
        </div>
      )}

      {/* Opções de Frete Disponíveis */}
      {variant !== "cart" && hasCalculated && !error && availableServices.length > 0 && (
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

      {/* Carrinho: mostrar apenas o menor frete */}
      {variant === "cart" && hasCalculated && !error && selectedService && (
        <div className="mt-1 p-3 bg-[#F0F9F4] rounded-lg border border-[#009142] w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/new-home/icons/verified-green.svg"
              alt="Verificado"
              width={16}
              height={16}
              className="w-4 h-4 flex-shrink-0"
            />
            <p className="font-cera-pro font-light text-[12px] text-[#009142] leading-[1.257]">
              até {selectedService.deliveryTime} dia(s) úteis - {formatPrice(selectedService.price)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
