"use client";

import { LuTruck } from "react-icons/lu";
import { useState, useEffect } from "react";
import { CepInput } from "./CepInput";
import { formatPrice } from "@/utils/format-price";
import { useMeuContexto } from "@/components/common/Context/context";

export function FreightSection() {
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
  } = freight;

  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);

  // Resetar seleção quando calcular novo frete
  useEffect(() => {
    if (hasCalculated && availableServices.length > 0) {
      setSelectedServiceIndex(0); // Selecionar o primeiro (mais barato) por padrão
    }
  }, [hasCalculated, availableServices.length]);

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
      calculateFreight(cep, cartItems);
    }
  }, [cart]); // Recalcula quando cart mudar (adicionar/remover/mudar quantidade)

  const handleCalculate = () => {
    if (cep) {
      const cartItems = Object.values(cart);
      calculateFreight(cep, cartItems);
    }
  };

  const handleSelectService = (index: number) => {
    setSelectedServiceIndex(index);
    const service = availableServices[index];
    if (service) {
      setSelectedFreight(service.price, service.deliveryTime, index);
    }
  };

  const selectedService = availableServices[selectedServiceIndex];

  return (
    <div className="border-t pt-3">
      <CepInput
        value={cep}
        onChange={setCep}
        onCalculate={handleCalculate}
        isLoading={isLoading}
        error={error}
        hasCalculated={hasCalculated}
      />

      {/* Mostrar todas as opções de frete */}
      {hasCalculated && !error && availableServices.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[12px] font-semibold text-gray-700 mb-2">
            Selecione a forma de envio:
          </p>

          {availableServices.map((service, index) => (
            <label
              key={service.serviceCode}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                selectedServiceIndex === index
                  ? 'border-[#7045f5] bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="radio"
                  name="freight-option"
                  checked={selectedServiceIndex === index}
                  onChange={() => handleSelectService(index)}
                  className="w-4 h-4 text-[#7045f5] focus:ring-[#7045f5]"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <LuTruck className="text-[#7045f5]" size={16} />
                    <span className="font-semibold text-[13px]">
                      {service.carrier}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      ({service.service})
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 mt-1">
                    Entrega em {service.deliveryTime} {service.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}
                  </p>
                </div>
              </div>

              <div className="text-right ml-2">
                <p className="font-bold text-[14px] text-[#7045f5]">
                  {formatPrice(service.price)}
                </p>
              </div>
            </label>
          ))}

          {/* Resumo do frete selecionado */}
          {selectedService && (
            <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-200">
              <p className="text-[11px] text-green-700">
                ✓ CEP {cep} - {selectedService.carrier} - Entrega em {selectedService.deliveryTime} {selectedService.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}